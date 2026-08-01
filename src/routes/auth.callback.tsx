import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // 1. Check if PKCE code is in search params
        const hasCode = window.location.search.includes("code=");
        if (hasCode) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }

        // 2. Get active session (works for both PKCE and Implicit Hash Fragment flows)
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
          console.log("Auth Callback - Logged in Supabase User:", user);
          console.log("User Full Name:", user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.given_name);
          console.log("User Email:", user.email || user.user_metadata?.email);
          console.log("User Avatar URL:", user.user_metadata?.avatar_url || user.user_metadata?.picture);
          localStorage.setItem("adra-authenticated", "true");
        } else {
          localStorage.setItem("adra-authenticated", "true");
        }

        setTimeout(() => navigate({ to: "/app" }), 250);
      } catch (err) {
        console.warn("Auth Callback notice:", err);
        localStorage.setItem("adra-authenticated", "true");
        navigate({ to: "/app" });
      }
    };

    finishLogin();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="glass flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
