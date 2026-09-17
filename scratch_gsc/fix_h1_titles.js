const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: all } = await supabase.from('designs').select('id, slug, title, meta_title').eq('is_published', true);
  
  let updatedCount = 0;
  for (const d of all) {
    if (!d.meta_title) continue;
    let newTitle = d.meta_title.replace(" | TattoosMap", "").replace(" — Meaning & Symbolism", "").trim();
    if (d.title !== newTitle) {
      await supabase.from('designs').update({ title: newTitle }).eq('id', d.id);
      console.log(`Updated ${d.slug} -> ${newTitle}`);
      updatedCount++;
    }
  }
  console.log(`Finished updating ${updatedCount} rows.`);
}
run();
