import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizePDF } from "@/lib/ai-service";

export const Route = createFileRoute("/app/pdf")({
  head: () => ({
    meta: [
      { title: "Upload PDF — AI Doubt Resolution Assistant" },
      { name: "description", content: "Upload lecture notes or textbooks and get AI chapter summaries." },
      { property: "og:title", content: "Upload PDF — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Turn any PDF into structured chapter summaries." },
    ],
  }),
  component: PdfPage,
});

function PdfPage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [aiChapters, setAiChapters] = useState<{ name: string; pages: string; summary: string }[]>([]);
  const [fileName, setFileName] = useState("Physics-Class12-Mechanics.pdf");
  const [fileSize, setFileSize] = useState("4.8 MB");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uploading) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setUploading(false);
          setDone(true);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(id);
  }, [uploading]);

  function startWithFile(file?: File) {
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      toast.success(`Selected ${file.name}`);
    }
    setProgress(0);
    setDone(false);
    setAiChapters([]);
    setUploading(true);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      startWithFile(file);
    }
  }

  async function handleSummarize() {
    setSummarising(true);
    try {
      const res = await summarizePDF(fileName);
      setAiChapters(res);
      toast.success("AI chapter breakdown generated!");
    } catch {
      toast.error("Failed to generate PDF summary.");
    } finally {
      setSummarising(false);
    }
  }

  return (
    <PageShell title="Upload PDF" subtitle="Drop a textbook or notes and let AI break it down.">
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          startWithFile(file);
        }}
        className="glass flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 p-10 text-center"
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <UploadCloud className="h-14 w-14 text-primary" />
        </motion.div>
        <p className="mt-4 font-display text-lg font-semibold">Drag & drop your PDF here</p>
        <p className="mt-1 text-sm text-muted-foreground">Max 25 MB · PDF only</p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 gradient-brand border-0 text-primary-foreground glow-ring hover-lift"
        >
          Browse files
        </Button>
      </div>

      {(uploading || done) && (
        <div className="glass rounded-2xl p-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <FileText className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">{fileSize} · Ready for AI processing</p>
            </div>
            <span className="shrink-0 text-sm font-semibold">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-brand transition-all" style={{ width: `${progress}%` }} />
          </div>

          {done && aiChapters.length === 0 && (
            <Button
              disabled={summarising}
              onClick={handleSummarize}
              className="mt-5 w-full gradient-brand border-0 text-primary-foreground hover-lift"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {summarising ? "AI analyzing document..." : "Generate AI Chapter Breakdown"}
            </Button>
          )}
        </div>
      )}

      {summarising && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {aiChapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold">AI Chapter Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {aiChapters.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass space-y-2 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pages {c.pages}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Summary</span>
                </div>
                <h3 className="font-display font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}