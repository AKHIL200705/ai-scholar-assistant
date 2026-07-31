import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bookmark, Camera, Copy, Images, ScanText, UploadCloud } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { extractTextFromImage } from "@/lib/ai-service";
import { saveAnswerToSupabase } from "@/lib/supabase-service";

export const Route = createFileRoute("/app/image")({
  head: () => ({
    meta: [
      { title: "Upload Image — AI Doubt Resolution Assistant" },
      { name: "description", content: "Scan handwritten or printed questions and extract text with AI OCR." },
      { property: "og:title", content: "Upload Image — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Snap a question, get instant extracted text and answers." },
    ],
  }),
  component: ImagePage,
});

function ImagePage() {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("physics-question.jpg");
  const [ocrData, setOcrData] = useState<{ extractedText: string; solution: string } | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function runWithFile(file?: File) {
    const name = file ? file.name : "question-scan.jpg";
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setImageName(file.name);
      toast.success(`Loaded image: ${file.name}`);
    }
    setState("processing");
    try {
      const data = await extractTextFromImage(name);
      setOcrData(data);
      setState("done");
      toast.success("Text extracted & solution calculated with AI OCR!");
    } catch {
      toast.error("Failed to extract text from image.");
      setState("idle");
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      runWithFile(file);
    }
  }

  async function handleBookmark() {
    if (!ocrData) return;
    await saveAnswerToSupabase("Scanned Question from Image", ocrData.solution, "Physics");
    toast.success("Saved solution to your Supabase revision library!");
  }

  return (
    <PageShell title="Upload Image" subtitle="Scan a question from your notes or textbook.">
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          runWithFile(file);
        }}
        className="glass flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/40 p-12 text-center"
      >
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
          <UploadCloud className="h-14 w-14 text-accent" />
        </motion.div>
        <p className="mt-4 font-display text-lg font-semibold">Drag & drop an image</p>
        <p className="mt-1 text-sm text-muted-foreground">JPG, PNG or HEIC up to 10 MB</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            className="gradient-brand border-0 text-primary-foreground glow-ring hover-lift"
          >
            <Camera className="mr-1 h-4 w-4" /> Camera
          </Button>
          <Button
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
            className="border-glass-border bg-glass hover-lift"
          >
            <Images className="mr-1 h-4 w-4" /> Gallery
          </Button>
        </div>
      </div>

      {state !== "idle" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass overflow-hidden rounded-3xl p-4">
            <div className="flex items-center gap-2 pb-3 text-xs font-semibold text-muted-foreground">
              <ScanText className="h-4 w-4 text-primary" /> Image Preview ({imageName})
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center">
              {imageSrc ? (
                <img src={imageSrc} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <Camera className="mx-auto h-12 w-12 text-primary/40" />
                  <p className="mt-2 text-xs text-muted-foreground">Simulated OCR scanning mode</p>
                </div>
              )}
              {state === "processing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-3 text-xs font-medium text-white">AI OCR scanning & parsing math formulas...</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass space-y-4 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Extracted Text & AI Solution</h3>
              {state === "done" && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (ocrData) {
                        navigator.clipboard.writeText(ocrData.extractedText + "\n\n" + ocrData.solution);
                        toast.success("Copied OCR text & solution to clipboard!");
                      }
                    }}
                    className="h-8 rounded-lg border-glass-border bg-glass text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBookmark}
                    className="h-8 rounded-lg border-glass-border bg-glass text-xs"
                  >
                    <Bookmark className="mr-1 h-3 w-3 text-primary" /> Save
                  </Button>
                </div>
              )}
            </div>

            {state === "processing" ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : ocrData ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-glass-border bg-muted/40 p-3 text-xs font-mono">
                  <p className="font-semibold text-primary mb-1">OCR Scanned Question:</p>
                  {ocrData.extractedText}
                </div>
                <div className="whitespace-pre-line rounded-xl border border-glass-border bg-glass p-4 text-xs leading-relaxed">
                  {ocrData.solution}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </PageShell>
  );
}