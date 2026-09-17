const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('designs').select('placement_recommendations, style').eq('slug', 'medusa-tattoo-design-59n4').single();
  console.log("Placement type:", typeof data.placement_recommendations, data.placement_recommendations);
  console.log("Style type:", typeof data.style, data.style);
}
run();
