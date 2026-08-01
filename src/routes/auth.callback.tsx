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
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Auth Callback - Logged in Supabase User:", user);
          console.log("Auth Callback - User Metadata:", user.user_metadata);
          console.log("User Full Name:", user.user_metadata?.full_name || user.user_metadata?.name);
          console.log("User Email:", user.email || user.user_metadata?.email);
          console.log("User Avatar URL:", user.user_metadata?.avatar_url || user.user_metadata?.picture);
        }

        if (!error) {
          localStorage.setItem("adra-authenticated", "true");
          navigate({ to: "/app" });
        } else {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            localStorage.setItem("adra-authenticated", "true");
            navigate({ to: "/app" });
          } else {
            localStorage.setItem("adra-authenticated", "true");
            navigate({ to: "/app" });
          }
        }
      } catch {
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
