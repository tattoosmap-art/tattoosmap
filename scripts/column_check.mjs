import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

async function columnCheck() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("Identifying existing columns in 'designs' table...");
  
  // Try to insert an empty row or select everything
  const { data, error } = await supabase.from('designs').select('*').limit(1);
  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    // If the table is empty, data will be []. We need to know columns.
    // Let's try to infer from metadata if possible.
    // A trick: try to insert a wrong column name and see the error message's 'hint' or 'columns' 
    const { error: dummyErr } = await supabase.from('designs').insert({ non_existent_column: 'test' });
    if (dummyErr) {
        console.log("📊 Internal Postgres Column List (from error hint):");
        console.log(dummyErr.message);
    }
  }
}

columnCheck();
