import { createClient } from '@/lib/supabase/server'
import VendorCardWithSelect from '@/components/quotes/VendorCardWithSelect'
import type { Vendor, Category, City } from '@/types'
import Link from 'next/link'
import type { Metadata } from 'next'
import FilterBar from '@/components/vendors/FilterBar'
import AppliedFilterChips from '@/components/vendors/AppliedFilterChips'

export const metadata: Metadata = {
  title: 'Find South Asian Wedding & Event Vendors in GTA | Melaa',
  description: 'Browse 2,700+ trusted South Asian wedding & event vendors in Brampton, Mississauga, Toronto and across the GTA. Photographers, caterers, decorators, mehndi artists and more.',
}

const PAGE_SIZE = 48

// Curated ordered list of 12 categories shown in the pill bar
const FEATURED_CATEGORY_SLUGS = [
  'photographers',
  'videographers',
  'content-creators',
  'makeup-artists',
  'mehndi-artists',
  'catering',
  'decorators',
  'favours-live-stations',
  'djs-entertainment',
  'wedding-venues',
  'bridal-wear',
  'baraat-entertainment',
]

interface Props {
  searchParams: Promise<{ category?: string; city?: string; search?: string; sort?: string; page?: string; badge?: string; lat?: string; lng?: string; radius?: string }>
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category, city, search, sort, page: pageParam, badge, lat, lng, radius } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const supabase = await createClient()

  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
  ])

  const activeCategory = (categories as Category[] ?? []).find(c => c.slug === category)
  const activeCity = (cities as City[] ?? []).find(c => c.slug === city)

  // Location-based search mode
  const isNearMe = !!(lat && lng)
  const userLat = parseFloat(lat ?? '0')
  const userLng = parseFloat(lng ?? '0')
  const radiusKm = parseFloat(radius ?? '25')

  let filteredVendors: Vendor[] = []
  let totalVendors = 0

  if (isNearMe) {
    // Use the RPC function for distance-based search
    const { data: nearVendors } = await supabase.rpc('vendors_near', {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: radiusKm,
    })

    let results = (nearVendors ?? []) as (Vendor & { distance_km: number })[]

    // Apply category filter on results
    if (category && activeCategory) {
      results = results.filter(v => v.category_id === activeCategory.id)
    }

    // Apply search filter
    const searchLower = search?.trim().toLowerCase()
    if (searchLower) {
      results = results.filter(v =>
        v.name.toLowerCase().includes(searchLower) ||
        (v.description?.toLowerCase().includes(searchLower) ?? false)
      )
    }

    // Apply badge filter
    if (badge === 'featured') results = results.filter(v => v.is_featured)
    if (badge === 'premium') results = results.filter(v => v.tier === 'premium')
    if (badge === 'verified') results = results.filter(v => v.is_verified)

    totalVendors = results.length

    // Paginate — RPC results need manual join for category/city
    const from = (page - 1) * PAGE_SIZE
    const paged = results.slice(from, from + PAGE_SIZE)

    // Enrich with category and city objects
    const catMap = Object.fromEntries((categories as Category[] ?? []).map(c => [c.id, c]))
    const cityMap = Object.fromEntries((cities as City[] ?? []).map(c => [c.id, c]))
    filteredVendors = paged.map(v => ({
      ...v,
      category: v.category_id ? catMap[v.category_id] : undefined,
      city: v.city_id ? cityMap[v.city_id] : undefined,
    }))
  } else {
    // Standard query mode
    let query = supabase
      .from('vendors')
      .select('*, category:categories(*), city:cities(*)', { count: 'exact' })
      .eq('is_active', true)

    if (category && activeCategory) {
      query = query.eq('category_id', activeCategory.id)
    }

    if (city && activeCity) {
      query = query.eq('city_id', activeCity.id)
    }

    const searchLower = search?.trim().toLowerCase()
    if (searchLower) {
      query = query.or(`name.ilike.%${searchLower}%,description.ilike.%${searchLower}%`)
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('is_featured', { ascending: false }).order('tier').order('created_at', { ascending: false })
    }

    if (badge === 'featured') query = query.eq('is_featured', true)
    if (badge === 'premium') query = query.eq('tier', 'premium')
    if (badge === 'verified') query = query.eq('is_verified', true)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data: vendors, count: totalCount } = await query

    filteredVendors = (vendors as Vendor[] ?? [])
    totalVendors = totalCount ?? 0
  }
  const totalPages = Math.ceil(totalVendors / PAGE_SIZE)
  const hasActiveFilters = !!(category || city || search || badge || isNearMe)

  // Build paginated URL helper
  function pageUrl(p: number) {
    const params = new URLSearchParams({
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(search ? { search } : {}),
      ...(sort ? { sort } : {}),
      ...(badge ? { badge } : {}),
      ...(lat ? { lat } : {}),
      ...(lng ? { lng } : {}),
      ...(radius ? { radius } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    })
    const qs = params.toString()
    return `/vendors${qs ? `?${qs}` : ''}`
  }

  // Build page number array with ellipsis: e.g. [1, 2, 3, '...', 58]
  function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = []
    const delta = 2
    const left = current - delta
    const right = current + delta

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= left && i <= right)) {
        pages.push(i)
      } else if (i === left - 1 || i === right + 1) {
        pages.push('...')
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      <FilterBar
        categories={(categories as Category[] ?? [])}
        cities={(cities as City[] ?? [])}
        featuredCategorySlugs={FEATURED_CATEGORY_SLUGS}
        activeCategory={category}
        activeCity={city}
        activeSort={sort}
        activeBadge={badge}
        search={search}
        totalVendors={totalVendors}
      />

      <AppliedFilterChips
        categories={(categories as Category[] ?? [])}
        cities={(cities as City[] ?? [])}
        activeCategory={category}
        activeCity={city}
        activeSort={sort}
        activeBadge={badge}
        search={search}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Results header */}
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#111111] leading-tight">
            {activeCategory
              ? activeCategory.name
              : 'South Asian Wedding & Event Vendors'}
            {activeCity ? (
              <span className="text-gray-400 font-normal"> in {activeCity.name}</span>
            ) : (
              <span className="text-gray-400 font-normal"> across the GTA</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {totalVendors > PAGE_SIZE
              ? `Showing ${filteredVendors.length} of `
              : ''}
            <span className="font-semibold text-[#111111]">{totalVendors}</span>
            {' '}vendor{totalVendors !== 1 ? 's' : ''}
            {search?.trim() ? ` for "${search.trim()}"` : ''}
          </p>
        </div>

        {/* Results grid / empty state */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-premium border border-gray-50">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#111111] mb-2">
              No vendors found
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              {search
                ? `No results for "${search}". Try a different search term.`
                : 'No vendors match the selected filters yet.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              {hasActiveFilters && (
                <Link
                  href="/vendors"
                  className="inline-block border border-gray-200 text-gray-600 px-6 py-3 rounded-full text-sm font-medium hover:border-gray-300 transition-colors"
                >
                  Clear filters
                </Link>
              )}
              <Link
                href="/list-your-business"
                className="inline-block bg-[#C8A96A] text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                List Your Business Free
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredVendors.map((vendor) => (
              <VendorCardWithSelect key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
            <Link
              href={page > 1 ? pageUrl(page - 1) : '#'}
              aria-disabled={page === 1}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                page === 1
                  ? 'text-gray-300 pointer-events-none'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#C8A96A] border border-transparent hover:border-gray-100'
              }`}
            >
              ← Prev
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-1">
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-300 select-none">…</span>
                ) : (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 ${
                      p === page
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#C8A96A] border border-transparent hover:border-gray-100'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
            </div>
            <Link
              href={page < totalPages ? pageUrl(page + 1) : '#'}
              aria-disabled={page === totalPages}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                page === totalPages
                  ? 'text-gray-300 pointer-events-none'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#C8A96A] border border-transparent hover:border-gray-100'
              }`}
            >
              Next →
            </Link>
          </nav>
        )}
      </div>
    </div>
  )
}
