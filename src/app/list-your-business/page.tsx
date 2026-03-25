import type { Metadata } from 'next'
import VendorSignupForm from '@/components/vendors/VendorSignupForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'List Your Business Free | Melaa — South Asian Wedding Vendors GTA',
  description: 'Join as a Founding Vendor on Melaa. Free for 90 days, then lock in $49/mo forever. Get discovered by thousands of South Asian families in the GTA.',
}

export default async function ListYourBusinessPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: cities }, { count: vendorCount }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const spotsLeft = Math.max(0, 50 - (vendorCount ?? 0))

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Founding Vendor Banner */}
      <div className="mb-6 bg-[#1A1A1A] rounded-2xl p-4 text-center">
        <p className="text-[#E8760A] font-bold text-sm uppercase tracking-widest mb-1">Founding Vendor Program</p>
        <p className="text-white font-semibold text-lg">Free for 90 days. Then $49/mo locked in forever.</p>
        <p className="text-gray-400 text-sm mt-1">Only {spotsLeft} founding spots left — price goes to $197/mo after.</p>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
          Get Found by Couples Who Are Ready to Book
        </h1>
        <p className="text-gray-500 text-lg">
          South Asian weddings are a <strong className="text-[#1A1A1A]">$2B+ market in Canada</strong>. Your ideal clients are already searching — be where they look.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          ['🆓', 'Free 90 Days', 'No credit card needed'],
          ['📩', 'Real Leads', 'Direct buyer inquiries'],
          ['🔒', 'Rate Locked', '$49/mo forever after'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <VendorSignupForm categories={categories ?? []} cities={cities ?? []} />
      </div>

      {/* What happens next */}
      <div className="rounded-2xl bg-[#FAFAF7] border border-[#E5E5E0] p-6 mb-8">
        <h2 className="font-semibold text-[#1A1A1A] mb-4">What happens after you sign up:</h2>
        <ol className="space-y-3">
          {[
            ['Today', 'Your profile goes live. Couples in the GTA can find and contact you immediately.'],
            ['Days 1–90', 'You get leads for free. We prove our value before you pay a cent.'],
            ['Day 90', 'Lock in the Founding Vendor rate of $49/mo — forever. Regular price goes to $197/mo.'],
            ['Ongoing', 'Priority placement, verified badge, unlimited leads, full analytics dashboard.'],
          ].map(([day, desc]) => (
            <li key={day} className="flex gap-3 text-sm">
              <span className="font-bold text-[#E8760A] w-16 shrink-0">{day}</span>
              <span className="text-gray-600">{desc}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Guarantee */}
      <div className="rounded-2xl border-2 border-[#E8760A] bg-orange-50 p-6 text-center">
        <p className="text-2xl mb-2">🛡️</p>
        <h3 className="font-bold text-[#1A1A1A] mb-1">Our Guarantee</h3>
        <p className="text-sm text-gray-600">
          If you don&apos;t receive at least one genuine inquiry in your first 90 days, we&apos;ll personally work with you to fix your profile until you do — or you owe us nothing.
        </p>
      </div>
    </div>
  )
}
