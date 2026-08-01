import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      await supabase.auth.getSession();
      localStorage.setItem("adra-authenticated", "true");
      navigate({ to: "/app" });
    }

    load();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center font-display text-base text-foreground bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-medium text-sm">Authenticating with Supabase...</p>
      </div>
    </div>
  );
}
