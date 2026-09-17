import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
async function run() {
  const { data, error } = await supabase.from('posts').select('slug, updated_at').eq('is_published', true);
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}
run();
