/**
 * Assigns placeholder cover images to vendors that have no photo.
 * Uses high-quality Unsplash images curated per category.
 * Run: node scripts/assign-vendor-photos.mjs
 */

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://ozidzsxuyouaacqwebfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk'
)

// Curated Unsplash photos per category slug
const CATEGORY_PHOTOS = {
  photographers: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&q=80',
  ],
  videographers: [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  ],
  decorators: [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=600&fit=crop&q=80',
  ],
  catering: [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
  ],
  'makeup-artists': [
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&h=600&fit=crop&q=80',
  ],
  'mehndi-artists': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop&q=80',
  ],
  'djs-entertainment': [
    'https://images.unsplash.com/photo-1571266028243-d220c6af5583?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80',
  ],
  'wedding-venues': [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=600&fit=crop&q=80',
  ],
  'bridal-wear': [
    'https://images.unsplash.com/photo-1610173827353-de5f6f91e8e5?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4d05?w=800&h=600&fit=crop&q=80',
  ],
  'mandap-rental': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&q=80',
  ],
  florists: [
    'https://images.unsplash.com/photo-1487530811015-780780096b69?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc1b?w=800&h=600&fit=crop&q=80',
  ],
  'wedding-planners': [
    'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&q=80',
  ],
  'sweets-mithai': [
    'https://images.unsplash.com/photo-1605197788044-aed1dc25e2d9?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571181882892-e46e47b88e27?w=800&h=600&fit=crop&q=80',
  ],
  'cakes-desserts': [
    'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&h=600&fit=crop&q=80',
  ],
  'priest-services': [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&q=80',
  ],
  invitations: [
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&h=600&fit=crop&q=80',
  ],
  transportation: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&q=80',
  ],
  jewellery: [
    'https://images.unsplash.com/photo-1601121141461-9d6647bef0a7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&q=80',
  ],
  'dhol-players': [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop&q=80',
  ],
  'hair-stylists': [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=600&fit=crop&q=80',
  ],
}

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&q=80'

async function main() {
  console.log('Fetching vendors without photos...')

  // Get all categories for slug lookup
  const { data: categories } = await sb.from('categories').select('id, slug')
  const catMap = Object.fromEntries((categories || []).map(c => [c.id, c.slug]))

  // Fetch vendors with no cover_image in batches
  let updated = 0
  let page = 0
  const PAGE = 500

  while (true) {
    const { data: vendors, error } = await sb
      .from('vendors')
      .select('id, category_id, cover_image')
      .is('cover_image', null)
      .eq('is_active', true)
      .range(page * PAGE, (page + 1) * PAGE - 1)

    if (error) { console.error(error.message); break }
    if (!vendors || vendors.length === 0) break

    for (const vendor of vendors) {
      const slug = catMap[vendor.category_id] ?? 'decorators'
      const photos = CATEGORY_PHOTOS[slug] ?? [DEFAULT_PHOTO]
      const photo = photos[Math.floor(Math.random() * photos.length)]

      const { error: upErr } = await sb
        .from('vendors')
        .update({ cover_image: photo })
        .eq('id', vendor.id)

      if (upErr) console.error(`Failed ${vendor.id}:`, upErr.message)
      else updated++
    }

    console.log(`  Updated ${updated} vendors so far...`)
    page++
  }

  console.log(`\nDone! Assigned photos to ${updated} vendors.`)
}

main().catch(console.error)
