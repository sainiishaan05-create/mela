import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor, Category } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import Link from 'next/link'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', category).single()
  if (!cat) return { title: 'Not Found' }
  return {
    title: `South Asian Wedding ${cat.name} in GTA | Mela`,
    description: `Find the best South Asian wedding ${cat.name.toLowerCase()} in Brampton, Mississauga, Toronto and across the GTA.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const supabase = await createClient()

  const [{ data: cat }, { data: vendors }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', category).single(),
    supabase.from('vendors').select('*, category:categories(*), city:cities(*)').eq('is_active', true).order('is_featured', { ascending: false }),
    supabase.from('cities').select('*').order('name'),
  ])

  if (!cat) notFound()

  const filtered = (vendors as Vendor[] ?? []).filter(v => v.category?.slug === category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-4xl mb-3">{(cat as Category).icon}</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-2">
          South Asian Wedding {(cat as Category).name} in GTA
        </h1>
        <p className="text-gray-500">{(cat as Category).description}</p>
      </div>

      {/* City filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href={`/category/${category}`} className="px-4 py-1.5 rounded-full text-sm bg-[#E8760A] text-white">All Cities</Link>
        {(cities ?? []).map((c: { slug: string; name: string }) => (
          <Link key={c.slug} href={`/category/${category}/${c.slug}`} className="px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 hover:border-[#E8760A] hover:text-[#E8760A] transition-colors">
            {c.name}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{(cat as Category).icon}</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">No {(cat as Category).name} yet</h2>
          <p className="text-gray-500 mb-6">Be the first {(cat as Category).name.toLowerCase()} on Mela!</p>
          <Link href="/list-your-business" className="bg-[#E8760A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#d06a09] transition-colors">
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
