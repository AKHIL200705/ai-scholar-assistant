import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Bookmark,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Mic,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrainMark } from "@/components/BrainMark";
import { PageShell } from "@/components/PageShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialMessages, mockAnswer, suggestedQuestions, user, type ChatMessage } from "@/data/mock";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Ask AI — AI Doubt Resolution Assistant" },
      { name: "description", content: "Chat with an AI tutor to resolve academic doubts step by step." },
      { property: "og:title", content: "Ask AI — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "A ChatGPT-style tutor for every academic subject." },
    ],
  }),
  component: ChatPage,
});

function TypingIndicator() {
  return (
    <div className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3">
      <BrainMark size={20} />
      <span className="text-sm text-muted-foreground">Thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          style={{ animation: `pulse-glow 1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </div>
  );
}

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

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q, time: now() }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: mockAnswer(q), time: now() }]);
      setThinking(false);
    }, 1400);
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
                  {m.role === "ai" ? (
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
                        onClick={() => toast.success("Saved answer to your revision library")}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
          {thinking ? <TypingIndicator /> : null}
          <div ref={endRef} />
        </div>

        <div className="mt-4 rounded-2xl border border-glass-border bg-glass p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={recording ? "Listening to your doubt..." : "Type your doubt… e.g. Explain Bayes theorem with an example"}
            className={`min-h-20 resize-none border-0 bg-transparent focus-visible:ring-0 ${recording ? "text-primary animate-pulse" : ""}`}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant={recording ? "default" : "ghost"}
                aria-label="Voice input"
                className={recording ? "bg-destructive text-destructive-foreground animate-bounce" : ""}
                onClick={toggleVoiceInput}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Upload image"
                onClick={() => navigate({ to: "/app/image" })}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Upload PDF"
                onClick={() => navigate({ to: "/app/pdf" })}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => send(input)}
              disabled={thinking || !input.trim()}
              className="gradient-brand border-0 text-primary-foreground glow-ring hover-lift"
            >
              Send <Send className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Suggested questions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestedQuestions.map((s) => (
            <button
              key={s.title}
              onClick={() => send(s.title)}
              className="glass hover-lift rounded-2xl p-4 text-left"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{s.subject}</p>
              <p className="mt-1 font-medium">{s.title}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}