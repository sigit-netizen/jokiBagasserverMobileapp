const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing connectivity...');
  const { data, error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error('Query Error:', error.message);
    if (error.message.includes('relation "users" does not exist')) {
      console.log('SUGGESTION: You need to run the SQL schema in Supabase dashboard.');
    }
  } else {
    console.log('Success! Connected to Supabase and found "users" table.');
  }
}

test();
