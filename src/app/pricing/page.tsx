import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Pricing | Melaa | South Asian Wedding Vendors GTA',
  description: 'Start free for 90 days. First 50 Founding Vendors get the exclusive $49/mo rate. Premium plan at $99/mo.',
}

const PLAN_BASE = [
  {
    name: 'Free',
    price: '$0',
    period: '/always free',
    description: 'Get discovered by couples today',
    primary: false,
    highlight: null,
    features: [
      'Listed in the Melaa directory',
      'Appear in search results',
      'Category & city pages',
      'Contact info visible',
      'Up to 3 couple inquiries/month',
    ],
    cta: 'Get Listed Free',
    href: '/list-your-business',
  },
  {
    name: 'Founding Member',
    price: '$49',
    period: '/month',
    description: 'First 90 days completely free',
    primary: true,
    highlight: '90 days free, no credit card',
    features: [
      'Everything in Free',
      'Priority placement in search',
      'Unlimited couple inquiries',
      'Verified vendor badge',
      'Lead notifications by email',
      'AI-drafted reply suggestions',
      'Analytics dashboard',
      'Founding rate: only for the first 50 vendors',
    ],
    cta: 'Claim Founding Spot',
    href: '/list-your-business',
  },
  {
    name: 'Premium',
    price: '$99',
    period: '/month',
    description: 'Maximum visibility for top vendors',
    primary: false,
    highlight: null,
    features: [
      'Everything in Founding Member',
      'Featured at top of all results',
      'Portfolio gallery (30 photos)',
      'Homepage rotating feature',
      'Priority support',
      'Monthly performance call',
    ],
    cta: 'Go Premium',
    href: '/list-your-business',
  },
]

const FAQS = [
  { q: 'Do I need a credit card to start?', a: 'No. Your first 90 days are completely free. No card required to get listed and start receiving leads from couples.' },
  { q: 'What happens after 90 days?', a: 'The first 50 vendors to sign up get the exclusive $49/mo Founding Member rate. Once all 50 spots are claimed, standard pricing applies for new vendors.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no cancellation fees. Cancel or downgrade whenever you like, no questions asked.' },
  { q: 'How quickly will I get leads?', a: "Most vendors receive their first inquiry within 7 days of going live. We help optimize profiles that aren't converting." },
  { q: 'What cities do you cover?', a: 'All of the GTA: Toronto, Brampton, Mississauga, Markham, Vaughan, Scarborough, Richmond Hill, Kitchener-Waterloo and surrounding areas.' },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { count: vendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  const spotsLeft = Math.max(0, 50 - (vendorCount ?? 0))

  const plans = PLAN_BASE.map(plan => ({
    ...plan,
    badge: plan.primary && spotsLeft > 0 ? `${spotsLeft} spots left` : null,
  }))

  return (
    <div className="bg-[#FAFAF7] min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#111111] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, #C8A96A 0%, transparent 60%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-[#C8A96A] text-xs font-bold uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold mb-5">
            Simple, Honest Pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            We only make money when you succeed. Start free for 90 days, no credit card, no commitment.
          </p>
          {spotsLeft > 0 && (
            <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 text-sm px-5 py-2.5 rounded-full backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8A96A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8A96A]" />
              </span>
              <span className="text-gray-300">
                Only <span className="text-[#C8A96A] font-bold">{spotsLeft} founding spots</span> remaining at $49/mo
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`relative bg-white rounded-3xl border-2 p-8 transition-all duration-300 ${
                plan.primary
                  ? 'border-[#C8A96A] shadow-saffron md:scale-105 md:-my-4'
                  : 'border-gray-100 shadow-premium hover:shadow-premium-hover'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-[#C8A96A] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-saffron whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse-soft" />
                    {plan.badge}
                  </span>
                </div>
              )}
              {plan.highlight && (
                <div className="mb-5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-2xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {plan.highlight}
                </div>
              )}
              <p className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">{plan.name}</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className={`font-bold leading-none ${plan.primary ? 'text-5xl text-[#C8A96A]' : 'text-4xl text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.primary ? 'bg-[#C8A96A]/10' : 'bg-gray-100'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${plan.primary ? 'text-[#C8A96A]' : 'text-gray-500'}`} />
                    </div>
                    <span className="text-gray-600 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`btn-primary flex items-center justify-center gap-2 w-full font-bold py-3.5 rounded-2xl text-sm transition-colors ${
                  plan.primary ? 'bg-[#C8A96A] text-white shadow-saffron' : 'border border-gray-200 text-gray-700 hover:border-[#C8A96A] hover:text-[#C8A96A]'
                }`}>
                {plan.cta}
                {plan.primary && <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-gray-500">
          {[
            { icon: CheckCircle2, text: 'No credit card required' },
            { icon: Shield, text: 'Cancel anytime' },
            { icon: Zap, text: 'Profile live same day' },
            { icon: Users, text: '2,700+ vendors listed' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-emerald-500" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Guarantee ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="bg-[#C8A96A] p-8 flex items-center justify-center sm:w-36 shrink-0">
              <span className="text-5xl">🛡️</span>
            </div>
            <div className="p-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">Our Lead Guarantee</h2>
              <p className="text-gray-600 leading-relaxed">
                If you don&apos;t receive at least one genuine couple inquiry in your first 90 days, we&apos;ll personally
                work with your profile until you do, or you owe us absolutely nothing. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-center mb-10">Common Questions</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-premium p-6 hover:shadow-premium-hover hover:border-gray-200 transition-all duration-200">
              <p className="font-semibold text-gray-900 mb-2">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-premium">
          <p className="text-gray-500 text-sm mb-1">Still have questions?</p>
          <a href="mailto:hello@melaa.ca" className="text-[#C8A96A] font-semibold hover:underline">hello@melaa.ca</a>
          <p className="text-gray-400 text-xs mt-1">We reply within 2 hours</p>
        </div>
      </section>
    </div>
  )
}
