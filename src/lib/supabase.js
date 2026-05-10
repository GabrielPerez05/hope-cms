import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://vxpeuscujtcfzowokmsr.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cGV1c2N1anRjZnpvd29rbXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjMzODcsImV4cCI6MjA5Mzc5OTM4N30.xJeuy7TYOqF_KGNLTGnBfh4yZNe-0f5Tow3BBxPRQ6E",
);
