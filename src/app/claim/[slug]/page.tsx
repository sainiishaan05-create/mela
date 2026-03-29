import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Tag, ArrowLeft } from 'lucide-react'
import ClaimForm from './ClaimForm'

interface Props {
  params: Promise<{ slug: string }>
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = getServiceClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('name')
    .eq('slug', slug)
    .single()
  if (!vendor) return { title: 'Claim Listing | Melaa' }
  return {
    title: `Claim ${vendor.name} | Melaa`,
    description: `Verify you own ${vendor.name} and take control of your Melaa listing.`,
  }
}

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params
  const supabase = getServiceClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, name, slug, claim_status, category:categories(name), city:cities(name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!vendor) notFound()

  if ((vendor as { claim_status?: string }).claim_status === 'claimed') {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Already Claimed
          </h1>
          <p className="text-gray-500 mb-6">
            This listing has already been claimed by its owner.
          </p>
          <Link
            href={`/vendors/${slug}`}
            className="inline-flex items-center gap-2 text-[#E8760A] hover:underline text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listing
          </Link>
        </div>
      </div>
    )
  }

  type VendorRow = {
    name: string
    slug: string
    category?: { name: string }[] | null
    city?: { name: string }[] | null
  }
  const v = vendor as unknown as VendorRow

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href={`/vendors/${slug}`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#E8760A] text-sm mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listing
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#E8760A]/10 text-[#E8760A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Claim Your Listing
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">
            {v.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            {v.category?.[0]?.name && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {v.category[0].name}
              </span>
            )}
            {v.city?.[0]?.name && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {v.city[0].name}
              </span>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <h2 className="font-semibold text-[#1A1A1A] text-lg mb-1">
            Is this your business?
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Enter your business email below and we&apos;ll send you a verification link. Once
            verified, you can manage your listing and upgrade to a paid plan.
          </p>

          <ClaimForm slug={slug} vendorName={v.name} />
        </div>

        {/* Trust note */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['✅', 'No credit card', 'required to verify'],
            ['📧', 'Instant email', 'sent to your inbox'],
            ['🔒', 'Secure', '24-hour token'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs font-semibold text-[#1A1A1A]">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
