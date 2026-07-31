import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageShell } from "@/components/PageShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { badges, user, weeklyProgress } from "@/data/mock";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — AI Doubt Resolution Assistant" },
      { name: "description", content: "Your study hours, badges, achievements and weekly progress." },
      { property: "og:title", content: "Profile — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Track badges, XP and weekly learning progress." },
    ],
  }),
  component: ProfilePage,
});

function Ring({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="glass flex flex-col items-center rounded-2xl p-5">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <linearGradient id={`ring-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <motion.circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={`url(#ring-${label})`}
          strokeWidth="10"
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <text x="55" y="61" textAnchor="middle" className="fill-foreground text-lg font-bold">
          {value}%
        </text>
      </svg>
      <p className="mt-2 font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function ProfilePage() {
  const max = Math.max(...weeklyProgress.map((d) => d.minutes));

  return (
    <PageShell title="Profile" subtitle="Your learning identity and achievements.">
      <div className="glass grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl p-6 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0 ring-4 ring-primary/30">
            <AvatarFallback className="gradient-brand text-lg font-bold text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-bold">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="gradient-brand border-0 text-primary-foreground">Level {user.level}</Badge>
              <Badge variant="secondary">{user.xp} XP</Badge>
              <Badge variant="secondary">🔥 {user.streak}-day streak</Badge>
            </div>
          </div>
        </div>
        <div className="col-span-2 w-full sm:w-56">
          <p className="text-xs text-muted-foreground">
            {user.xp} / {user.xpToNext} XP to level {user.level + 1}
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
              transition={{ duration: 0.9 }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Ring value={94} label="Accuracy" sub="Across 348 doubts" />
        <Ring value={78} label="Weekly goal" sub="8h of 10h done" />
        <Ring value={62} label="Syllabus" sub="Physics + DSA" />
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold">Weekly progress</h2>
        <div className="mt-5 flex h-40 items-end gap-3">
          {weeklyProgress.map((d, i) => (
            <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.minutes / max) * 100}%` }}
                transition={{ delay: i * 0.06 }}
                className="w-full rounded-t-xl bg-primary/70"
              />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Badges & achievements</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass hover-lift flex items-center gap-3 rounded-2xl p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-xl">
                {b.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{b.name}</p>
                <p className="truncate text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}