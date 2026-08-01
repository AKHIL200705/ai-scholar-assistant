import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bookmark, Download, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savedAnswers as mockSaved } from "@/data/mock";
import { supabase } from "@/lib/supabase";
import {
  deleteSavedAnswerFromSupabase,
  fetchSavedAnswersFromSupabase,
  type SavedAnswer,
} from "@/lib/supabase-service";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved Answers — AI Doubt Resolution Assistant" },
      { name: "description", content: "Revisit, search and export the answers you bookmarked." },
      { property: "og:title", content: "Saved Answers — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Your bookmarked AI explanations in one place." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SavedAnswer[]>(mockSaved);
  const [subject, setSubject] = useState("All");

  useEffect(() => {
    fetchSavedAnswersFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setItems(data);
      }
    });

    const channel = supabase
      .channel("realtime-saved-answers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saved_answers" },
        () => {
          fetchSavedAnswersFromSupabase().then((data) => {
            if (data) setItems(data);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const subjects = ["All", ...Array.from(new Set(items.map((a) => a.subject)))];

  const filtered = items.filter(
    (a) =>
      (subject === "All" || a.subject === subject) &&
      a.question.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleDelete(id: string) {
    await deleteSavedAnswerFromSupabase(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast.success("Removed answer from saved list.");
  }

  return (
    <PageShell
      title="Saved Answers"
      subtitle="Everything you bookmarked, ready to revise."
      action={
        <Button
          onClick={() => {
            toast.info("Preparing PDF layout for print/export...");
            setTimeout(() => window.print(), 500);
          }}
          className="gradient-brand border-0 text-primary-foreground hover-lift"
        >
          <Download className="mr-1 h-4 w-4" /> Export PDF
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved answers…"
            className="h-11 rounded-xl border-glass-border bg-glass pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                subject === s
                  ? "gradient-brand text-primary-foreground"
                  : "border border-glass-border bg-glass hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a, i) => (
          <motion.article
            key={a.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass hover-lift flex flex-col rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary">{a.subject}</Badge>
              <Bookmark className="h-4 w-4 shrink-0 fill-primary text-primary" />
            </div>
            <p className="mt-3 font-medium leading-snug">{a.question}</p>
            {a.answer && (
              <p className="mt-2.5 text-xs text-muted-foreground line-clamp-3 bg-muted/40 p-2.5 rounded-xl border border-glass-border">
                {a.answer}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>{a.date}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}