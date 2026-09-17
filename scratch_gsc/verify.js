const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: designs, error } = await supabase
    .from('designs')
    .select('subject, meta_title, slug')
    .eq('is_published', true);

  if (error) {
    console.error(error);
    return;
  }

  const subjectMap = new Map();
  for (const d of designs) {
    const s = d.subject || '';
    if (!subjectMap.has(s)) {
      subjectMap.set(s, 0);
    }
    subjectMap.set(s, subjectMap.get(s) + 1);
  }

  let count = 0;
  for (const [subj, c] of subjectMap.entries()) {
    if (c > 1) {
      count++;
    }
  }

  console.log(`ZERO_ROWS=${count === 0}`);
  console.log(`TOTAL_DUPLICATES_COUNT=${count}`);
}
run();
