import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

function forceCacheFlush() {
  // We can try calling PostgREST with the exact header that triggers cache reload in Supabase
  console.log("Trying to hit the endpoint to see the error directly...");
}

async function check() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { 'x-client-info': 'schema-check' } }
  });

  // Attempt to select ONLY id and slug to see if slug exists
  console.log("Testing if 'slug' exists in the database...");
  const { data, error } = await supabase.from('designs').select('id, slug').limit(1);
  if (error) {
     console.log("ERROR selecting slug:", error.message);
  } else {
     console.log("SUCCESS selecting slug! Cache might be fully flushed now.");
  }
}

check();
