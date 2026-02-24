const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log("Fetching users...");
  let { data, error } = await supabase.from('users').select('*').limit(1)
  console.log('users:', data, error)
  console.log("Fetching aadmin...");
  let { data: admin, error: aerr } = await supabase.from('aadmin').select('*').limit(1)
  console.log('aadmin:', admin, aerr)
}
test()
