const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("=== STEP 1 ===");
  const { data: all, error: err1 } = await supabase.from('designs').select('subject').eq('is_published', true);
  if(all) {
    const counts = {};
    all.forEach(d => { counts[d.subject] = (counts[d.subject] || 0) + 1; });
    const dups = Object.entries(counts).filter(([k,v]) => v > 1).sort((a,b) => b[1] - a[1]).slice(0, 20);
    if(dups.length === 0) console.log("0 duplicates found");
    else dups.forEach(([sub, count]) => console.log(`${sub}: ${count}`));
  }

  console.log("\n=== STEP 2 ===");
  const slugs = [
    'blackwork-ascending-phoenix-with-stippled-wings-and-stars',
    'fine-line-ascending-phoenix-linework-tattoo-design',
    'illustrative-ascending-phoenix-and-woman-blackwork-tattoo',
    'illustrative-stippled-ascending-woman-with-phoenix-tattoo',
    'illustrative-blackwork-celestial-phoenix-maiden-with'
  ];
  const { data: specific, error: err2 } = await supabase.from('designs').select('slug, subject, meta_title').in('slug', slugs);
  if(specific) console.log(JSON.stringify(specific, null, 2));
}
run();
