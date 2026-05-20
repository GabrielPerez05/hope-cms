// Author: M1 Gabriel Red Ray Perez
// supabase.js — Supabase client singleton for the entire app.
// Uses PKCE flow for secure OAuth token exchange and persists the session
// across page reloads. Exports isSupabaseConfigured so every caller can guard
// against missing env vars without crashing at import time.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        persistSession: true,
      },
    })
  : null;
