import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import EmptyStateNotify from '@/components/ui/EmptyStateNotify'
import Link from 'next/link'

interface Props {
  params: Promise<{ category: string; city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city } = await params
  const supabase = await createClient()
  const [{ data: cat }, { data: c }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', category).single(),
    supabase.from('cities').select('*').eq('slug', city).single(),
  ])
  if (!cat || !c) return { title: 'Not Found' }
  return {
    title: `South Asian Wedding ${cat.name} in ${c.name} | Melaa`,
    description: `Find the best South Asian wedding ${cat.name.toLowerCase()} in ${c.name}, Ontario. Browse verified vendors on Melaa.`,
  }
}

export default async function CategoryCityPage({ params }: Props) {
  const { category, city } = await params
  const supabase = await createClient()

  const [{ data: cat }, { data: cityData }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', category).single(),
    supabase.from('cities').select('*').eq('slug', city).single(),
  ])

  if (!cat || !cityData) notFound()

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .eq('city_id', cityData.id)
    .order('is_featured', { ascending: false })

  const filtered = (vendors as Vendor[] ?? [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-sm text-gray-400 mb-4">
        <Link href={`/category/${category}`} className="hover:text-[#C8A96A]">{cat.name}</Link> → {cityData.name}
      </div>
      <div className="mb-8">
        <p className="text-4xl mb-3">{cat.icon}</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-2">
          Wedding {cat.name} in {cityData.name}
        </h1>
        <p className="text-gray-500">South Asian wedding {cat.name.toLowerCase()} serving {cityData.name}, Ontario</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateNotify
          icon={cat.icon || '✨'}
          title={`We're adding ${cat.name} in ${cityData.name} soon`}
          subtitle={`We're actively reaching out to South Asian wedding ${cat.name.toLowerCase()} in ${cityData.name}. Get notified when they join.`}
          citySlug={cityData.slug}
        />
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
