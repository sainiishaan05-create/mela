import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor, Category, City } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface Props {
  params: Promise<{ category: string }>
  searchParams?: Promise<{ city?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', category).single()
  if (!cat) return { title: 'Not Found' }
  return {
    title: `South Asian Wedding ${cat.name} in GTA | Melaa`,
    description: `Find the best South Asian wedding ${cat.name.toLowerCase()} in Brampton, Mississauga, Toronto and across the GTA.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const supabase = await createClient()

  // Fetch category first, then use its id for the vendors query — avoids fetching all vendors
  const [{ data: cat }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', category).single(),
    supabase.from('cities').select('*').order('name'),
  ])

  if (!cat) notFound()

  const typedCat = cat as Category

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true)
    .eq('category_id', typedCat.id)
    .order('is_featured', { ascending: false })
    .order('tier')
    .limit(48)

  const filteredVendors = (vendors as Vendor[] ?? [])
  const vendorCount = filteredVendors.length

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* ── Dark hero section ── */}
      <section className="relative bg-[#111111] overflow-hidden">
        {/* Radial glow behind the icon */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10">
          <div className="w-80 h-40 rounded-full bg-[#C8A96A] opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-10 text-center">
          {/* Category icon */}
          <div className="text-6xl mb-5 animate-fade-up">{typedCat.icon}</div>

          {/* Category name */}
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-up delay-100">
            South Asian Wedding{' '}
            <span className="gradient-text">{typedCat.name}</span>
          </h1>

          {/* Description */}
          {typedCat.description && (
            <p className="text-gray-400 text-base max-w-xl mx-auto mb-5 animate-fade-up delay-150">
              {typedCat.description}
            </p>
          )}

          {/* Vendor count badge */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 mb-8 animate-fade-up delay-200">
            <span className="w-2 h-2 rounded-full bg-[#C8A96A]" />
            <span className="text-white text-sm font-semibold">
              {vendorCount} vendor{vendorCount !== 1 ? 's' : ''} in the GTA
            </span>
          </div>

          {/* City filter pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up delay-300">
            <Link
              href={`/category/${category}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#C8A96A] text-white shadow-saffron transition-all duration-200 hover:opacity-90"
            >
              <MapPin className="w-3.5 h-3.5" />
              All Cities
            </Link>
            {(cities as City[] ?? []).map((c) => (
              <Link
                key={c.slug}
                href={`/category/${category}/${c.slug}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendor grid ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {filteredVendors.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 bg-white rounded-2xl shadow-premium border border-gray-50">
            <div className="text-6xl mb-5 animate-fade-up">{typedCat.icon}</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#111111] mb-2 animate-fade-up delay-100">
              No {typedCat.name} yet
            </h2>
            <p className="text-gray-400 text-sm mb-6 animate-fade-up delay-150">
              Be the first {typedCat.name.toLowerCase()} on Melaa — it&apos;s completely free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-200">
              <Link
                href="/vendors"
                className="inline-block border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Browse All Vendors
              </Link>
              <Link
                href="/list-your-business"
                className="btn-primary inline-block bg-[#C8A96A] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-saffron"
              >
                List Your Business Free
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
              {vendorCount} vendor{vendorCount !== 1 ? 's' : ''} &mdash; sorted by featured
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVendors.map((vendor, i) => (
                <div
                  key={vendor.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                >
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Bottom CTA ── */}
        {filteredVendors.length > 0 && (
          <div className="mt-14 relative overflow-hidden bg-[#111111] rounded-2xl p-10 text-center shadow-premium">
            {/* Subtle gold radial glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-48 rounded-full bg-[#C8A96A] opacity-10 blur-3xl" />
            </div>

            <p className="relative text-[#C8A96A] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Are you a {typedCat.name.toLowerCase()}?
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
              className="btn-primary relative inline-block bg-[#C8A96A] text-white font-bold px-8 py-3.5 rounded-full shadow-saffron text-sm"
            >
              Claim My Spot →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
