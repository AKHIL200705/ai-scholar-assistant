import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        localStorage.setItem("adra-authenticated", "true");
        navigate({ to: "/app" });
      }

      if (event === "SIGNED_OUT") {
        localStorage.removeItem("adra-authenticated");
        navigate({ to: "/login" });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return <>{children}</>;
}
