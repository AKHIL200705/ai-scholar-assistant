import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Camera, Images, ScanText, UploadCloud } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ocrText } from "@/data/mock";

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

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function runWithFile(file?: File) {
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setImageName(file.name);
      toast.success(`Loaded image: ${file.name}`);
    }
    setState("processing");
    setTimeout(() => {
      setState("done");
      toast.success("Text extracted with AI OCR!");
    }, 1800);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      runWithFile(file);
    }
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

      {state !== "idle" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Preview</p>
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
              {imageSrc ? (
                <img src={imageSrc} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 gradient-brand opacity-20" />
                  <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                    {imageName}
                  </div>
                </>
              )}
              {state === "processing" ? (
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute left-0 h-1 w-full bg-accent shadow-[0_0_20px_var(--accent)]"
                />
              ) : null}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanText className="h-5 w-5 text-accent" />
                <p className="font-display font-semibold">Extracted text</p>
              </div>
              {state === "done" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-glass-border"
                  onClick={() => {
                    navigator.clipboard.writeText(ocrText);
                    toast.success("OCR text copied to clipboard!");
                  }}
                >
                  Copy text
                </Button>
              )}
            </div>
            {state === "processing" ? (
              <div className="mt-4 space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm leading-relaxed">
                {ocrText}
              </pre>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}