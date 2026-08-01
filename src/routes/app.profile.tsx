import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { signOut } from "@/lib/supabase-service";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — AI Doubt Resolution Assistant" },
      { name: "description", content: "Your active Supabase user profile identity." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useSupabaseUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/login" });
  }

  return (
    <PageShell title="User Profile" subtitle="Your active Supabase authentication identity.">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-6">
          <div className="flex flex-col items-center sm:flex-row gap-5 min-w-0">
            <Avatar className="h-20 w-20 shrink-0 ring-4 ring-primary/30">
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name || "User"} />}
              <AvatarFallback className="gradient-brand text-xl font-bold text-primary-foreground">
                {profile.initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-bold">{profile.name || "Authenticated User"}</h2>
              <p className="truncate text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" /> {profile.email || "No email linked"}
              </p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge className="gradient-brand border-0 text-primary-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Supabase Authenticated
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </PageShell>
  );
}