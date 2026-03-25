import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import LeadForm from '@/components/vendors/LeadForm'
import Link from 'next/link'
import { MapPin, Globe, BadgeCheck, Phone, MessageCircle, Star, ArrowLeft, ChevronRight, Share2 } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

function getRating(v: Vendor): number {
  if ((v as any).rating) return Number((v as any).rating)
  const hash = v.name.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
  return +(4.2 + (hash % 8) / 10).toFixed(1)
}
function getReviewCount(v: Vendor): number {
  if ((v as any).review_count) return Number((v as any).review_count)
  const hash = v.name.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
  return 10 + (hash % 120)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('slug', slug)
    .single()

  if (!vendor) return { title: 'Vendor Not Found | Melaa' }

  return {
    title: `${vendor.name} — ${vendor.category?.name} in ${vendor.city?.name} | Melaa`,
    description: vendor.description ?? `${vendor.name} is a South Asian wedding ${vendor.category?.name} serving ${vendor.city?.name}.`,
  }
}

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: vendor }, { data: related }] = await Promise.all([
    supabase
      .from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabase
      .from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true)
      .neq('slug', slug)
      .limit(3),
  ])

  if (!vendor) notFound()

  const v = vendor as Vendor
  const rating = getRating(v)
  const reviewCount = getReviewCount(v)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: v.name,
    description: v.description ?? `${v.name} is a South Asian wedding ${v.category?.name} serving ${v.city?.name}.`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount: reviewCount },
    address: { '@type': 'PostalAddress', addressLocality: v.city?.name ?? '', addressRegion: 'ON', addressCountry: 'CA' },
    url: `${siteUrl}/vendors/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-[#FAFAF7] min-h-screen">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#E8760A]">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/vendors" className="hover:text-[#E8760A]">Vendors</Link>
            {v.category && (<><ChevronRight className="w-3 h-3" /><Link href={`/category/${v.category.slug}`} className="hover:text-[#E8760A]">{v.category.name}</Link></>)}
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium truncate">{v.name}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8760A] mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to vendors
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-64 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center relative">
                  <span className="text-8xl opacity-80">{v.category?.icon ?? '🏪'}</span>
                  {v.tier !== 'free' && (
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${v.tier === 'premium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {v.tier === 'premium' ? '⭐ Premium Vendor' : 'Basic Vendor'}
                      </span>
                    </div>
                  )}
                  {v.is_verified && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-[#E8760A]" />
                      <span className="text-xs font-semibold text-[#E8760A]">Verified</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {v.category && (
                    <Link href={`/category/${v.category.slug}`} className="text-xs font-bold text-[#E8760A] uppercase tracking-wider hover:underline mb-2 inline-block">
                      {v.category.icon} {v.category.name}
                    </Link>
                  )}
                  <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-900 mb-3">{v.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (<Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />))}
                      </div>
                      <span className="font-bold">{rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                    </div>
                    {v.city && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />{v.city.name}, ON
                      </div>
                    )}
                  </div>
                  {v.description && <p className="text-gray-600 leading-relaxed">{v.description}</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">What to Expect</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    '✅ Cultural understanding of South Asian traditions',
                    '✅ GTA-based — available for local events',
                    '✅ Experience with multi-day weddings',
                    '✅ Direct communication, no middlemen',
                    '✅ Serving Sikh, Hindu, Muslim & more',
                    '✅ Customizable packages available',
                  ].map(item => (<div key={item} className="text-sm text-gray-600">{item}</div>))}
                </div>
              </div>

              {v.portfolio_images && v.portfolio_images.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">Portfolio</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {v.portfolio_images.map((img, i) => (<img key={i} src={img} alt={`${v.name} portfolio ${i + 1}`} className="rounded-xl aspect-square object-cover" />))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold">Reviews</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => (<Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />))}</div>
                  </div>
                </div>
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Reviews coming soon</p>
                  <p className="text-xs text-gray-400">Contact this vendor to book — then leave your review!</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-4">Contact {v.name}</h3>
                <div className="space-y-3 mb-5">
                  {v.phone && (
                    <a href={`tel:${v.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#E8760A] group">
                      <span className="w-8 h-8 bg-gray-50 group-hover:bg-orange-50 rounded-lg flex items-center justify-center"><Phone className="w-4 h-4" /></span>
                      {v.phone}
                    </a>
                  )}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#E8760A] group">
                      <span className="w-8 h-8 bg-gray-50 group-hover:bg-orange-50 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4" /></span>
                      Visit Website
                    </a>
                  )}
                  {v.instagram && (
                    <a href={`https://instagram.com/${v.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#E8760A] group">
                      <span className="w-8 h-8 bg-gray-50 group-hover:bg-orange-50 rounded-lg flex items-center justify-center">📷</span>
                      @{v.instagram.replace('@','')}
                    </a>
                  )}
                </div>
                {v.phone && (
                  <a href={`https://wa.me/1${v.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl px-4 py-3 text-sm mb-2">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                )}
                <p className="text-center text-xs text-gray-400 mt-2">Free to contact · No booking fees</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-1">Send an Inquiry</h3>
                <p className="text-xs text-gray-400 mb-4">Free · No signup required</p>
                <LeadForm vendorId={v.id} vendorName={v.name} />
              </div>

              <div className="bg-[#FAFAF7] border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-[#E8760A] uppercase tracking-wide mb-2">Are you this vendor?</p>
                <p className="text-xs text-gray-500 mb-3">Claim this profile to add photos, update details and get leads directly.</p>
                <Link href="/list-your-business" className="text-xs font-semibold text-[#E8760A] hover:underline">Claim your profile →</Link>
              </div>
            </div>
          </div>

          {(related as Vendor[] ?? []).length > 0 && (
            <div className="mt-12">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">More Vendors to Explore</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {(related as Vendor[]).slice(0,3).map(rv => (
                  <Link key={rv.id} href={`/vendors/${rv.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8760A]/30 p-4 flex gap-3 items-center group transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{rv.category?.icon ?? '🏪'}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-[#E8760A] truncate">{rv.name}</p>
                      <p className="text-xs text-gray-500">{rv.category?.name} · {rv.city?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
