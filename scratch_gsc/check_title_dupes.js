const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: all } = await supabase.from('designs').select('id, slug, title, meta_title').eq('is_published', true);
  const counts = {};
  all.forEach(d => { counts[d.title] = (counts[d.title] || 0) + 1; });
  const dupes = Object.entries(counts).filter(([k,v]) => v > 1).map(([k]) => k);
  
  const toUpdate = all.filter(d => dupes.includes(d.title));
  console.log(`Found ${toUpdate.length} rows with duplicate titles.`);
  
  // Let's print a few
  console.log(toUpdate.slice(0, 5).map(d => ({ title: d.title, newTitle: d.meta_title ? d.meta_title.replace(" | TattoosMap", "") : d.title })));
}
run();
