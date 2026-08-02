import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { motion } from "motion/react";
import { useEffect } from "react";
import { BrainMark } from "@/components/BrainMark";
import { ParticleField } from "@/components/ParticleField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Doubt Resolution Assistant — Learn Smarter with AI" },
      {
        name: "description",
        content:
          "An AI study companion that resolves academic doubts, summarises PDFs, reads handwritten notes and generates quizzes.",
      },
      { property: "og:title", content: "AI Doubt Resolution Assistant" },
      {
        property: "og:description",
        content: "Learn smarter with an AI assistant that answers every academic doubt instantly.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <ParticleField count={26} />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <BrainMark size={140} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="mt-8 font-display text-3xl font-extrabold tracking-tight gradient-text sm:text-5xl"
      >
        AI Doubt Resolution Assistant
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base"
      >
        Learn Smarter with Artificial Intelligence
      </motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 1.1, duration: 1.8, ease: "easeInOut" }}
        className="mt-8 h-1 overflow-hidden rounded-full"
      >
        <div className="h-full w-full gradient-brand" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-6 flex items-center gap-3"
      >
        <Link
          to="/login"
          className="rounded-xl gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover-lift"
        >
          Sign In / Login
        </Link>
        <Link
          to="/app"
          className="rounded-xl border border-glass-border bg-glass px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover-lift"
        >
          Explore Workspace
        </Link>
      </motion.div>
    </div>
  );
}

