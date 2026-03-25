import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Pricing | Melaa — South Asian Wedding Vendors GTA',
  description: 'Start free for 90 days. Founding Vendors lock in $49/mo forever. Regular pricing starts at $197/mo.',
}

export const dynamic = 'force-dynamic'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get listed and start being discovered',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Basic listing on Melaa',
      'Appear in search results',
      'Category & city pages',
      'Contact info visible',
      'Up to 3 leads/month',
    ],
    cta: 'Get Listed Free',
    href: '/list-your-business',
    primary: false,
    highlight: null,
  },
  {
    name: 'Founding Member',
    price: '$49',
    period: '/month',
    description: 'First 90 days FREE — rate locked forever',
    color: 'border-[#E8760A]',
    badge: 'Limited — 50 spots',
    features: [
      'Everything in Free',
      'Priority placement in search',
      'Unlimited leads',
      'Verified badge',
      'Lead notifications by email',
      'AI-drafted reply suggestions',
      'Analytics dashboard',
      'Rate locked forever ($197/mo after)',
    ],
    cta: 'Claim Founding Spot →',
    href: '/list-your-business',
    primary: true,
    highlight: 'Free for first 90 days',
  },
  {
    name: 'Premium',
    price: '$297',
    period: '/month',
    description: 'For serious wedding professionals',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Everything in Founding Member',
      'Featured placement (top of results)',
      'Portfolio gallery (up to 30 photos)',
      'Homepage feature (rotating)',
      'Priority support',
      'Monthly performance review call',
    ],
    cta: 'Go Premium',
    href: '/list-your-business',
    primary: false,
    highlight: null,
  },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { count: vendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const spotsLeft = Math.max(0, 50 - (vendorCount ?? 0))

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">
          Simple, Honest Pricing
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          We only make money when you succeed. Start free for 90 days — no credit card required.
        </p>
        {spotsLeft > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 bg-orange-50 border border-[#E8760A] text-[#E8760A] font-semibold text-sm px-5 py-2.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#E8760A] animate-pulse" />
            Only {spotsLeft} Founding Vendor spots remaining
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative ${plan.primary ? 'shadow-xl md:scale-105' : ''}`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#E8760A] text-white whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            {plan.highlight && (
              <div className="mb-4 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                ✓ {plan.highlight}
              </div>
            )}
            <p className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-1">{plan.name}</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#E8760A] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`block text-center font-semibold py-2.5 rounded-xl transition-colors ${plan.primary ? 'bg-[#E8760A] text-white hover:bg-[#d06a09]' : 'border border-gray-200 text-gray-700 hover:border-[#E8760A] hover:text-[#E8760A]'}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Guarantee */}
      <div className="rounded-2xl border border-[#E5E5E0] bg-[#FAFAF7] p-8 text-center mb-10">
        <p className="text-3xl mb-3">🛡️</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">Our Lead Guarantee</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          If you don&apos;t receive at least one genuine inquiry in your first 90 days, we&apos;ll personally work with your profile until you do — or you owe us absolutely nothing.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-4 mb-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-center mb-6">Common Questions</h2>
        {[
          ['Do I need a credit card to start?', 'No. Your first 90 days are completely free. No card required to get listed and start receiving leads.'],
          ['What happens after 90 days?', 'Founding Vendors lock in $49/mo forever — that rate never goes up. The regular price for new vendors is $197/mo.'],
          ['Can I cancel anytime?', 'Yes. No contracts, no cancellation fees. You can cancel or downgrade whenever you like.'],
          ['How quickly will I get leads?', 'Most vendors receive their first inquiry within 7 days of their profile going live. We help optimize profiles that aren\'t converting.'],
          ['What cities do you cover?', 'All of the GTA: Toronto, Brampton, Mississauga, Markham, Vaughan, Scarborough, Richmond Hill, and surrounding areas.'],
        ].map(([q, a]) => (
          <div key={q} className="rounded-xl border border-[#E5E5E0] bg-white p-5">
            <p className="font-semibold text-[#1A1A1A] mb-1">{q}</p>
            <p className="text-sm text-gray-600">{a}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-400 text-sm">
        Questions? Email <a href="mailto:hello@melaa.ca" className="text-[#E8760A]">hello@melaa.ca</a> — we reply within 2 hours.
      </div>
    </div>
  )
}
