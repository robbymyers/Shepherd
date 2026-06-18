import { createClient } from "@supabase/supabase-js";

// Browser client — anon key + RLS. Reads are public; writes are allowed only
// for a session whose JWT email matches the owner (enforced server-side by the
// public.is_owner() RLS policies).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const OWNER_EMAIL = "robby.myers@gmail.com";

/** True when env is wired (lets the store fall back to static data otherwise). */
export const supabaseConfigured = Boolean(url && anon);

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Establish a session if the user lands on the app via a magic link
    // (fallback for when the email sends a link instead of a code).
    detectSessionInUrl: true,
  },
});
