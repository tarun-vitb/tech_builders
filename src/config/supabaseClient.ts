import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return null;
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
