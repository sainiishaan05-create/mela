import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | Mela',
  description: 'Simple, transparent pricing for South Asian wedding vendors on Mela.',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get listed and be discovered',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Basic listing on Mela',
      'Appear in search results',
      'Category & city pages',
      'Contact info visible',
    ],
    cta: 'Get Listed Free',
    href: '/list-your-business',
    primary: false,
  },
  {
    name: 'Basic',
    price: '$99',
    period: '/month',
    description: 'For vendors ready to grow',
    color: 'border-blue-200',
    badge: 'Popular',
    features: [
      'Everything in Free',
      'Priority placement in search',
      'Up to 10 leads/month',
      'Verified badge',
      'Lead notifications by email',
      'AI-drafted reply suggestions',
    ],
    cta: 'Start Basic',
    href: '/list-your-business',
    primary: false,
  },
  {
    name: 'Premium',
    price: '$249',
    period: '/month',
    description: 'For serious wedding professionals',
    color: 'border-[#E8760A]',
    badge: 'Best Value',
    features: [
      'Everything in Basic',
      'Featured placement (top of results)',
      'Unlimited leads',
      'Portfolio gallery (up to 20 photos)',
      'Analytics dashboard',
      'Priority support',
      'Homepage feature (rotating)',
    ],
    cta: 'Go Premium',
    href: '/list-your-business',
    primary: true,
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">Simple Pricing</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Start free. Upgrade when you're ready to grow. No hidden fees, no contracts.
        </p>
        <div className="inline-block mt-4 bg-orange-50 text-[#E8760A] font-medium text-sm px-4 py-2 rounded-full">
          🎉 All plans free during our founding period — lock in your rate today
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative ${plan.primary ? 'shadow-lg scale-105' : ''}`}
          >
            {plan.badge && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${plan.primary ? 'bg-[#E8760A] text-white' : 'bg-blue-100 text-blue-700'}`}>
                {plan.badge}
              </span>
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

      <div className="mt-12 text-center text-gray-400 text-sm">
        Questions? Email us at <a href="mailto:hello@melaa.ca" className="text-[#E8760A]">hello@melaa.ca</a>
      </div>
    </div>
  )
}
