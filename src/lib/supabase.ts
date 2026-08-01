import { createClient } from "@supabase/supabase-js";

const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://emdtwrilwucexdiahcxz.supabase.co";

// Sanitize URL: strip /rest/v1/ and trailing slashes so auth, rest, storage endpoints resolve correctly
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseAnonKey =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_9vfF8K_wzMu_LjAK_x1EUg_F9pWNy2N";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
