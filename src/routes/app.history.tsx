import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MessageSquare, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { chatHistory } from "@/data/mock";
import { fetchConversationsFromSupabase, type ConversationItem } from "@/lib/supabase-service";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Chat History — AI Doubt Resolution Assistant" },
      { name: "description", content: "Browse and reopen every past AI tutoring conversation." },
      { property: "og:title", content: "Chat History — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "A timeline of all your AI study conversations synced with Supabase." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchConversationsFromSupabase();
      if (data && data.length > 0) {
        setConversations(data);
      } else {
        setConversations(
          chatHistory.map((c) => ({
            id: c.id,
            title: c.title,
            subject: c.subject,
            date: c.date,
            favorite: c.favorite,
            messagesCount: c.messages,
          }))
        );
      }
    }
    loadData();
  }, []);

  const items = conversations.filter(
    (c) => (!favOnly || c.favorite) && c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell title="Chat History" subtitle="Pick up any AI conversation where you left off.">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="h-11 rounded-xl border-glass-border bg-glass pl-9"
          />
        </div>
        <button
          onClick={() => setFavOnly((f) => !f)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            favOnly ? "gradient-brand text-primary-foreground" : "border border-glass-border bg-glass hover:bg-muted"
          }`}
        >
          <Star className="mr-1 inline h-4 w-4" /> Favourites
        </button>
      </div>

      <ol className="relative space-y-4 border-l border-glass-border pl-6">
        {items.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className="absolute -left-[7px] mt-5 h-3.5 w-3.5 rounded-full gradient-brand" />
            <Link to="/app/chat" className="glass hover-lift block rounded-2xl p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.date} · {c.messagesCount ?? 0} messages
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.favorite ? <Star className="h-4 w-4 fill-warning text-warning" /> : null}
                  <Badge variant="secondary">{c.subject}</Badge>
                </div>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                <MessageSquare className="h-3.5 w-3.5" /> Reopen conversation
              </p>
            </Link>
          </motion.li>
        ))}
      </ol>
      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No conversations found.</p>
      ) : null}
    </PageShell>
  );
}