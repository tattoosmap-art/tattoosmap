import { createClient } from '@supabase/supabase-js';

// DO NOT IMPORT IN CLIENT COMPONENTS
// This Supabase client uses the service_role key to bypass all Row Level Security.
// It is intended for secure backend operations only, such as bulk CSV imports 
// during the Cloud Sync phase. Importing this client-side will leak high-privilege keys.

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL or Service Role Key missing in .env.local');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
