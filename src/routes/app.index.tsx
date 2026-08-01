import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, BookMarked, FileText, Image as ImageIcon, ListChecks, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { fetchSavedAnswersFromSupabase } from "@/lib/supabase-service";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Doubt Resolution Assistant" },
      { name: "description", content: "Your real-time AI study workspace and doubt resolution hub." },
      { property: "og:title", content: "Dashboard — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Your real-time AI learning stats and study progress." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/app/chat", label: "Ask a doubt", desc: "Interactive AI study assistant", icon: MessageSquare },
  { to: "/app/pdf", label: "Summarise PDF", desc: "Upload and analyze notes", icon: FileText },
  { to: "/app/image", label: "Scan Question", desc: "OCR handwritten doubt scanner", icon: ImageIcon },
  { to: "/app/quiz", label: "Generate Quiz", desc: "Test your knowledge instantly", icon: ListChecks },
] as const;

function Dashboard() {
  const { profile } = useSupabaseUser();
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    fetchSavedAnswersFromSupabase().then((answers) => {
      setSavedCount(answers?.length || 0);
    });
  }, []);

  return (
    <PageShell
      title={`Welcome back${profile.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋`}
      subtitle="Your AI-powered study workspace is active and ready."
      action={
        <Button asChild className="gradient-brand border-0 text-primary-foreground glow-ring hover-lift">
          <Link to="/app/chat">
            Ask AI <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a, i) => (
          <motion.div
            key={a.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={a.to} className="glass hover-lift group flex flex-col h-full rounded-2xl p-5">
              <a.icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
              <p className="mt-4 font-display font-semibold text-lg">{a.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
              <Badge variant="secondary" className="mt-auto w-fit text-xs pt-1">
                Launch tool
              </Badge>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">Saved Answers & Notes</h2>
              <p className="text-xs text-muted-foreground">Stored directly in your Supabase database</p>
            </div>
          </div>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold gradient-text">{savedCount}</span>
            <span className="text-xs text-muted-foreground">bookmarked answers saved</span>
          </div>
          <Button asChild variant="outline" className="mt-4 h-10 rounded-xl border-glass-border bg-glass">
            <Link to="/app/saved">View All Saved Answers</Link>
          </Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">Real-Time Sync Active</h2>
              <p className="text-xs text-muted-foreground">Supabase Realtime WebSockets Connected</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            All your doubt resolutions, bookmarked solutions, and account metadata sync live across your connected devices in real time.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Database Connected
          </div>
        </div>
      </div>
    </PageShell>
  );
}