import { createClient } from '@/lib/supabase/server'
import VendorCard from '@/components/vendors/VendorCard'
import type { Vendor, Category, City } from '@/types'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SlidersHorizontal } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find South Asian Wedding Vendors in GTA | Melaa',
  description: 'Browse 60+ trusted South Asian wedding vendors in Brampton, Mississauga, Toronto and across the GTA. Photographers, caterers, decorators, mehndi artists and more.',
}

interface Props {
  searchParams: Promise<{ category?: string; city?: string; search?: string; sort?: string }>
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category, city, search, sort } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true)

  // Sort
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default: featured first, then by created_at
    query = query.order('is_featured', { ascending: false }).order('tier').order('created_at', { ascending: false })
  }

  const [{ data: vendors }, { data: categories }, { data: cities }] = await Promise.all([
    query,
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
  ])

  const searchLower = search?.trim().toLowerCase()

  const filteredVendors = (vendors as Vendor[] ?? []).filter((v) => {
    if (category && v.category?.slug !== category) return false
    if (city && v.city?.slug !== city) return false
    if (searchLower) {
      const nameMatch = v.name?.toLowerCase().includes(searchLower)
      const descMatch = v.description?.toLowerCase().includes(searchLower)
      if (!nameMatch && !descMatch) return false
    }
    return true
  })

  const activeCategory = (categories as Category[] ?? []).find(c => c.slug === category)
  const activeCity = (cities as City[] ?? []).find(c => c.slug === city)

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              href={city ? `/vendors?city=${city}` : '/vendors'}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Categories
            </Link>
            {(categories as Category[] ?? []).map((cat) => (
              <Link
                key={cat.slug}
                href={`/vendors?category=${cat.slug}${city ? `&city=${city}` : ''}`}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat.slug ? 'bg-[#E8760A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-sm text-gray-700">Filter by City</h3>
            </div>

            <div className="space-y-1">
              <Link
                href={category ? `/vendors?category=${category}` : '/vendors'}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!city ? 'bg-[#E8760A]/10 text-[#E8760A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Cities
              </Link>
              {(cities as City[] ?? []).map((c) => (
                <Link
                  key={c.slug}
                  href={`/vendors?city=${c.slug}${category ? `&category=${category}` : ''}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${city === c.slug ? 'bg-[#E8760A]/10 text-[#E8760A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Sort By</h3>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Recommended' },
                  { value: 'newest', label: 'Newest First' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={`/vendors?${new URLSearchParams({ ...(category ? {category} : {}), ...(city ? {city} : {}), ...(opt.value ? {sort: opt.value} : {}) }).toString()}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${sort === opt.value || (!sort && !opt.value) ? 'bg-[#E8760A]/10 text-[#E8760A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {(category || city || search) && (
              <div className="border-t border-gray-100 mt-4 pt-4">
                <Link href="/vendors" className="text-xs text-red-500 hover:text-red-600 font-medium">
                  ✕ Clear all filters
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-gray-900">
                {activeCategory
                  ? `${activeCategory.icon} ${activeCategory.name}`
                  : 'All South Asian Wedding Vendors'}
                {activeCity ? ` in ${activeCity.name}` : ' in GTA'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
                {search?.trim() ? ` for "${search.trim()}"` : ''}
              </p>
            </div>

            {/* Mobile city filter */}
            <div className="lg:hidden">
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white"
                value={city ?? ''}
                onChange={(e) => {
                  const url = e.target.value
                    ? `/vendors?city=${e.target.value}${category ? `&category=${category}` : ''}`
                    : `/vendors${category ? `?category=${category}` : ''}`
                  window.location.href = url
                }}
              >
                <option value="">All Cities</option>
                {(cities as City[] ?? []).map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(category || city || search) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category && activeCategory && (
                <span className="inline-flex items-center gap-1.5 bg-[#E8760A]/10 text-[#E8760A] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {activeCategory.icon} {activeCategory.name}
                  <Link href={city ? `/vendors?city=${city}` : '/vendors'} className="hover:opacity-70">✕</Link>
                </span>
              )}
              {city && activeCity && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  📍 {activeCity.name}
                  <Link href={category ? `/vendors?category=${category}` : '/vendors'} className="hover:opacity-70">✕</Link>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  🔍 &ldquo;{search}&rdquo;
                  <Link href={`/vendors?${new URLSearchParams({...(category?{category}:{}), ...(city?{city}:{})}).toString()}`} className="hover:opacity-70">✕</Link>
                </span>
              )}
            </div>
          )}

          {/* Results grid */}
          {filteredVendors.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">🔍</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">No vendors found</h2>
              <p className="text-gray-500 mb-6">Be the first vendor in this category!</p>
              <Link
                href="/list-your-business"
                className="bg-[#E8760A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#d06a09] transition-colors"
              >
                List Your Business Free
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {filteredVendors.length > 0 && (
            <div className="mt-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center border border-orange-100">
              <p className="text-[#E8760A] text-sm font-bold uppercase tracking-widest mb-2">Are you a vendor?</p>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
                Get listed on Melaa for free
              </h3>
              <p className="text-gray-600 text-sm mb-5">
                90 days free, then lock in the Founding Vendor rate of $49/mo forever (normally $197/mo).
              </p>
              <Link href="/list-your-business"
                className="inline-block bg-[#E8760A] text-white font-bold px-8 py-3 rounded-full hover:bg-[#d06a09] transition-colors">
                Claim My Spot →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
