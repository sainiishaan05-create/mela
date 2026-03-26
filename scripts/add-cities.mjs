import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozidzsxuyouaacqwebfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk'
)

const NEW_CITIES = [
  { name: 'Etobicoke',     slug: 'etobicoke',     province: 'ON', is_active: true },
  { name: 'North York',    slug: 'north-york',     province: 'ON', is_active: true },
  { name: 'Ajax',          slug: 'ajax',           province: 'ON', is_active: true },
  { name: 'Pickering',     slug: 'pickering',      province: 'ON', is_active: true },
  { name: 'Oshawa',        slug: 'oshawa',         province: 'ON', is_active: true },
  { name: 'Whitby',        slug: 'whitby',         province: 'ON', is_active: true },
  { name: 'Oakville',      slug: 'oakville',       province: 'ON', is_active: true },
  { name: 'Burlington',    slug: 'burlington',     province: 'ON', is_active: true },
  { name: 'Milton',        slug: 'milton',         province: 'ON', is_active: true },
  { name: 'Caledon',       slug: 'caledon',        province: 'ON', is_active: true },
  { name: 'Thornhill',     slug: 'thornhill',      province: 'ON', is_active: true },
  { name: 'Newmarket',     slug: 'newmarket',      province: 'ON', is_active: true },
  { name: 'Aurora',        slug: 'aurora',         province: 'ON', is_active: true },
  { name: 'Hamilton',      slug: 'hamilton',       province: 'ON', is_active: true },
  { name: 'Kitchener',     slug: 'kitchener',      province: 'ON', is_active: true },
  { name: 'Waterloo',      slug: 'waterloo',       province: 'ON', is_active: true },
  { name: 'Cambridge',     slug: 'cambridge',      province: 'ON', is_active: true },
  { name: 'Guelph',        slug: 'guelph',         province: 'ON', is_active: true },
  { name: 'Stouffville',   slug: 'stouffville',    province: 'ON', is_active: true },
  { name: 'Georgetown',    slug: 'georgetown',     province: 'ON', is_active: true },
  { name: 'Barrie',        slug: 'barrie',         province: 'ON', is_active: true },
  { name: 'Woodbridge',    slug: 'woodbridge',     province: 'ON', is_active: true },
]

// First check existing cities
const { data: existing } = await supabase.from('cities').select('slug')
const existingSlugs = new Set((existing ?? []).map(c => c.slug))
console.log('Existing cities:', [...existingSlugs].join(', '))

const toInsert = NEW_CITIES.filter(c => !existingSlugs.has(c.slug))
console.log(`\nInserting ${toInsert.length} new cities:`, toInsert.map(c => c.name).join(', '))

if (toInsert.length > 0) {
  const { data, error } = await supabase.from('cities').insert(toInsert).select()
  if (error) {
    console.error('Error:', error)
    // Try without is_active if column doesn't exist
    const { data: data2, error: error2 } = await supabase.from('cities')
      .insert(toInsert.map(({ is_active, ...c }) => c)).select()
    if (error2) console.error('Error2:', error2)
    else console.log('Inserted (without is_active):', data2?.map(c => c.name).join(', '))
  } else {
    console.log('Inserted:', data?.map(c => c.name).join(', '))
  }
} else {
  console.log('All cities already exist!')
}
