import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import LeadForm from '@/components/vendors/LeadForm'
import VendorCard from '@/components/vendors/VendorCard'
import Link from 'next/link'
import {
  MapPin, Globe, BadgeCheck, Phone, MessageCircle,
  ArrowLeft, ChevronRight, CheckCircle2, ArrowUpRight, Clock,
} from 'lucide-react'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors').select('*, category:categories(*), city:cities(*)')
    .eq('slug', slug).single()
  if (!vendor) return { title: 'Vendor Not Found | Melaa' }
  return {
    title: `${vendor.name} — ${vendor.category?.name} in ${vendor.city?.name} | Melaa`,
    description: vendor.description ?? `${vendor.name} is a trusted South Asian wedding ${vendor.category?.name} serving ${vendor.city?.name}, Ontario.`,
    openGraph: {
      title: `${vendor.name} | Melaa`,
      description: vendor.description ?? `South Asian wedding ${vendor.category?.name} in ${vendor.city?.name}`,
    },
  }
}

const WHAT_TO_EXPECT = [
  { icon: '🌺', text: 'Cultural understanding of South Asian traditions' },
  { icon: '📍', text: 'GTA-based — available for local events' },
  { icon: '📅', text: 'Experience with multi-day weddings' },
  { icon: '💬', text: 'Direct communication, no middlemen' },
  { icon: '🙏', text: 'Serving Sikh, Hindu, Muslim & more' },
  { icon: '✨', text: 'Customizable packages available' },
]

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vendor } = await supabase
    .from('vendors').select('*, category:categories(*), city:cities(*)')
    .eq('slug', slug).eq('is_active', true).single()

  if (!vendor) notFound()

  const { data: related } = await supabase
    .from('vendors').select('*, category:categories(*), city:cities(*)')
    .eq('is_active', true).neq('slug', slug)
    .eq('category_id', vendor.category_id).limit(3)

  const v = vendor as Vendor
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: v.name,
    description: v.description ?? `${v.name} is a South Asian wedding ${v.category?.name} serving ${v.city?.name}.`,
    address: { '@type': 'PostalAddress', addressLocality: v.city?.name ?? '', addressRegion: 'ON', addressCountry: 'CA' },
    url: `${siteUrl}/vendors/${slug}`,
    ...(v.phone ? { telephone: v.phone } : {}),
    ...(v.website ? { sameAs: [v.website] } : {}),
  }

  const waNumber = v.phone ? `1${v.phone.replace(/\D/g, '')}` : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-[#FAFAF7] min-h-screen">

        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-[#E8760A] transition-colors whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/vendors" className="hover:text-[#E8760A] transition-colors whitespace-nowrap">Vendors</Link>
            {v.category && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <Link href={`/category/${v.category.slug}`} className="hover:text-[#E8760A] transition-colors whitespace-nowrap">{v.category.name}</Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-gray-700 font-medium truncate">{v.name}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/vendors"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8760A] transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to vendors
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-premium border border-gray-100">
                {/* Hero image */}
                <div className="relative h-72 bg-[#111111] flex items-center justify-center overflow-hidden">
                  {/* Decorative rings */}
                  <div className="absolute w-64 h-64 rounded-full border border-white/5" />
                  <div className="absolute w-40 h-40 rounded-full border border-white/8" />
                  <div className="absolute w-24 h-24 rounded-full border border-white/10" />
                  {/* Radial glow */}
                  <div className="absolute inset-0 opacity-20"
                    style={{ background: 'radial-gradient(circle at 50% 50%, #E8760A 0%, transparent 65%)' }} />
                  {/* Icon */}
                  <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shadow-lg">
                    {v.category?.icon ?? '🏪'}
                  </div>
                  {/* Tier badge */}
                  {v.tier !== 'free' && (
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm ${
                        v.tier === 'premium'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-blue-500/90 text-white'
                      }`}>
                        {v.tier === 'premium' ? '⭐ Premium Vendor' : '✓ Verified Vendor'}
                      </span>
                    </div>
                  )}
                  {/* Verified */}
                  {v.is_verified && (
                    <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-[#E8760A]" />
                      <span className="text-xs font-semibold text-white">Verified</span>
                    </div>
                  )}
                  {/* Bottom fade */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/10 to-transparent" />
                </div>

                {/* Vendor info */}
                <div className="p-6 sm:p-8">
                  {v.category && (
                    <Link href={`/category/${v.category.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#E8760A] uppercase tracking-widest hover:underline mb-3">
                      {v.category.icon} {v.category.name}
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                  <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {v.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    {v.city && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {v.city.name}, Ontario
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                      New Vendor
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Free to contact
                    </span>
                  </div>

                  {v.description && (
                    <p className="text-gray-600 leading-relaxed text-[15px]">{v.description}</p>
                  )}
                </div>
              </div>

              {/* What to Expect */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-5">What to Expect</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WHAT_TO_EXPECT.map(item => (
                    <div key={item.text}
                      className="flex items-center gap-3 bg-[#FAFAF7] rounded-2xl px-4 py-3 border border-gray-100">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              {v.portfolio_images && v.portfolio_images.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-5">Portfolio</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {v.portfolio_images.map((img: string, i: number) => (
                      <div key={i} className="img-zoom rounded-2xl overflow-hidden aspect-square">
                        <img src={img} alt={`${v.name} portfolio ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-5">Reviews</h2>
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="font-semibold text-gray-700 mb-1">No reviews yet</p>
                  <p className="text-sm text-gray-400">Book this vendor and be the first to leave a review</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-4">

              {/* Contact card */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-premium lg:sticky lg:top-24">
                <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg mb-1">Contact {v.name}</h3>
                <p className="text-xs text-gray-400 mb-5">Free · No booking fees · No signup</p>

                <div className="space-y-2.5 mb-5">
                  {v.phone && (
                    <a href={`tel:${v.phone}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:border-[#E8760A]/20 border border-transparent transition-all duration-200 group">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Phone className="w-4 h-4 text-[#E8760A]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#E8760A] transition-colors">{v.phone}</p>
                      </div>
                    </a>
                  )}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-[#E8760A]/20 transition-all duration-200 group">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Globe className="w-4 h-4 text-[#E8760A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Website</p>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#E8760A] transition-colors truncate">Visit Website</p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 ml-auto shrink-0" />
                    </a>
                  )}
                  {v.instagram && (
                    <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-[#E8760A]/20 transition-all duration-200 group">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-[#E8760A] text-sm">📷</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Instagram</p>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#E8760A] transition-colors truncate">@{v.instagram.replace('@', '')}</p>
                      </div>
                    </a>
                  )}
                </div>

                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-2xl px-4 py-3.5 text-sm mb-3 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                )}
                {v.phone && (
                  <a href={`tel:${v.phone}`}
                    className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-[#E8760A] hover:text-[#E8760A] text-gray-700 font-semibold rounded-2xl px-4 py-3 text-sm transition-all duration-200 mb-3">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                )}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  No booking fees · Contact directly
                </div>
              </div>

              {/* Inquiry form */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-premium">
                <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg mb-1">Send an Inquiry</h3>
                <p className="text-xs text-gray-400 mb-5">Free · No signup required · Usually responds in 24h</p>
                <LeadForm vendorId={v.id} vendorName={v.name} />
              </div>

              {/* Claim profile */}
              <div className="bg-gradient-to-br from-[#E8760A]/5 to-amber-50/50 border border-[#E8760A]/15 rounded-3xl p-5">
                <p className="text-xs font-bold text-[#E8760A] uppercase tracking-widest mb-1.5">Are you this vendor?</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">Claim this profile to add photos, update details and receive leads directly to your inbox.</p>
                <Link href="/list-your-business"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#E8760A] hover:gap-2 transition-all duration-200">
                  Claim your profile <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Related Vendors ── */}
          {(related as Vendor[] ?? []).length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                  More {v.category?.name} in the GTA
                </h2>
                {v.category && (
                  <Link href={`/category/${v.category.slug}`}
                    className="text-sm font-semibold text-[#E8760A] hover:underline hidden sm:block">
                    See all →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {(related as Vendor[]).map(rv => (
                  <VendorCard key={rv.id} vendor={rv} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
