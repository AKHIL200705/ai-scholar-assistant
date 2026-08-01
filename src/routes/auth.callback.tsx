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
