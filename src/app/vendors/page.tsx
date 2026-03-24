import { createClient } from '@/lib/supabase/server'
import VendorCard from '@/components/vendors/VendorCard'
import type { Vendor, Category, City } from '@/types'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find South Asian Wedding Vendors in GTA | Mela',
  description: 'Browse trusted South Asian wedding vendors in Brampton, Mississauga, Toronto and across the GTA.',
}

interface Props {
  searchParams: Promise<{ category?: string; city?: string; search?: string }>
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category, city, search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (category) query = query.eq('categories.slug', category)
  if (city) query = query.eq('cities.slug', city)

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-2">
        South Asian Wedding Vendors
      </h1>
      <p className="text-gray-500 mb-8">Serving the Greater Toronto Area</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div>
          <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Category</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={city ? `/vendors?city=${city}` : '/vendors'}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!category ? 'bg-[#E8760A] text-white border-[#E8760A]' : 'border-gray-200 text-gray-600 hover:border-[#E8760A]'}`}
            >
              All
            </Link>
            {(categories as Category[] ?? []).map((cat) => (
              <Link
                key={cat.slug}
                href={`/vendors?category=${cat.slug}${city ? `&city=${city}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${category === cat.slug ? 'bg-[#E8760A] text-white border-[#E8760A]' : 'border-gray-200 text-gray-600 hover:border-[#E8760A]'}`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full">
          <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">City</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={category ? `/vendors?category=${category}` : '/vendors'}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!city ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A]'}`}
            >
              All Cities
            </Link>
            {(cities as City[] ?? []).map((c) => (
              <Link
                key={c.slug}
                href={`/vendors?city=${c.slug}${category ? `&category=${category}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${city === c.slug ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A]'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">No vendors found</h2>
          <p className="text-gray-500 mb-6">Be the first vendor in this category!</p>
          <Link
            href="/list-your-business"
            className="bg-[#E8760A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#d06a09] transition-colors"
          >
            List Your Business
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
            {search?.trim() ? ` for "${search.trim()}"` : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
