import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import Link from 'next/link'

interface Props {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const supabase = await createClient()
  const { data: c } = await supabase.from('cities').select('*').eq('slug', city).single()
  if (!c) return { title: 'Not Found' }
  return {
    title: `South Asian Wedding Vendors in ${c.name} | Melaa`,
    description: `Find South Asian wedding photographers, decorators, caterers and more in ${c.name}, Ontario.`,
  }
}

export default async function CityPage({ params }: Props) {
  const { city } = await params
  const supabase = await createClient()

  const [{ data: cityData }, { data: vendors }, { data: categories }] = await Promise.all([
    supabase.from('cities').select('*').eq('slug', city).single(),
    supabase.from('vendors').select('*, category:categories(*), city:cities(*)').eq('is_active', true).order('is_featured', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!cityData) notFound()

  const filtered = (vendors as Vendor[] ?? []).filter(v => v.city?.slug === city)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-2">
        Wedding Vendors in {cityData.name}
      </h1>
      <p className="text-gray-500 mb-8">South Asian wedding vendors serving {cityData.name}, Ontario</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(categories ?? []).map((cat: { slug: string; icon: string; name: string }) => (
          <Link key={cat.slug} href={`/category/${cat.slug}/${city}`} className="px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors">
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏙️</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">No vendors in {cityData.name} yet</h2>
          <p className="text-gray-500 mb-6">Be the first vendor listed in {cityData.name}!</p>
          <Link href="/list-your-business" className="bg-[#C8A96A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B8945A] transition-colors">
            List Your Business
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
          </div>
        </>
      )}
    </div>
  )
}
