import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BadgeCheck, Mail, Eye, TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Vendor Dashboard | Melaa' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('email', user.email)
    .single()

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">No vendor found</h1>
        <Link href="/list-your-business" className="bg-[#E8760A] text-white px-6 py-3 rounded-full font-medium">
          List Your Business
        </Link>
      </div>
    )
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const unreadCount = (leads ?? []).filter((l: { is_read: boolean }) => !l.is_read).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold flex items-center gap-2">
            {vendor.name}
            {vendor.is_verified && <BadgeCheck className="w-5 h-5 text-[#E8760A]" />}
          </h1>
          <p className="text-gray-500 text-sm">{vendor.category?.name} · {vendor.city?.name}</p>
        </div>
        <Link
          href={`/vendors/${vendor.slug}`}
          className="text-sm border border-gray-200 px-4 py-2 rounded-full hover:border-[#E8760A] hover:text-[#E8760A] transition-colors"
        >
          View Profile →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Mail className="w-5 h-5" />, label: 'Total Leads', value: (leads ?? []).length },
          { icon: <Eye className="w-5 h-5" />, label: 'Unread', value: unreadCount },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Plan', value: vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1) },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-[#E8760A] mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upgrade banner for free tier */}
      {vendor.tier === 'free' && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Upgrade to receive leads</p>
            <p className="text-sm text-gray-500">Free plan doesn't include buyer inquiries. Upgrade to Basic or Premium.</p>
          </div>
          <Link href="/pricing" className="bg-[#E8760A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#d06a09] whitespace-nowrap">
            See Plans
          </Link>
        </div>
      )}

      {/* Leads */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">Recent Inquiries</h2>
        {(leads ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No inquiries yet. Share your profile to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(leads ?? []).map((lead: {
              id: string
              buyer_name: string
              buyer_email: string
              event_type: string | null
              event_date: string | null
              message: string | null
              is_read: boolean
              created_at: string
            }) => (
              <div key={lead.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${!lead.is_read ? 'border-[#E8760A]' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{lead.buyer_name} {!lead.is_read && <span className="text-xs bg-orange-100 text-[#E8760A] px-2 py-0.5 rounded-full ml-1">New</span>}</p>
                    <p className="text-sm text-gray-500">{lead.buyer_email}</p>
                    {lead.event_type && <p className="text-sm text-gray-500">{lead.event_type}{lead.event_date ? ` · ${lead.event_date}` : ''}</p>}
                  </div>
                  <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
                </div>
                {lead.message && <p className="text-sm text-gray-600 mt-2 border-t pt-2">{lead.message}</p>}
                <a href={`mailto:${lead.buyer_email}`} className="text-sm text-[#E8760A] font-medium mt-2 inline-block hover:underline">
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
