import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

async function deepCheck() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  console.log("--- Supabase Deep Introspection ---");
  
  // 1. Check if table is visible to PostgREST
  const { data: tableCheck, error: tableErr } = await supabase
    .from('designs')
    .select('id')
    .limit(1);

  if (tableErr) {
    console.error("❌ Table Visibility Error:", tableErr.message);
  } else {
    console.log("✅ Table 'designs' is visible to API.");
  }

  // 2. Query information_schema directly to see what actually exists in Postgres
  // We can do this via an 'rpc' if they have one, or just try to select one thing.
  // Actually, let's try a direct SQL query via the supabase client if we can... 
  // No, supabase-js doesn't support raw SQL easily without a function.
  
  // 3. Try to select the specific column
  const { error: colErr } = await supabase
    .from('designs')
    .select('alt_text')
    .limit(1);

  if (colErr) {
    console.error("❌ Column 'alt_text' Error:", colErr.message);
  } else {
    console.log("✅ Column 'alt_text' is definitely there and accessible!");
  }
}

deepCheck();
