import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Handle missing environment variables during build by providing dummy values if not present.
// This prevents Next.js from throwing `supabaseUrl is required` when it tries to pre-render pages during build phase
// without loaded environment variables on Vercel.
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', 
  supabaseKey || 'dummy-key'
)

// Keep db export for compatibility during migration if needed,
// but we will eventually replace its usage.
export const db = supabase
