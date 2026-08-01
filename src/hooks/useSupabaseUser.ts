import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { user as mockUser } from "@/data/mock";

export interface UserProfileState {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
}

export function useSupabaseUser() {
  const [profile, setProfile] = useState<UserProfileState>({
    name: mockUser.name,
    email: mockUser.email,
    initials: mockUser.initials,
    level: mockUser.level,
    xp: mockUser.xp,
    xpToNext: mockUser.xpToNext,
    streak: mockUser.streak,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          console.log("Supabase Authenticated User:", user);
          const meta = user.user_metadata || {};
          const name =
            meta.full_name ||
            meta.name ||
            user.email?.split("@")[0] ||
            "User";
          const email = user.email || meta.email || "";
          const avatarUrl = meta.avatar_url || meta.picture;

          console.log("User Profile Name:", name);
          console.log("User Profile Email:", email);
          console.log("User Profile Avatar:", avatarUrl);

          const initials =
            name
              .split(" ")
              .map((part: string) => part[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U";

          setProfile((prev) => ({
            ...prev,
            name,
            email,
            avatarUrl,
            initials,
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch Supabase user metadata:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const user = session.user;
          console.log("onAuthStateChange Supabase User:", user);
          const meta = user.user_metadata || {};
          const name =
            meta.full_name ||
            meta.name ||
            user.email?.split("@")[0] ||
            "User";
          const email = user.email || meta.email || "";
          const avatarUrl = meta.avatar_url || meta.picture;

          const initials =
            name
              .split(" ")
              .map((part: string) => part[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U";

          setProfile((prev) => ({
            ...prev,
            name,
            email,
            avatarUrl,
            initials,
          }));
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
