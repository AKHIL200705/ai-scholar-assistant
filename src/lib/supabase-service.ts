import { supabase } from "./supabase";

export interface SavedAnswer {
  id: string;
  question: string;
  answer: string;
  subject: string;
  date: string;
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
  subject?: string;
}

// -----------------------------
// Email Sign Up
// -----------------------------
export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// -----------------------------
// Email Sign In
// -----------------------------
export async function supabaseSignIn(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// -----------------------------
// Google OAuth
// -----------------------------
export async function supabaseOAuthGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// -----------------------------
// Forgot Password
// -----------------------------
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

// -----------------------------
// Logout
// -----------------------------
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("SignOut error:", error);
  localStorage.removeItem("adra-authenticated");
}

export async function getSupabaseUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// -----------------------------
// Saved Answers Cloud Persistence
// -----------------------------
export async function saveAnswerToSupabase(question: string, answer: string, subject: string) {
  const user = await getSupabaseUser();

  const item: SavedAnswer = {
    id: crypto.randomUUID(),
    question,
    answer,
    subject,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };

  try {
    const { error } = await supabase.from("saved_answers").insert({
      id: item.id,
      user_id: user?.id,
      question: item.question,
      answer: item.answer,
      subject: item.subject,
      created_at: new Date().toISOString(),
    });

    if (error) {
      const current = JSON.parse(localStorage.getItem("adra-saved") || "[]");
      localStorage.setItem("adra-saved", JSON.stringify([item, ...current]));
    }
  } catch {
    const current = JSON.parse(localStorage.getItem("adra-saved") || "[]");
    localStorage.setItem("adra-saved", JSON.stringify([item, ...current]));
  }

  return item;
}

export async function fetchSavedAnswersFromSupabase(): Promise<SavedAnswer[]> {
  try {
    const { data, error } = await supabase
      .from("saved_answers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        question: d.question,
        answer: d.answer,
        subject: d.subject,
        date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
    }
  } catch (e) {
    console.warn("Supabase fetch saved answers fallback:", e);
  }

  const local = JSON.parse(localStorage.getItem("adra-saved") || "[]");
  return local;
}

export async function deleteSavedAnswerFromSupabase(id: string) {
  try {
    await supabase.from("saved_answers").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete saved answer fallback:", e);
  }
  const current = JSON.parse(localStorage.getItem("adra-saved") || "[]");
  const filtered = current.filter((x: SavedAnswer) => x.id !== id);
  localStorage.setItem("adra-saved", JSON.stringify(filtered));
}

// -----------------------------
// User XP & Streak Updates
// -----------------------------
export async function addXPToSupabase(amount: number) {
  const user = await getSupabaseUser();

  const currentXp = Number(localStorage.getItem("adra-user-xp") || "1420") + amount;
  localStorage.setItem("adra-user-xp", currentXp.toString());

  if (user) {
    try {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, xp: currentXp, updated_at: new Date().toISOString() });
    } catch {
      // Ignored if table not created
    }
  }
}
