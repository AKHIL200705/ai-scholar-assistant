import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, FileText, Image as ImageIcon, ListChecks, MessageSquare, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardStats, leaderboard, user, weeklyProgress } from "@/data/mock";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Doubt Resolution Assistant" },
      { name: "description", content: "Track questions solved, accuracy, streaks and study time at a glance." },
      { property: "og:title", content: "Dashboard — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Your AI learning stats, streaks and study progress." },
    ],
  }),
  component: Dashboard,
});

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 40;
    const id = setInterval(() => {
      frame += 1;
      setValue(Math.round((target * frame) / total));
      if (frame >= total) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target]);
  return value;
}

function StatCard({ stat, index }: { stat: (typeof dashboardStats)[number]; index: number }) {
  const value = useCountUp(stat.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass hover-lift rounded-2xl p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
      <p className="mt-2 font-display text-3xl font-bold gradient-text">
        {value}
        {stat.suffix}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{stat.trend}</p>
    </motion.div>
  );
}

const quickActions = [
  { to: "/app/chat", label: "Ask a doubt", icon: MessageSquare },
  { to: "/app/pdf", label: "Summarise a PDF", icon: FileText },
  { to: "/app/image", label: "Scan a question", icon: ImageIcon },
  { to: "/app/quiz", label: "Generate a quiz", icon: ListChecks },
] as const;

function Dashboard() {
  const { profile } = useSupabaseUser();
  const max = Math.max(...weeklyProgress.map((d) => d.minutes));

  return (
    <PageShell
      title={`Welcome back, ${profile.name.split(" ")[0]} 👋`}
      subtitle="Here's how your learning is going this week."
      action={
        <Button asChild className="gradient-brand border-0 text-primary-foreground glow-ring hover-lift">
          <Link to="/app/chat">
            Ask AI <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Weekly study time</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklyProgress.map((d, i) => (
              <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.minutes / max) * 100}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="w-full rounded-t-xl gradient-brand"
                />
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            <h2 className="font-display text-lg font-semibold">Leaderboard</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {leaderboard.map((row) => (
              <li
                key={row.rank}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  row.isYou ? "gradient-brand text-primary-foreground" : "bg-muted/60"
                }`}
              >
                <span className="min-w-0 truncate">
                  #{row.rank} {row.name}
                </span>
                <span className="shrink-0 font-semibold">{row.xp} XP</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="glass hover-lift group rounded-2xl p-5">
            <a.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <p className="mt-3 font-medium">{a.label}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              Quick action
            </Badge>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}