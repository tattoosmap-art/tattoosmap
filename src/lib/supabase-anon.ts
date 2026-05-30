/**
 * Plain Supabase client for non-auth data fetching (used by designService in Server Components).
 * This uses @supabase/supabase-js directly (not @supabase/ssr) because
 * the designService only reads public data and doesn't need cookie-based auth.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
