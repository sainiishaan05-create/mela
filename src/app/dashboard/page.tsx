import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BadgeCheck, Mail, TrendingUp, CreditCard, CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Vendor Dashboard | Melaa' }

interface Lead {
  id: string
  buyer_name: string
  buyer_email: string
  event_type: string | null
  event_date: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string }>
}) {
  const params = await searchParams
  const justClaimed = params.claimed === '1'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('claimed_by_user_id', user.id)
    .limit(1)
    .single()

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">
          No claimed listing found
        </h1>
        <p className="text-gray-500 mb-6">
          Find your business in our directory and claim your listing to get started.
        </p>
        <Link
          href="/vendors"
          className="bg-[#C8A96A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#d06a09] transition-colors"
        >
          Find Your Listing
        </Link>
      </div>
    )
  }

  // 30-day leads count
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('vendor_id', vendor.id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })

  const monthlyLeadCount = (recentLeads ?? []).length
  const isSubscribed = vendor.tier !== 'free'
  const tierLabel =
    vendor.tier === 'basic'
      ? 'Basic'
      : vendor.tier === 'premium'
        ? 'Premium'
        : 'Free'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Claimed success banner */}
      {justClaimed && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">Your listing is now claimed!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold flex items-center gap-2">
            {vendor.name}
            {vendor.is_verified && <BadgeCheck className="w-5 h-5 text-[#C8A96A]" />}
          </h1>
          <p className="text-gray-500 text-sm">
            {vendor.category?.name} &middot; {vendor.city?.name}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            vendor.tier === 'free'
              ? 'bg-gray-100 text-gray-600'
              : vendor.tier === 'premium'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-[#F5ECD7] text-[#C8A96A]'
          }`}
        >
          {tierLabel}
        </span>
      </div>

      {/* Listing card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Your Listing</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Category</p>
            <p className="font-medium">{vendor.category?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">City</p>
            <p className="font-medium">{vendor.city?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Plan</p>
            <p className="font-medium">{tierLabel}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
            <p className="font-medium flex items-center gap-1">
              {vendor.is_verified ? (
                <><BadgeCheck className="w-4 h-4 text-[#C8A96A]" /> Verified</>
              ) : (
                'Unverified'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription status */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#C8A96A]" />
            <div>
              <p className="font-semibold text-gray-800">Subscription</p>
              {isSubscribed ? (
                <p className="text-sm text-green-600 font-medium">
                  Active &mdash; Founding Member $49/mo
                </p>
              ) : (
                <p className="text-sm text-gray-500">Inactive — upgrade to unlock leads</p>
              )}
            </div>
          </div>
          {!isSubscribed && (
            <Link
              href="/pricing"
              className="bg-[#C8A96A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#d06a09] transition-colors whitespace-nowrap"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-[#C8A96A] mb-2">
            <Mail className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{monthlyLeadCount}</p>
          <p className="text-sm text-gray-500">Inquiries this month</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-[#C8A96A] mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{tierLabel}</p>
          <p className="text-sm text-gray-500">Current plan</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <Link
          href={`/vendors/${vendor.slug}`}
          className="flex-1 text-center bg-[#C8A96A] text-white font-medium px-6 py-3 rounded-full hover:bg-[#d06a09] transition-colors"
        >
          View Your Listing
        </Link>
        <a
          href="mailto:hello@melaa.ca"
          className="flex-1 text-center border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-full hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors"
        >
          Contact Support
        </a>
      </div>

      {/* Recent inquiries */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">
          Recent Inquiries
        </h2>
        {(recentLeads ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No inquiries in the last 30 days. Share your profile to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(recentLeads ?? []).map((lead: Lead) => (
              <div
                key={lead.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm ${
                  !lead.is_read ? 'border-[#C8A96A]' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {lead.buyer_name}
                      {!lead.is_read && (
                        <span className="text-xs bg-[#F5ECD7] text-[#C8A96A] px-2 py-0.5 rounded-full ml-2">
                          New
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{lead.buyer_email}</p>
                    {lead.event_type && (
                      <p className="text-sm text-gray-500">
                        {lead.event_type}
                        {lead.event_date ? ` · ${lead.event_date}` : ''}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap ml-3">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
                {lead.message && (
                  <p className="text-sm text-gray-600 mt-2 border-t pt-2">{lead.message}</p>
                )}
                <a
                  href={`mailto:${lead.buyer_email}`}
                  className="text-sm text-[#C8A96A] font-medium mt-2 inline-block hover:underline"
                >
                  Reply →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
