import { createClient } from "@/utils/supabase/client";

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

// 1. Auth Service
export async function supabaseSignIn(email: string, pass: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignUp(email: string, pass: string, name: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { full_name: name },
    },
  });
  if (error) throw error;
  return data;
}

export async function supabaseOAuthGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.error("SignOut error:", error);
}

export async function getSupabaseUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// 2. Saved Answers Cloud Persistence
export async function saveAnswerToSupabase(question: string, answer: string, subject: string) {
  const supabase = createClient();
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
  const supabase = createClient();

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
  const supabase = createClient();
  try {
    await supabase.from("saved_answers").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete saved answer fallback:", e);
  }
  const current = JSON.parse(localStorage.getItem("adra-saved") || "[]");
  const filtered = current.filter((x: SavedAnswer) => x.id !== id);
  localStorage.setItem("adra-saved", JSON.stringify(filtered));
}

// 3. User XP & Streak Updates
export async function addXPToSupabase(amount: number) {
  const supabase = createClient();
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
