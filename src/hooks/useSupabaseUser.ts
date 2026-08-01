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
    name: "",
    email: "",
    initials: "",
    level: 1,
    xp: 0,
    xpToNext: 1000,
    streak: 1,
  });
  const [loading, setLoading] = useState(true);

  const updateUserProfile = (user: any) => {
    if (!user) return;
    console.log("Updating User Profile from Supabase Auth User:", user);
    const meta = user.user_metadata || {};
    
    // Read name from all possible Google / OAuth metadata fields
    const name =
      meta.full_name ||
      meta.name ||
      meta.given_name ||
      (meta.family_name ? `${meta.given_name || ''} ${meta.family_name}`.trim() : "") ||
      user.email?.split("@")[0] ||
      "User";

    const email = user.email || meta.email || "";
    const avatarUrl = meta.avatar_url || meta.picture;

    console.log("Extracted Profile Name:", name);
    console.log("Extracted Profile Email:", email);
    console.log("Extracted Profile Avatar:", avatarUrl);

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
  };

  useEffect(() => {
    async function loadUser() {
      try {
        // 1. Get active session directly
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          updateUserProfile(session.user);
        }

        // 2. Fetch authenticated user details
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          updateUserProfile(user);
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
          updateUserProfile(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
