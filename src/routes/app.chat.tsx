import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Bookmark,
  Camera,
  Copy,
  Download,
  FileText,
  Mic,
  Send,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { user } from "@/data/mock";
import { solveAcademicDoubt } from "@/lib/ai-service";
import { saveAnswerToSupabase } from "@/lib/supabase-service";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Ask AI — AI Doubt Resolution Assistant" },
      { name: "description", content: "Chat with your AI academic tutor for step-by-step doubt resolution." },
    ],
  }),
  component: ChatPage,
});

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
  subject?: string;
  userQuestion?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "Can you explain Bayes' theorem with an easy real-world example?",
    time: "10:14 AM",
  },
  {
    id: "m2",
    role: "ai",
    subject: "Mathematics & Statistics",
    text: `### **Bayes' Theorem Explanation**

Bayes' theorem calculates the conditional probability of an event $A$, given that event $B$ has already occurred:

\\[ P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} \\]

#### **Key Components:**
1. **$P(A|B)$ (Posterior Probability)**: Probability of hypothesis $A$ after observing evidence $B$.
2. **$P(B|A)$ (Likelihood)**: Probability of observing evidence $B$ if hypothesis $A$ is true.
3. **$P(A)$ (Prior Probability)**: Initial probability of hypothesis $A$ before seeing evidence.
4. **$P(B)$ (Marginal Likelihood)**: Total probability of observing evidence $B$ across all hypotheses.

---

#### **Real-World Example (Medical Test):**
- Suppose 1% of a population has a disease ($P(D) = 0.01$).
- A medical test is 95% accurate ($P(T+|D) = 0.95$).
- False positive rate is 5% ($P(T+|\\neg D) = 0.05$).

Plugging into Bayes' formula:
\\[ P(D|T+) = \\frac{0.95 \\times 0.01}{(0.95 \\times 0.01) + (0.05 \\times 0.99)} \\approx 16.1\\% \\]

*Even with a 95% accurate test, a positive result only means a 16.1% chance of having the disease due to low prior probability!*`,
    time: "10:15 AM",
  },
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function toggleVoiceInput() {
    if (recording) {
      setRecording(false);
      toast.success("Voice recording transcribed.");
    } else {
      setRecording(true);
      toast.info("Listening... Speak your academic question.");
      setTimeout(() => {
        setInput("Can you explain how backpropagation works in neural networks step by step?");
        setRecording(false);
        toast.success("Voice input captured!");
      }, 3000);
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q, time: now() }]);
    setInput("");
    setThinking(true);

    try {
      const res = await solveAcademicDoubt(q);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: res.answer,
          subject: res.subject,
          userQuestion: q,
          time: now(),
        },
      ]);
    } catch {
      toast.error("Failed to generate AI response. Please try again.");
    } finally {
      setThinking(false);
    }
  }

  async function handleBookmark(msg: ChatMessage) {
    const q = msg.userQuestion || "Academic Doubt Solution";
    await saveAnswerToSupabase(q, msg.text, msg.subject || "General");
    toast.success("Saved answer to your Supabase revision library!");
  }

  return (
    <PageShell title="Ask AI" subtitle="Your always-on tutor for every subject.">
      <div className="glass flex h-[62vh] min-h-[420px] flex-col rounded-3xl p-4 sm:p-6">
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/30">
                <AvatarFallback
                  className={
                    m.role === "ai"
                      ? "gradient-brand text-[10px] font-bold text-primary-foreground"
                      : "bg-muted text-[10px] font-bold"
                  }
                >
                  {m.role === "ai" ? "AI" : user.initials}
                </AvatarFallback>
              </Avatar>
              <div className={`min-w-0 max-w-[78%] ${m.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "gradient-brand text-primary-foreground"
                      : "border border-glass-border bg-muted/50 text-foreground"
                  }`}
                >
                  {m.text}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={m.role === "user" ? "ml-auto" : ""}>{m.time}</span>
                  {m.role === "ai" && (
                    <div className="flex items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Copy"
                        className="h-7 w-7"
                        onClick={() => {
                          navigator.clipboard.writeText(m.text);
                          toast.success("Answer copied to clipboard");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Like"
                        className="h-7 w-7"
                        onClick={() => toast.success("Thanks for the positive feedback!")}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Dislike"
                        className="h-7 w-7"
                        onClick={() => toast.info("Feedback recorded. We'll refine future responses.")}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Share"
                        className="h-7 w-7"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: "AI Explanation", text: m.text }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Share link copied to clipboard");
                          }
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Download"
                        className="h-7 w-7"
                        onClick={() => {
                          const blob = new Blob([m.text], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "ai-solution.txt";
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Downloaded answer file");
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Bookmark"
                        className="h-7 w-7"
                        onClick={() => handleBookmark(m)}
                      >
                        <Bookmark className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="gradient-brand text-[10px] font-bold text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 rounded-2xl border border-glass-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-spin text-primary" />
                AI is reasoning and calculating step-by-step...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Upload PDF"
              onClick={() => navigate({ to: "/app/pdf" })}
              className="h-9 w-9 rounded-xl hover:bg-accent"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Scan Image"
              onClick={() => navigate({ to: "/app/image" })}
              className="h-9 w-9 rounded-xl hover:bg-accent"
            >
              <Camera className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your academic question..."
            className="flex-1 rounded-xl border border-glass-border bg-glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Voice input"
            onClick={toggleVoiceInput}
            className={`h-10 w-10 rounded-xl transition-all ${
              recording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-accent"
            }`}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button type="submit" disabled={!input.trim() || thinking} className="h-10 rounded-xl px-4 hover-lift">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </PageShell>
  );
}