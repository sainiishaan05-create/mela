import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Vendor } from '@/types'
import LeadForm from '@/components/vendors/LeadForm'
import { MapPin, Globe, BadgeCheck, Phone, MessageCircle } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('slug', slug)
    .single()

  if (!vendor) return { title: 'Vendor Not Found | Mela' }

  return {
    title: `${vendor.name} — ${vendor.category?.name} in ${vendor.city?.name} | Mela`,
    description: vendor.description ?? `${vendor.name} is a South Asian wedding ${vendor.category?.name} serving ${vendor.city?.name}.`,
  }
}

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!vendor) notFound()

  const v = vendor as Vendor

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: v.name,
    description: v.description ?? `${v.name} is a South Asian wedding ${v.category?.name} serving ${v.city?.name}.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: v.city?.name ?? '',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    url: `${siteUrl}/vendors/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl h-56 flex items-center justify-center text-8xl mb-6">
            {v.category?.icon ?? '🏪'}
          </div>

          {/* Name + badges */}
          <div className="flex items-start gap-3 mb-2">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">{v.name}</h1>
            {v.is_verified && (
              <span className="flex items-center gap-1 bg-orange-50 text-[#E8760A] text-xs font-medium px-2 py-1 rounded-full mt-1">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>

          {/* Category + City */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            {v.category && <span className="text-[#E8760A] font-medium">{v.category.name}</span>}
            {v.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {v.city.name}, ON
              </span>
            )}
          </div>

          {/* Description */}
          {v.description && (
            <div className="mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{v.description}</p>
            </div>
          )}

          {/* Portfolio placeholder */}
          {v.portfolio_images && v.portfolio_images.length > 0 && (
            <div className="mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">Portfolio</h2>
              <div className="grid grid-cols-3 gap-3">
                {v.portfolio_images.map((img, i) => (
                  <img key={i} src={img} alt={`${v.name} portfolio ${i + 1}`} className="rounded-xl aspect-square object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Contact {v.name}</h3>
            <div className="space-y-3 mb-5">
              {v.phone && (
                <a href={`tel:${v.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E8760A]">
                  <Phone className="w-4 h-4" /> {v.phone}
                </a>
              )}
              {v.website && (
                <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E8760A]">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {v.instagram && (
                <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E8760A]">
                  <span>📷</span> @{v.instagram.replace('@', '')}
                </a>
              )}
            </div>
            {v.phone && (
              <a
                href={`https://wa.me/1${v.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-white font-medium rounded-lg px-4 py-2.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            )}
          </div>

          {/* Lead form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-1">Send an Inquiry</h3>
            <p className="text-xs text-gray-400 mb-4">Free · No signup required</p>
            <LeadForm vendorId={v.id} vendorName={v.name} />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
