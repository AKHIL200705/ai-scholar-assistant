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
// Magic Link Sign In
// -----------------------------
export async function supabaseSignInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
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
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
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

// -----------------------------
// AI Chat & Conversation Persistence in Supabase
// -----------------------------
export interface ConversationItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  messagesCount?: number;
  favorite?: boolean;
}

export async function createConversationInSupabase(title: string, subject: string = "General"): Promise<ConversationItem> {
  const user = await getSupabaseUser();
  const id = crypto.randomUUID();
  const item: ConversationItem = {
    id,
    title,
    subject,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    favorite: false,
    messagesCount: 0,
  };

  try {
    if (user) {
      await supabase.from("conversations").insert({
        id,
        user_id: user.id,
        title,
        subject,
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Conversation Supabase create fallback:", e);
  }

  const local = JSON.parse(localStorage.getItem("adra-conversations") || "[]");
  localStorage.setItem("adra-conversations", JSON.stringify([item, ...local]));
  return item;
}

export async function fetchConversationsFromSupabase(): Promise<ConversationItem[]> {
  try {
    const user = await getSupabaseUser();
    if (user) {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, chat_messages(count)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          subject: d.subject || "General",
          date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          favorite: Boolean(d.is_favorite),
          messagesCount: d.chat_messages?.[0]?.count || 0,
        }));
      }
    }
  } catch (e) {
    console.warn("Conversations Supabase fetch fallback:", e);
  }

  return JSON.parse(localStorage.getItem("adra-conversations") || "[]");
}

export async function saveChatMessageToSupabase(
  conversationId: string | null,
  role: "user" | "ai",
  content: string,
  subject: string = "General"
): Promise<StoredChatMessage> {
  const user = await getSupabaseUser();
  const item: StoredChatMessage = {
    id: crypto.randomUUID(),
    role,
    text: content,
    subject,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  try {
    if (user) {
      await supabase.from("chat_messages").insert({
        id: item.id,
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
        subject,
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Chat message Supabase insert fallback:", e);
  }

  const storageKey = conversationId ? `adra-chat-${conversationId}` : "adra-latest-chat";
  const local = JSON.parse(localStorage.getItem(storageKey) || "[]");
  localStorage.setItem(storageKey, JSON.stringify([...local, item]));

  return item;
}

export async function fetchChatMessagesFromSupabase(conversationId?: string): Promise<StoredChatMessage[]> {
  try {
    const user = await getSupabaseUser();
    if (user) {
      let query = supabase.from("chat_messages").select("*").order("created_at", { ascending: true });
      if (conversationId) {
        query = query.eq("conversation_id", conversationId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          role: d.role as "user" | "ai",
          text: d.content,
          subject: d.subject,
          time: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
      }
    }
  } catch (e) {
    console.warn("Chat messages Supabase fetch fallback:", e);
  }

  const storageKey = conversationId ? `adra-chat-${conversationId}` : "adra-latest-chat";
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

export async function saveAiSettings(apiKey: string, provider: string) {
  localStorage.setItem("adra-openai-key", apiKey);
  localStorage.setItem("adra-ai-provider", provider);

  const user = await getSupabaseUser();
  if (user) {
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        openai_api_key: apiKey,
        ai_provider: provider,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback to local storage
    }
  }
}

export function getAiSettings() {
  const apiKey = localStorage.getItem("adra-openai-key") || "";
  const provider = localStorage.getItem("adra-ai-provider") || "gpt-4o-mini";
  return { apiKey, provider };
}

