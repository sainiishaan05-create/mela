import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import EmptyStateNotify from '@/components/ui/EmptyStateNotify'
import Link from 'next/link'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import FaqSection from '@/components/seo/FaqSection'
import CrossLinks from '@/components/seo/CrossLinks'
import { getIntroText, getFaqs, getCrossLinks } from '@/lib/seo/category-city-content'

const SITE = 'https://melaa.ca'

interface Props {
  params: Promise<{ category: string; city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city } = await params
  const supabase = await createClient()
  const [{ data: cat }, { data: c }] = await Promise.all([
    supabase.from('categories').select('name').eq('slug', category).single(),
    supabase.from('cities').select('name').eq('slug', city).single(),
  ])
  if (!cat || !c) return { title: 'Not Found' }
  return {
    title: `Best South Asian Wedding ${cat.name} in ${c.name} (2026) | Melaa`,
    description: `Browse verified South Asian wedding ${cat.name.toLowerCase()} in ${c.name}, Ontario. Compare portfolios, read reviews, and send free inquiries on Melaa.`,
    alternates: { canonical: `${SITE}/category/${category}/${city}` },
  }
}

export default async function CategoryCityPage({ params }: Props) {
  const { category, city } = await params
  const supabase = await createClient()

  // Step 1: resolve slugs + fetch cross-link data in parallel
  const [{ data: cat }, { data: cityData }, { data: allCats }, { data: allCities }] =
    await Promise.all([
      supabase.from('categories').select('*').eq('slug', category).single(),
      supabase.from('cities').select('*').eq('slug', city).single(),
      supabase.from('categories').select('slug, name').order('name'),
      supabase.from('cities').select('slug, name').order('name'),
    ])

  if (!cat || !cityData) notFound()

  // Step 2: fetch vendors using resolved IDs
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .eq('city_id', cityData.id)
    .order('is_featured', { ascending: false })

  const filtered = (vendors as Vendor[] ?? [])
  const faqs = getFaqs(category, cat.name, cityData.name)
  const crossLinks = getCrossLinks(
    category,
    city,
    (allCities ?? []) as { slug: string; name: string }[],
    (allCats ?? []) as { slug: string; name: string }[]
  )

  // ItemList structured data
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `South Asian Wedding ${cat.name} in ${cityData.name}`,
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/vendors/${v.slug}`,
      name: v.name,
    })),
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: cat.name, href: `/category/${category}` },
            { label: cityData.name },
          ]}
        />

        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            {cat.name} in {cityData.name}
          </h1>
          <p className="text-[15px] leading-relaxed max-w-3xl" style={{ color: '#8A7B74' }}>
            {getIntroText(category, cat.name, cityData.name)}
          </p>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyStateNotify
            icon={cat.icon || '✨'}
            title={`We're adding ${cat.name} in ${cityData.name} soon`}
            subtitle={`We're actively reaching out to South Asian wedding ${cat.name.toLowerCase()} in ${cityData.name}. Get notified when they join.`}
            citySlug={cityData.slug}
          />
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: '#8A7B74' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{filtered.length}</span> vendor{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
            </div>
          </>
        )}

        {/* CTA */}
        {filtered.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/vendors?category=${category}&city=${city}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{ background: 'var(--color-gold)', color: 'white' }}
            >
              View all {cat.name} in {cityData.name} with filters
            </Link>
          </div>
        )}

        {/* Cross-links */}
        <CrossLinks
          categorySlug={category}
          categoryName={cat.name}
          citySlug={city}
          cityName={cityData.name}
          sameCategoryOtherCities={crossLinks.sameCategoryOtherCities}
          sameCityOtherCategories={crossLinks.sameCityOtherCategories}
        />

        {/* FAQ */}
        <FaqSection faqs={faqs} />
      </div>
    </div>
  )
}
