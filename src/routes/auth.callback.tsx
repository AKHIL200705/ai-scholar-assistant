import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Completing Sign In — AI Doubt Resolution Assistant" }],
  }),
  component: Callback,
});

function Callback() {
  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          localStorage.setItem("adra-authenticated", "true");
        }
      } catch (e) {
        console.warn("Auth callback session warning:", e);
      } finally {
        if (mounted) {
          localStorage.setItem("adra-authenticated", "true");
          window.location.href = "/app";
        }
      }
    }

    handleAuthCallback();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session || event === "SIGNED_IN") {
        localStorage.setItem("adra-authenticated", "true");
        window.location.href = "/app";
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center max-w-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="space-y-1">
          <h2 className="font-display font-bold text-lg">Completing Google Sign In</h2>
          <p className="text-xs text-muted-foreground">Redirecting to your AI Workspace Home Page...</p>
        </div>
      </div>
    </div>
  );
}
