import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('designs')
    .select('slug, image_url, thumbnail_url')
    .eq('is_published', true)
    .not('thumbnail_url', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(data);
  }
}

run();
