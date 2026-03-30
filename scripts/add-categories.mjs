import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozidzsxuyouaacqwebfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk'
)

// Check existing
const { data: existing } = await supabase.from('categories').select('slug, name')
const existingSlugs = new Set((existing ?? []).map(c => c.slug))
console.log('Existing categories:', (existing ?? []).map(c => c.name).join(', '))

const NEW_CATEGORIES = [
  { name: 'Tent & Marquee Rentals',  slug: 'tent-rentals',        icon: '⛺', description: 'Professional tent and marquee rental services for outdoor South Asian weddings and events across the GTA.', is_active: true },
  { name: 'Sound & Lighting',        slug: 'sound-lighting',      icon: '💡', description: 'Event sound systems, stage lighting, LED walls and AV production for South Asian weddings and receptions.', is_active: true },
  { name: 'Wedding Transportation',  slug: 'transportation',      icon: '🚗', description: 'Luxury cars, limos, horse-drawn carriages and baraat transportation for South Asian weddings in the GTA.', is_active: true },
  { name: 'Invitation & Stationery', slug: 'invitations',         icon: '✉️',  description: 'Custom South Asian wedding invitations, cards, and stationery with traditional and modern designs.', is_active: true },
  { name: 'Sweet Makers & Mithai',   slug: 'sweets-mithai',       icon: '🍮', description: 'Traditional Indian, Pakistani and Sri Lankan sweets, mithai and dessert tables for South Asian weddings.', is_active: true },
  { name: 'Event Staffing',          slug: 'event-staffing',      icon: '👔', description: 'Professional waitstaff, butlers, event coordinators and hospitality crew for South Asian weddings and events.', is_active: true },
  { name: 'Florists',                slug: 'florists',            icon: '🌸', description: 'Wedding florists specializing in marigold garlands, mandap flowers and South Asian floral arrangements.', is_active: true },
  { name: 'Cake & Dessert Tables',   slug: 'cakes-desserts',      icon: '🎂', description: 'Custom South Asian wedding cakes, mithai towers and elaborate dessert tables for every celebration.', is_active: true },
  { name: 'Linen & Furniture',       slug: 'linen-furniture',     icon: '🪑', description: 'Chair covers, table linens, throne chairs and furniture rentals for South Asian wedding receptions.', is_active: true },
  { name: 'Horse & Carriage',        slug: 'horse-carriage',      icon: '🐎', description: 'Traditional baraat horse and carriage services for South Asian groom arrivals across the GTA.', is_active: true },
  { name: 'Pre-Wedding Parties',     slug: 'pre-wedding',         icon: '🎉', description: 'Sangeet, mehndi night, haldi, dholki and garba event planning services for South Asian weddings.', is_active: true },
  { name: 'Honeymoon Travel',        slug: 'honeymoon-travel',    icon: '✈️',  description: 'Honeymoon packages and travel planning tailored for South Asian newlyweds departing from the GTA.', is_active: true },
]

const toInsert = NEW_CATEGORIES.filter(c => !existingSlugs.has(c.slug))
console.log(`\nInserting ${toInsert.length} new categories:`, toInsert.map(c => c.name).join(', '))

if (toInsert.length > 0) {
  const { data, error } = await supabase.from('categories').insert(toInsert).select()
  if (error) {
    console.error('Error:', error.message)
    // Try without is_active
    const { data: d2, error: e2 } = await supabase.from('categories')
      .insert(toInsert.map(({ is_active, ...c }) => c)).select()
    if (e2) console.error('Error2:', e2.message)
    else console.log('Inserted:', d2?.map(c => c.name).join(', '))
  } else {
    console.log('Inserted:', data?.map(c => c.name).join(', '))
  }
}

// Final count
const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
console.log(`\nTotal categories in DB: ${count}`)
