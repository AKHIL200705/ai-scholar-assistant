import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Authenticating — AI Doubt Resolution Assistant" }],
  }),
  component: Callback,
});

function Callback() {
  useEffect(() => {
    async function load() {
      await supabase.auth.getSession();
      localStorage.setItem("adra-authenticated", "true");
      window.location.href = "/app";
    }

    load();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Authenticating with Supabase...</p>
      </div>
    </div>
  );
}
