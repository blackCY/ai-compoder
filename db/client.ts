/**
 * Supabase Client
 * Server-side Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client or throw if not configured
 * Lazily initializes the client on first call
 */
export function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  _supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseClient;
}

/**
 * Check if Supabase is configured
 * Does not throw, just checks if env vars are present
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Get Supabase client (nullable version)
 * Returns null if not configured instead of throwing
 */
export function getSupabaseClientOrNull(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}
