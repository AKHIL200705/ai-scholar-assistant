import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://vfhilxdxvalerwzbpacr.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  "sb_publishable_3msOtqR-DxA55kwe5LuQ3w_p-8hAzi3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
