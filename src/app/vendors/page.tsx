import { createClient } from '@/lib/supabase/server'
import VendorCard from '@/components/vendors/VendorCard'
import type { Vendor, Category, City } from '@/types'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Sparkles } from 'lucide-react'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import CitySearch from '@/components/ui/CitySearch'

export const metadata: Metadata = {
  title: 'Find South Asian Wedding Vendors in GTA | Melaa',
  description: 'Browse 2,700+ trusted South Asian wedding vendors in Brampton, Mississauga, Toronto and across the GTA. Photographers, caterers, decorators, mehndi artists and more.',
}

const PAGE_SIZE = 48

interface Props {
  searchParams: Promise<{ category?: string; city?: string; search?: string; sort?: string; page?: string; badge?: string }>
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category, city, search, sort, page: pageParam, badge } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const supabase = await createClient()

  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
  ])

  const activeCategory = (categories as Category[] ?? []).find(c => c.slug === category)
  const activeCity = (cities as City[] ?? []).find(c => c.slug === city)

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

  const filteredVendors = (vendors as Vendor[] ?? [])
  const totalVendors = totalCount ?? 0
  const totalPages = Math.ceil(totalVendors / PAGE_SIZE)
  const hasActiveFilters = !!(category || city || search || badge)

  // Build paginated URL helper
  function pageUrl(p: number) {
    const params = new URLSearchParams({
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(search ? { search } : {}),
      ...(sort ? { sort } : {}),
      ...(badge ? { badge } : {}),
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

      {/* ── Sticky category + city pill bar ── */}
      <div className="glass sticky top-16 z-40 border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            <Link
              href={city ? `/vendors?city=${city}` : '/vendors'}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                !category
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white/70 text-gray-500 border border-gray-200/80 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              All Categories
            </Link>
            {(categories as Category[] ?? []).map((cat) => (
              <Link
                key={cat.slug}
                href={`/vendors?category=${cat.slug}${city ? `&city=${city}` : ''}`}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  category === cat.slug
                    ? 'bg-[#E8760A] text-white shadow-saffron'
                    : 'bg-white/70 text-gray-500 border border-gray-200/80 hover:border-[#E8760A]/40 hover:text-[#E8760A]'
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* City pills — visible on mobile (sidebar handles desktop) */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide lg:hidden">
            <Link
              href={category ? `/vendors?category=${category}` : '/vendors'}
              className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                !city
                  ? 'bg-[#E8760A]/15 text-[#E8760A] border border-[#E8760A]/30'
                  : 'bg-white/70 text-gray-500 border border-gray-200/80 hover:border-[#E8760A]/40 hover:text-[#E8760A]'
              }`}
            >
              <MapPin className="w-3 h-3" />
              All Cities
            </Link>
            {(cities as City[] ?? []).map((c) => (
              <Link
                key={c.slug}
                href={`/vendors?city=${c.slug}${category ? `&category=${category}` : ''}`}
                className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  city === c.slug
                    ? 'bg-[#E8760A]/15 text-[#E8760A] border border-[#E8760A]/30'
                    : 'bg-white/70 text-gray-500 border border-gray-200/80 hover:border-[#E8760A]/40 hover:text-[#E8760A]'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Mobile filter button */}
          <div className="flex items-center justify-between lg:hidden pt-1 pb-1">
            <MobileFilterButton
              categories={(categories as Category[] ?? []).map(c => ({ ...c, icon: c.icon ?? '' }))}
              cities={cities as City[] ?? []}
              activeCategory={category}
              activeCity={city}
              activeSort={sort}
              search={search}
            />
            <span className="text-xs text-gray-400">{totalVendors} vendors</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-36 space-y-6">

            {/* City filter with search */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8760A]" />
                <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400">City</h3>
              </div>
              <CitySearch cities={cities as City[] ?? []} activeCity={city} activeCategory={category} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Sort */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400">
                  Sort By
                </h3>
              </div>
              <div className="space-y-0.5">
                {[
                  { value: '', label: 'Recommended' },
                  { value: 'newest', label: 'Newest First' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={`/vendors?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(city ? { city } : {}),
                      ...(badge ? { badge } : {}),
                      ...(opt.value ? { sort: opt.value } : {}),
                    }).toString()}`}
                    className={`block px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                      sort === opt.value || (!sort && !opt.value)
                        ? 'bg-[#111111]/8 text-[#111111] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Tier filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400">Vendor Type</h3>
              </div>
              {[
                { value: '', label: 'All Vendors' },
                { value: 'featured', label: '⭐ Featured Only' },
                { value: 'premium', label: '🔥 Premium' },
                { value: 'verified', label: '✓ Verified' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/vendors?${new URLSearchParams({
                    ...(category ? { category } : {}),
                    ...(city ? { city } : {}),
                    ...(sort ? { sort } : {}),
                    ...(opt.value ? { badge: opt.value } : {}),
                  }).toString()}`}
                  className={`block px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                    badge === opt.value || (!badge && !opt.value)
                      ? 'bg-[#111111]/8 text-[#111111] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <>
                <div className="h-px bg-gray-100" />
                <Link
                  href="/vendors"
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
                >
                  <span>✕</span> Clear all filters
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">

          {/* Results header */}
          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#111111] leading-tight">
              {activeCategory
                ? <>{activeCategory.icon} {activeCategory.name}</>
                : 'South Asian Wedding Vendors'}
              {activeCity ? (
                <span className="text-gray-400 font-normal"> in {activeCity.name}</span>
              ) : (
                <span className="text-gray-400 font-normal"> across the GTA</span>
              )}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-sm text-gray-500">
                {totalVendors > PAGE_SIZE
                  ? `Showing ${filteredVendors.length} of `
                  : ''}
                <span className="font-semibold text-[#111111]">{totalVendors}</span>
                {' '}vendor{totalVendors !== 1 ? 's' : ''}
                {search?.trim() ? ` for "${search.trim()}"` : ''}
              </p>
            </div>
          </div>

          {/* Active filters banner */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-5 px-4 py-3 bg-[#E8760A]/6 border border-[#E8760A]/15 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#E8760A] shrink-0" />
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {category && activeCategory && (
                <span className="inline-flex items-center gap-1.5 bg-white text-[#E8760A] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8760A]/20 shadow-sm">
                  {activeCategory.icon} {activeCategory.name}
                  <Link href={`/vendors?${new URLSearchParams({ ...(city ? { city } : {}), ...(sort ? { sort } : {}), ...(badge ? { badge } : {}) }).toString()}`} className="hover:opacity-60 transition-opacity ml-0.5">✕</Link>
                </span>
              )}
              {city && activeCity && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                  📍 {activeCity.name}
                  <Link href={`/vendors?${new URLSearchParams({ ...(category ? { category } : {}), ...(sort ? { sort } : {}), ...(badge ? { badge } : {}) }).toString()}`} className="hover:opacity-60 transition-opacity ml-0.5">✕</Link>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  🔍 &ldquo;{search}&rdquo;
                  <Link
                    href={`/vendors?${new URLSearchParams({ ...(category ? { category } : {}), ...(city ? { city } : {}), ...(sort ? { sort } : {}), ...(badge ? { badge } : {}) }).toString()}`}
                    className="hover:opacity-60 transition-opacity ml-0.5"
                  >✕</Link>
                </span>
              )}
              {badge && (
                <span className="inline-flex items-center gap-1.5 bg-white text-amber-600 text-xs font-semibold px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                  {badge === 'featured' ? '⭐ Featured' : badge === 'premium' ? '🔥 Premium' : '✓ Verified'}
                  <Link
                    href={`/vendors?${new URLSearchParams({ ...(category ? { category } : {}), ...(city ? { city } : {}), ...(sort ? { sort } : {}) }).toString()}`}
                    className="hover:opacity-60 transition-opacity ml-0.5"
                  >✕</Link>
                </span>
              )}
              <Link href="/vendors" className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                Clear all
              </Link>
            </div>
          )}

          {/* Results grid / empty state */}
          {filteredVendors.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-premium border border-gray-50">
              <div className="text-6xl mb-5 animate-fade-up">
                {activeCategory?.icon ?? '🔍'}
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#111111] mb-2 animate-fade-up delay-100">
                No vendors found
              </h2>
              <p className="text-gray-400 text-sm mb-2 animate-fade-up delay-150">
                {search
                  ? `No results for "${search}". Try a different search term.`
                  : 'No vendors match the selected filters yet.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 animate-fade-up delay-200">
                {hasActiveFilters && (
                  <Link
                    href="/vendors"
                    className="inline-block border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-medium hover:border-gray-300 transition-colors"
                  >
                    Clear Filters
                  </Link>
                )}
                <Link
                  href="/list-your-business"
                  className="btn-primary inline-block bg-[#E8760A] text-white px-6 py-2.5 rounded-full text-sm font-semibold"
                >
                  List Your Business Free
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="animate-fade-up">
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
              {/* Prev */}
              <Link
                href={page > 1 ? pageUrl(page - 1) : '#'}
                aria-disabled={page === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  page === 1
                    ? 'text-gray-300 pointer-events-none'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#E8760A] border border-transparent hover:border-gray-100'
                }`}
              >
                ← Prev
              </Link>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-300 select-none">
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={pageUrl(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 ${
                        p === page
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#E8760A] border border-transparent hover:border-gray-100'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              </div>

              {/* Next */}
              <Link
                href={page < totalPages ? pageUrl(page + 1) : '#'}
                aria-disabled={page === totalPages}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  page === totalPages
                    ? 'text-gray-300 pointer-events-none'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#E8760A] border border-transparent hover:border-gray-100'
                }`}
              >
                Next →
              </Link>
            </nav>
          )}

          {/* ── Bottom CTA ── */}
          {filteredVendors.length > 0 && (
            <div className="mt-14 relative overflow-hidden bg-[#111111] rounded-2xl p-10 text-center shadow-premium">
              {/* Subtle orange radial glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-48 rounded-full bg-[#E8760A] opacity-10 blur-3xl" />
              </div>

              <p className="relative text-[#E8760A] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Are you a vendor?
              </p>
              <h3 className="relative font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-white mb-3">
                Get listed on{' '}
                <span className="gradient-text">Melaa</span>
                {' '}for free
              </h3>
              <p className="relative text-gray-400 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
                90 days free, then lock in the Founding Vendor rate of{' '}
                <span className="text-white font-semibold">$49/mo forever</span>{' '}
                (normally $197/mo).
              </p>
              <Link
                href="/list-your-business"
                className="btn-primary relative inline-block bg-[#E8760A] text-white font-bold px-8 py-3.5 rounded-full shadow-saffron text-sm"
              >
                Claim My Spot →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
