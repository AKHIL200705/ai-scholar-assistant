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
import { generateAIQuiz, type QuizQuestion } from "@/lib/ai-service";
import { addXPToSupabase } from "@/lib/supabase-service";

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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const solved = Object.keys(answers).length;
  const isComplete = questions.length > 0 && solved === questions.length;

  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => questions[Number(qi)]?.answer === oi
  ).length;

  async function generate() {
    setAnswers({});
    setState("loading");
    toast.info(`Generating ${count} ${difficulty} questions on "${topic}"...`);
    try {
      const generated = await generateAIQuiz(topic, count, difficulty);
      setQuestions(generated);
      setState("ready");
      toast.success("AI Quiz generated successfully!");
    } catch {
      toast.error("Failed to generate quiz.");
      setState("idle");
    }
  }

  async function pick(qi: number, oi: number) {
    if (answers[qi] !== undefined) return;
    setAnswers((a) => {
      const next = { ...a, [qi]: oi };
      if (Object.keys(next).length === questions.length) {
        addXPToSupabase(50);
        toast.success("🎉 Quiz complete! +50 XP saved to your Supabase profile.");
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

      {state === "loading" && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {state === "ready" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {solved}/{questions.length} answered · {difficulty} · {type}
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
              className="glass gradient-brand flex items-center justify-between rounded-2xl p-5 text-primary-foreground"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-300 animate-bounce" />
                <div>
                  <h3 className="font-display font-bold text-lg">Quiz Complete!</h3>
                  <p className="text-xs opacity-90">
                    You scored {correctCount}/{questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">+50 XP Earned</span>
            </motion.div>
          )}

          {questions.map((q, qi) => {
            const chosen = answers[qi];
            const isAnswered = chosen !== undefined;
            return (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.05 }}
                className="glass space-y-3 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium">
                    {qi + 1}. {q.q}
                  </p>
                  {isAnswered && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        chosen === q.answer ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {chosen === q.answer ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const picked = chosen === oi;
                    const isRight = q.answer === oi;

                    let style = "border-glass-border bg-glass hover:bg-muted";
                    if (isAnswered) {
                      if (isRight) style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                      else if (picked) style = "border-red-500 bg-red-500/10 text-red-500 font-semibold";
                      else style = "opacity-50 border-glass-border";
                    }

                    return (
                      <button
                        key={oi}
                        disabled={isAnswered}
                        onClick={() => pick(qi, oi)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs transition-all ${style}`}
                      >
                        <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                        <span className="flex-1">{opt}</span>
                        {isAnswered && isRight && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-glass-border">
                    💡 <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}