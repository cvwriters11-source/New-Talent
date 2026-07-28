import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(url && serviceRoleKey);
}

/** Public / anon client — safe for browser and public reads. */
export function createAnonClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured (URL / anon key missing).");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server-only admin client. Bypasses RLS — never import into client components.
 * Falls back to anon only when service role is missing (limited by RLS).
 */
export function createAdminClient(): SupabaseClient {
  if (!url) {
    throw new Error("Supabase is not configured (URL missing).");
  }
  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  if (!anonKey) {
    throw new Error("Supabase is not configured (keys missing).");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
