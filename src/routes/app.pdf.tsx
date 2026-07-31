import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { chapters } from "@/data/mock";

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
  const [summary, setSummary] = useState(false);
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
    setSummary(false);
    setUploading(true);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      startWithFile(file);
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
          {done ? (
            <Button
              onClick={() => {
                setSummarising(true);
                setTimeout(() => {
                  setSummarising(false);
                  setSummary(true);
                  toast.success("AI Summary generated!");
                }, 1500);
              }}
              className="mt-4 gradient-brand border-0 text-primary-foreground hover-lift"
            >
              <Sparkles className="mr-1 h-4 w-4" /> Generate summary
            </Button>
          ) : null}
        </div>
      )}

      {summarising ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass hover-lift rounded-2xl p-5"
            >
              <p className="font-display font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-primary">Pages {c.pages}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.summary}</p>
            </motion.div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}