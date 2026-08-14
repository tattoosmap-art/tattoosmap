import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_design_columns_rpc_not_exist_probably');
  // Wait, we can just select one row from designs and check the keys!
  const { data: rowData, error: rowError } = await supabase.from('designs').select('*').limit(1).single();
  if (rowError && rowError.code !== 'PGRST116') {
      console.error(rowError);
      return;
  }
  const keys = Object.keys(rowData || {});
  const matching = keys.filter(k => k.toLowerCase().includes('score') || k.toLowerCase().includes('tattooable') || k.toLowerCase().includes('warning') || k.toLowerCase().includes('quality'));
  console.log("Matching columns in 'designs' table:");
  console.log(matching.length > 0 ? matching : "No matching columns found.");
}

checkColumns();
