const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
      
  if (error) {
      console.error("DB ERROR (RLS?):", error);
  }
      
  console.log("DB returned length:", data?.length);
}
run();
