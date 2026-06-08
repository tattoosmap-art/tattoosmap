/**
 * Plain Supabase client for non-auth data fetching (used by designService in Server Components).
 * This uses @supabase/supabase-js directly (not @supabase/ssr) because
 * the designService only reads public data and doesn't need cookie-based auth.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your environment variables.');
}

// We pass a dummy URL if missing so build doesn't fail, but we use one that fails instantly 
// rather than timing out (like localhost or a malformed URL). 
export const supabaseAnon = createClient(
  supabaseUrl || 'http://localhost:9999', 
  supabaseAnonKey || 'missing_key'
);
