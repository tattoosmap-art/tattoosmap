import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

async function discoverMissingColumns() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const targetColumns = [
    'slug', 'seo_filename', 'thumbnail_filename', 'subject', 'public_category', 
    'family_internal', 'mood', 'elements', 'alt_text', 'speakable_summary', 
    'visual_work_schema', 'speakable_schema', 'confidence_score', 'ip_flag', 'status'
  ];

  console.log("Testing columns by inserting a dummy row...");
  
  // We insert an empty payload and see which column it complains about first,
  // but the easiest way is to use REST's OPTIONS method to get the OpenAPI schema.
  
  const optionsUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/designs`;
  
  try {
      const response = await fetch(optionsUrl, {
          method: 'OPTIONS',
          headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
          }
      });
      
      const schema = await response.json();
      const existingColumns = Object.keys(schema.definitions.designs.properties);
      
      console.log('✅ Existing columns:', existingColumns.join(', '));
      
      const missing = targetColumns.filter(c => !existingColumns.includes(c));
      
      if (missing.length > 0) {
          console.log('\n❌ Missing columns identified:', missing.join(', '));
          
          let alterQueries = missing.map(col => {
              if (['visual_work_schema', 'speakable_schema'].includes(col)) return `ADD COLUMN IF NOT EXISTS ${col} JSONB`;
              if (col === 'elements') return `ADD COLUMN IF NOT EXISTS ${col} TEXT[] DEFAULT '{}'`;
              if (col === 'confidence_score') return `ADD COLUMN IF NOT EXISTS ${col} DECIMAL(3,2)`;
              if (col === 'ip_flag') return `ADD COLUMN IF NOT EXISTS ${col} BOOLEAN DEFAULT FALSE`;
              if (col === 'status') return `ADD COLUMN IF NOT EXISTS ${col} TEXT DEFAULT 'draft'`;
              return `ADD COLUMN IF NOT EXISTS ${col} TEXT`;
          });
          
          console.log("\n--- COPY AND RUN THIS SQL IN SUPABASE ---");
          console.log("ALTER TABLE designs");
          console.log(alterQueries.join(",\n") + ";");
          console.log("-----------------------------------------");
      } else {
          console.log('🎉 All required columns are present!');
      }
      
  } catch (err) {
      console.error("Fetch Error:", err.message);
  }
}

discoverMissingColumns();
