import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { quizQuestions } from "@/data/mock";

export const Route = createFileRoute("/app/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Generator — AI Doubt Resolution Assistant" },
      { name: "description", content: "Generate MCQ, true/false and short-answer quizzes on any topic." },
      { property: "og:title", content: "Quiz Generator — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Custom AI quizzes tuned to your difficulty and length." },
    ],
  }),
  component: QuizPage,
});

const difficulties = ["Easy", "Medium", "Hard"];
const counts = [5, 10, 20, 50];
const types = ["MCQ", "True / False", "Fill in the blanks", "Short Answer"];

function Chips({
  options,
  value,
  onChange,
}: {
  options: (string | number)[];
  value: string | number;
  onChange: (v: never) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o as never)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            value === o
              ? "gradient-brand text-primary-foreground glow-ring"
              : "border border-glass-border bg-glass hover:bg-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function QuizPage() {
  const [topic, setTopic] = useState("Quantum Mechanics & Wave Equations");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState<number>(5);
  const [type, setType] = useState("MCQ");
  const [state, setState] = useState<"idle" | "loading" | "ready">("idle");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const solved = Object.keys(answers).length;
  const isComplete = solved === quizQuestions.length;

  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => quizQuestions[Number(qi)].answer === oi
  ).length;

  function generate() {
    setAnswers({});
    setState("loading");
    toast.info(`Generating ${count} ${difficulty} ${type} questions on "${topic}"...`);
    setTimeout(() => {
      setState("ready");
      toast.success("Quiz generated successfully!");
    }, 1200);
  }

  function pick(qi: number, oi: number) {
    if (answers[qi] !== undefined) return;
    setAnswers((a) => {
      const next = { ...a, [qi]: oi };
      if (Object.keys(next).length === quizQuestions.length) {
        toast.success("🎉 Quiz complete! +50 XP earned.");
      }
      return next;
    });
  }

  return (
    <PageShell title="Quiz Generator" subtitle="Build a practice set in seconds.">
      <div className="glass space-y-6 rounded-3xl p-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Study Topic or Subject</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Organic Chemistry, Calculus, Data Structures..."
            className="h-11 rounded-xl border-glass-border bg-glass"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
          <Chips options={difficulties} value={difficulty} onChange={setDifficulty as (v: never) => void} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Question count</p>
          <Chips options={counts} value={count} onChange={setCount as (v: never) => void} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quiz type</p>
          <Chips options={types} value={type} onChange={setType as (v: never) => void} />
        </div>
        <Button onClick={generate} className="gradient-brand border-0 text-primary-foreground glow-ring hover-lift">
          <Sparkles className="mr-1 h-4 w-4" /> Generate quiz
        </Button>
      </div>

      {state === "loading" ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {state === "ready" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {solved}/{quizQuestions.length} answered · {difficulty} · {type}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={generate}
              className="border-glass-border text-xs hover-lift"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Retake / Regenerate
            </Button>
          </div>

          {isComplete && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass gradient-brand text-primary-foreground rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-warning" />
                <div>
                  <h3 className="font-display font-bold text-lg">Quiz Finished!</h3>
                  <p className="text-xs opacity-90">
                    You scored {correctCount} / {quizQuestions.length} correct ({Math.round((correctCount / quizQuestions.length) * 100)}%). +50 XP added to your rank.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {quizQuestions.map((q, qi) => (
            <motion.div
              key={q.q}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.07 }}
              className="glass rounded-2xl p-5"
            >
              <p className="font-medium">
                {qi + 1}. {q.q}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((o, oi) => {
                  const chosen = answers[qi] === oi;
                  const correct = oi === q.answer;
                  const showCorrectness = answers[qi] !== undefined;

                  let borderClass = "border-glass-border bg-glass hover:bg-muted";
                  if (showCorrectness) {
                    if (correct) {
                      borderClass = "border-success bg-success/20 text-foreground font-semibold";
                    } else if (chosen) {
                      borderClass = "border-destructive bg-destructive/20 text-foreground";
                    }
                  }

                  return (
                    <button
                      key={o}
                      onClick={() => pick(qi, oi)}
                      disabled={showCorrectness}
                      className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${borderClass}`}
                    >
                      <span className="min-w-0 truncate">{o}</span>
                      {showCorrectness && correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}