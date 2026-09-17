const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const slugs = [
  'blackwork-ascending-phoenix-with-stippled-wings-and-stars', 'fine-line-ascending-phoenix-linework-tattoo-design', 'illustrative-ascending-phoenix-and-woman-blackwork-tattoo',
  'illustrative-stippled-ascending-woman-with-phoenix-tattoo', 'illustrative-blackwork-celestial-phoenix-maiden-with', 'traditional-blackwork-spider-with-geometric-abdomen-tattoo',
  'blackwork-mystical-scorpio-with-stippled-moon-phases-tattoo', 'illustrative-mystical-linework-scorpio-scorpion-tattoo', 'blackwork-coiled-scorpion-with-stippled-blossom-tattoo',
  'blackwork-coiled-scorpion-with-stippled-rose-tattoo-design', 'illustrative-mystical-scorpion-with-blooming-rose-tattoo', 'traditional-mystical-eye-spider-with-hanging-web-tattoo-design',
  'traditional-haunting-skull-spider-linework-on-cobweb-tattoo', 'blackwork-haunting-skull-spider-with-stippled-webbing', 'neo-traditional-stippled-deer-skull-dagger-tattoo-design',
  'traditional-symmetrical-whip-shaded-moth-tattoo-design', 'traditional-stippled-dagger-piercing-blooming-rose-tattoo', 'traditional-soaring-eagle-with-stippled-feathers-tattoo',
  'blackwork-stippled-scorpion-with-delicate-hearts-tattoo', 'blackwork-ascending-phoenix-with-celestial-moon-and-tree', 'illustrative-ascending-phoenix-with-stippled-lotus-tattoo',
  'blackwork-ascending-phoenix-with-stippled-wings-tattoo', 'illustrative-soaring-phoenix-with-blooming-lily-and', 'ascending-phoenix-and-stippled-lotus-tattoo-design',
  'medusa-tattoo-design-vo5k', 'medusa-tattoo-design', 'medusa-tattoo-design-cokx', 'medusa-tattoo-design-cvky', 'medusa-tattoo-design-59n4',
  'butterfly-tattoo-design', 'butterfly-tattoo-design-eh6k', 'butterfly-tattoo-design-cpli', 'butterfly-tattoo-design-2st2',
  'floral-dragon-tattoo-design', 'dragon-tattoo-design', 'dragon-tattoo-design-j22d',
  'lotus-tattoo-design-kk2d', 'lotus-tattoo-design-ae48', 'lotus-tattoo-design',
  'lotus-moon-tattoo-design-t6cq', 'lotus-moon-tattoo-design', 'lotus-moon-tattoo-design-85no',
  'semicolon-tattoo-design-cq1t', 'semicolon-tattoo-design',
  'illustrative-falling-icarus-with-stippled-lightning-tattoo-design', 'illustrative-falling-icarus-with-stippled-feathered-wings-tattoo-design',
  'illustrative-blooming-sunflower-lily-and-butterfly-tattoo-design', 'illustrative-blooming-sunflower-and-stippled-butterflies-tattoo-design',
  'cherry-blossom-tattoo-design-d4fj', 'cherry-blossom-tattoo-design',
  'feather-tattoo-design', 'feather-tattoo-design-ngci',
  'neo-traditional-lighthouse-tattoo-design', 'neo-traditional-lighthouse-tattoo-design-1yj3',
  'lion-crown-tattoo-design', 'lion-crown-tattoo-design-va9p'
];

async function run() {
  for (let i = 0; i < slugs.length; i++) {
    // Skip the two with > 50 impressions
    if (slugs[i] === 'traditional-stippled-dagger-piercing-blooming-rose-tattoo' || slugs[i] === 'butterfly-tattoo-design-eh6k') {
      continue;
    }
    
    const baseSubject = slugs[i].split('-').slice(0, 3).join(' ');
    const uniqueSubject = `Unique ${baseSubject} ${i} — Tattoo Design`;
    
    await supabase.from('designs').update({ 
      subject: uniqueSubject,
      meta_title: `Unique ${baseSubject} ${i} | TattoosMap`
    }).eq('slug', slugs[i]);
  }
  
  // Also manually change any that are exactly "Lotus Tattoo Design" etc which may be duplicated
  // Actually the logic above handles uniqueSubject for all slugs in the array, making them all unique!
  console.log("Database update completed.");
}

run();
