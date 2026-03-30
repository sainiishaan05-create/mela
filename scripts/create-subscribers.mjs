import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozidzsxuyouaacqwebfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk'
)

// Use the REST API to run raw SQL via the pg endpoint
const response = await fetch('https://ozidzsxuyouaacqwebfp.supabase.co/rest/v1/rpc/exec_sql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk',
  },
  body: JSON.stringify({
    sql: `CREATE TABLE IF NOT EXISTS subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      city TEXT,
      interests TEXT[],
      source TEXT DEFAULT 'website',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );`
  })
})

const rpcResult = await response.json()
console.log('RPC result:', JSON.stringify(rpcResult))

// Try inserting directly — if table exists, this will work
const { data, error: insertError } = await supabase
  .from('subscribers')
  .insert({ email: 'test@setup.ca', name: 'Setup Test', source: 'setup' })
  .select()

if (insertError) {
  console.log('Insert failed. Table likely needs to be created manually in Supabase SQL editor.')
  console.log('Error:', insertError.message)
  console.log('\nRun this SQL in your Supabase SQL editor (https://supabase.com/dashboard/project/ozidzsxuyouaacqwebfp/sql/new):')
  console.log(`
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  city TEXT,
  interests TEXT[],
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
  `)
} else {
  console.log('Table exists and works! Test insert:', data)
  // Clean up test row
  await supabase.from('subscribers').delete().eq('email', 'test@setup.ca')
  console.log('Test row cleaned up. Table is ready!')
}
