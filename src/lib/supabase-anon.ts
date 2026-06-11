/**
 * Plain Supabase client for non-auth data fetching (used by designService in Server Components).
 * This uses @supabase/supabase-js directly (not @supabase/ssr) because
 * the designService only reads public data and doesn't need cookie-based auth.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = "CRITICAL: Supabase environment variables are missing in this execution context.";
    if (typeof window === 'undefined') {
      console.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

// Keep a proxy export for backward compatibility and to prevent any direct references
// to `supabaseAnon` from failing at compile-time/import-time, while failing loudly at runtime.
export const supabaseAnon = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseAnon();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
