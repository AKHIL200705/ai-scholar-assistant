import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BookMarked,
  FileText,
  History,
  Home,
  Image as ImageIcon,
  ListChecks,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrainMark } from "@/components/BrainMark";
import { ParticleField } from "@/components/ParticleField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { user } from "@/data/mock";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/chat", label: "Ask AI", icon: MessageSquare },
  { to: "/app/pdf", label: "Upload PDF", icon: FileText },
  { to: "/app/image", label: "Upload Image", icon: ImageIcon },
  { to: "/app/quiz", label: "Quiz Generator", icon: ListChecks },
  { to: "/app/history", label: "Chat History", icon: History },
  { to: "/app/saved", label: "Saved Answers", icon: BookMarked },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: "exact" in item ? item.exact : false }}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-foreground data-[status=active]:gradient-brand data-[status=active]:text-primary-foreground data-[status=active]:glow-ring"
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { profile } = useSupabaseUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: "1", title: "🔥 7-Day Streak!", desc: "You've studied 7 days in a row.", unread: true },
    { id: "2", title: "📝 New Physics Quiz", desc: "10 new questions on Thermodynamics.", unread: true },
    { id: "3", title: "💡 Solution Ready", desc: "Your PDF summary is ready for revision.", unread: false },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = [
    { title: "Ask AI Tutor", link: "/app/chat", type: "Chat" },
    { title: "Thermodynamics Quiz", link: "/app/quiz", type: "Quiz" },
    { title: "Physics-Class12-Mechanics.pdf", link: "/app/pdf", type: "PDF" },
    { title: "Bayes Theorem Explanation", link: "/app/saved", type: "Saved" },
    { title: "Scan Handwritten Doubt", link: "/app/image", type: "Scanner" },
  ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen">
      <ParticleField count={16} />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-glass-border bg-sidebar/70 p-4 backdrop-blur-xl lg:flex">
        <Link to="/app" className="flex items-center gap-3 px-2 pt-2">
          <BrainMark size={38} />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight">AI Doubt</p>
            <p className="truncate text-xs text-muted-foreground">Resolution Assistant</p>
          </div>
        </Link>
        <NavList />
        <div className="mt-auto glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Level {profile.level}</p>
          <p className="mt-1 text-sm font-semibold">{profile.xp} XP</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full gradient-brand"
              style={{ width: `${(profile.xp / profile.xpToNext) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 border-r border-glass-border bg-sidebar p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <BrainMark size={32} />
                  <span className="truncate font-display font-bold">AI Doubt</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-glass-border bg-background/60 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden min-w-0 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setSearchOpen(true);
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              placeholder="Search doubts, notes, quizzes…"
              className="h-10 max-w-md rounded-xl border-glass-border bg-glass pl-9 backdrop-blur-md"
            />
            {searchOpen && searchQuery && (
              <div className="absolute left-0 top-12 z-50 w-full max-w-md rounded-2xl border border-glass-border bg-popover/90 p-2 shadow-xl backdrop-blur-xl">
                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <button
                      key={res.title}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => {
                        navigate({ to: res.link as any });
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span className="truncate font-medium">{res.title}</span>
                      <Badge variant="outline" className="text-xs">{res.type}</Badge>
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-center text-xs text-muted-foreground">No matching features or doubts found.</p>
                )}
              </div>
            )}
          </div>
          <div className="col-start-3 flex items-center gap-1.5 sm:gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl border-glass-border bg-popover/95 p-4 shadow-xl backdrop-blur-xl" align="end">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="font-display text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications((n) => n.map((x) => ({ ...x, unread: false })))}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-xl p-3 text-xs transition-colors ${
                          n.unread ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-muted-foreground">{n.desc}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">No new notifications.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Badge className="hidden gradient-brand border-0 text-primary-foreground sm:inline-flex">
              🔥 {profile.streak}d
            </Badge>
            <Link to="/app/profile" className="rounded-full outline-none focus:ring-2 focus:ring-primary">
              <Avatar className="h-9 w-9 ring-2 ring-primary/40 transition-transform hover:scale-105">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name} />}
                <AvatarFallback className="gradient-brand text-xs font-semibold text-primary-foreground">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className={cn("min-h-[calc(100vh-65px)]")} key={pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}