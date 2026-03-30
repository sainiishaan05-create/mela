import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozidzsxuyouaacqwebfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWR6c3h1eW91YWFjcXdlYmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzMzYyOCwiZXhwIjoyMDg5OTA5NjI4fQ.YTk12qHnHWpV3tHwZXx_imodeS5H0FkH21Z1QbRU9Gk'
)

const CATEGORY_PHOTOS = {
  'photographers': [
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529636167498-8b4e78ece25e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&h=600&fit=crop&q=80',
  ],
  'videographers': [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop&q=80',
  ],
  'catering': [
    'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
  ],
  'decorators': [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&h=600&fit=crop&q=80',
  ],
  'mehndi-artists': [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595454223600-91fbf1c42e98?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592985684811-6c0f98adb014?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565462905680-a8cc1af80dc4?w=800&h=600&fit=crop&q=80',
  ],
  'makeup-artists': [
    'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&q=80',
  ],
  'djs-entertainment': [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  ],
  'bridal-wear': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1561709589-f73cecd4be2d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550091452-5bf0a04d00b0?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610189021571-39dc86e50a5b?w=800&h=600&fit=crop&q=80',
  ],
  'wedding-venues': [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop&q=80',
  ],
  'mandap-rental': [
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594750018636-3e73bf7d47e0?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&h=600&fit=crop&q=80',
  ],
  'wedding-planners': [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop&q=80',
  ],
  'florists': [
    'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?w=800&h=600&fit=crop&q=80',
  ],
  'tent-rentals': [
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&h=600&fit=crop&q=80',
  ],
  'sound-lighting': [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=600&fit=crop&q=80',
  ],
  'transportation': [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop&q=80',
  ],
  'cakes-desserts': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop&q=80',
  ],
  'sweets-mithai': [
    'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&h=600&fit=crop&q=80',
  ],
  'invitations': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524047934617-cb782c24e5f3?w=800&h=600&fit=crop&q=80',
  ],
  'priest-services': [
    'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
  ],
  'baraat-entertainment': [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80',
  ],
  'horse-carriage': [
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504212051762-04eecd4c6b2b?w=800&h=600&fit=crop&q=80',
  ],
  'event-staffing': [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&q=80',
  ],
  'linen-furniture': [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80',
  ],
  'pre-wedding': [
    'https://images.unsplash.com/photo-1529636167498-8b4e78ece25e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
  ],
  'honeymoon-travel': [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80',
  ],
}

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&h=600&fit=crop&q=80',
]

function getPhotosForCategory(slug) {
  return CATEGORY_PHOTOS[slug] || DEFAULT_PHOTOS
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPhotos(categorySlug, vendorIndex) {
  const photos = getPhotosForCategory(categorySlug)
  // Rotate start index so vendors in same category get different orderings
  const offset = vendorIndex % photos.length
  const rotated = [...photos.slice(offset), ...photos.slice(0, offset)]
  // Return 3-5 photos (min of available and 5)
  const count = Math.min(photos.length, 5)
  return rotated.slice(0, count)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🚀 Starting vendor photo assignment...\n')

  // Step 1: Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')

  if (catError) {
    console.error('Error fetching categories:', catError.message)
    process.exit(1)
  }

  const categoryMap = {}
  for (const cat of categories) {
    categoryMap[cat.id] = cat.slug
  }
  console.log(`Found ${categories.length} categories:`, Object.values(categoryMap).join(', '), '\n')

  // Step 2: Check if cover_image column exists by doing a test query
  let hasCoverImage = false
  const { data: testVendors } = await supabase
    .from('vendors')
    .select('id, cover_image')
    .eq('is_active', true)
    .limit(1)

  if (testVendors && testVendors.length > 0 && 'cover_image' in testVendors[0]) {
    hasCoverImage = true
    console.log('✅ cover_image column detected — will update it too\n')
  } else {
    console.log('ℹ️  cover_image column not found — will only update portfolio_images\n')
  }

  // Step 3: Fetch all active vendors in batches
  let offset = 0
  const batchSize = 100
  let totalProcessed = 0
  let totalUpdated = 0

  while (true) {
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, category_id, portfolio_images')
      .eq('is_active', true)
      .range(offset, offset + batchSize - 1)

    if (vendorError) {
      console.error('Error fetching vendors:', vendorError.message)
      break
    }

    if (!vendors || vendors.length === 0) {
      console.log('No more vendors to process.')
      break
    }

    console.log(`Processing batch: vendors ${offset + 1} to ${offset + vendors.length}`)

    // Process in sub-batches of 20 to avoid rate limits
    const updateBatchSize = 20
    for (let i = 0; i < vendors.length; i += updateBatchSize) {
      const subBatch = vendors.slice(i, i + updateBatchSize)

      const updates = subBatch.map((vendor, subIndex) => {
        const categorySlug = categoryMap[vendor.category_id] || 'default'
        const photos = pickPhotos(categorySlug, offset + i + subIndex)
        return { vendor, photos }
      })

      // Update each vendor
      for (const { vendor, photos } of updates) {
        const updateData = { portfolio_images: photos }
        if (hasCoverImage) {
          updateData.cover_image = photos[0]
        }

        const { error: updateError } = await supabase
          .from('vendors')
          .update(updateData)
          .eq('id', vendor.id)

        if (updateError) {
          console.error(`  ✗ Failed to update vendor ${vendor.id}:`, updateError.message)
        } else {
          totalUpdated++
        }
      }

      totalProcessed += subBatch.length
      process.stdout.write(`  Updated ${totalProcessed} vendors so far...\r`)

      // Small delay to avoid rate limiting
      if (i + updateBatchSize < vendors.length) {
        await sleep(100)
      }
    }

    console.log(`\n  Batch complete. Total updated: ${totalUpdated}`)

    if (vendors.length < batchSize) {
      break
    }

    offset += batchSize
    await sleep(200)
  }

  console.log(`\n✅ Done! Updated ${totalUpdated} vendors with portfolio images.`)
  if (hasCoverImage) {
    console.log(`   Also updated cover_image for ${totalUpdated} vendors.`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
