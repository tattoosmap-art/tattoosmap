import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Simple .env.local parser for ESM
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

async function checkSchema() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Checking remote Supabase connection...");
  const { data, error } = await supabase.from('designs').select('*').limit(1);
  
  if (error) {
    console.error("❌ Database Error:", error.message);
  } else {
    // If table is empty, columns list might be tricky from data[0].
    // Let's try to fetch column names from postgrest if possible or just assume it's empty.
    if (data.length === 0) {
        console.log("ℹ️ Table 'designs' is empty. Testing an insert to see if 'alt_text' is accepted...");
        const { error: insErr } = await supabase.from('designs').insert({ 
            slug: 'schema-test', 
            seo_filename: 'test.webp',
            subject: 'test',
            public_category: 'nature-botanical',
            alt_text: 'test alt', // This is the column in question
            speakable_summary: 'test summary'
        });
        if (insErr) {
            console.error("❌ Insert failed:", insErr.message);
            if (insErr.message.includes("column \"alt_text\" of relation \"designs\" does not exist")) {
                console.log("🛑 CONFIRMED: The 'alt_text' column is missing from the remote database.");
            }
        } else {
            console.log("✅ Schema test passed! 'alt_text' is accepted. The previous error might have been a cache issue.");
            await supabase.from('designs').delete().eq('slug', 'schema-test');
        }
    } else {
        console.log("✅ Columns found in existing row:", Object.keys(data[0]));
    }
  }
}

checkSchema();
