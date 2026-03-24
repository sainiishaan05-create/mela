import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mela.ca'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase()
  const now = new Date()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/vendors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/list-your-business`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Vendor routes
  const { data: vendors } = await supabase
    .from('vendors')
    .select('slug')
    .eq('is_active', true)

  const vendorRoutes: MetadataRoute.Sitemap = (vendors ?? []).map((vendor) => ({
    url: `${BASE_URL}/vendors/${vendor.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Category routes
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // City routes
  const { data: cities } = await supabase
    .from('cities')
    .select('slug')

  const cityRoutes: MetadataRoute.Sitemap = (cities ?? []).map((city) => ({
    url: `${BASE_URL}/city/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Category + City combo routes
  const catSlugs = (categories ?? []).map((c) => c.slug)
  const citySlugs = (cities ?? []).map((c) => c.slug)

  const combos: MetadataRoute.Sitemap = catSlugs.flatMap((cat) =>
    citySlugs.map((city) => ({
      url: `${BASE_URL}/category/${cat}/${city}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  )

  return [
    ...staticRoutes,
    ...vendorRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...combos,
  ]
}
