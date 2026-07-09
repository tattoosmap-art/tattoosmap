import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, meta_title')
    .or('title.ilike.% in Ranked%,meta_title.ilike.% in Ranked%');

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  console.log(`Found ${posts?.length || 0} posts to update.`);

  for (const post of posts || []) {
    const newTitle = post.title?.replace(' in Ranked', ' — Ranked');
    const newMetaTitle = post.meta_title?.replace(' in Ranked', ' — Ranked');

    const { error: updateError } = await supabase
      .from('posts')
      .update({ title: newTitle, meta_title: newMetaTitle })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Failed to update post ${post.id}:`, updateError);
    } else {
      console.log(`Updated post ${post.id}`);
    }
  }
}

main().catch(console.error);
