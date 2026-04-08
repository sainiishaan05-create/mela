import type { Metadata } from 'next'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import { getSiteStats } from '@/lib/stats'

export const metadata: Metadata = {
  title: 'Subscribe | Melaa',
  description:
    'Join hundreds of South Asian clients and vendors. Get weekly vendor spotlights, planning guides, and exclusive deals from Melaa.',
  openGraph: {
    title: 'Subscribe | Melaa',
    description:
      'Join hundreds of South Asian clients and vendors. Get weekly vendor spotlights, planning guides, and exclusive deals from Melaa.',
    url: 'https://melaa.ca/subscribe',
    siteName: 'Melaa',
    locale: 'en_CA',
    type: 'website',
  },
}

const benefits = [
  {
    icon: '📸',
    title: 'Vendor Spotlights',
    description:
      'Every week we feature the best South Asian wedding photographers, decorators, caterers, and more across the GTA.',
  },
  {
    icon: '📋',
    title: 'Planning Guides',
    description:
      'Practical tips for weddings and events, from budgeting and timelines to negotiating with vendors.',
  },
  {
    icon: '🏷️',
    title: 'Exclusive Deals',
    description:
      'Subscriber-only promotions and early access from top-rated vendors on the Melaa platform.',
  },
  {
    icon: '🌺',
    title: 'Community Stories',
    description:
      'Real wedding recaps, client features, and behind-the-scenes looks at the most beautiful South Asian celebrations.',
  },
]

export default async function SubscribePage() {
  const stats = await getSiteStats()
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Hero */}
      <section className="relative bg-[#111111] overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #C8A96A 0%, transparent 70%)',
          }}
        />
        {/* Decorative dots */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <span className="text-base" role="img" aria-label="hibiscus">🌺</span>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#C8A96A' }}
            >
              Free Newsletter
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Stay Connected{' '}
            <span className="gradient-text">with Melaa</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto">
            The insider newsletter for South Asian wedding planning in Canada. Join {stats.vendorCountWithPlus} vendors
            and clients already connected through Melaa.
          </p>
        </div>
      </section>

      {/* Signup card */}
      <section id="signup-top" className="max-w-2xl mx-auto px-6 -mt-10 relative z-10">
        <NewsletterSignup variant="card" />
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            What you&apos;ll get
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Every issue is packed with value, curated specifically for South Asian weddings in the GTA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="card-interactive bg-white rounded-2xl border border-gray-100 shadow-premium p-6"
            >
              <span className="text-3xl mb-4 block" role="img" aria-label={benefit.title}>
                {benefit.icon}
              </span>
              <h3
                className="text-lg font-bold text-[#1A1A1A] mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="bg-[#111111] py-14">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p
            className="text-xl md:text-2xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Ready to join?
          </p>
          <p className="text-white/50 text-sm mb-8">
            No spam. No nonsense. Just the best of South Asian weddings in Canada.
          </p>
          {/* Inline mini form */}
          <MiniSubscribeForm />
        </div>
      </section>
    </div>
  )
}

function MiniSubscribeForm() {
  return (
    <div className="flex justify-center">
      <a
        href="#signup-top"
        className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-saffron"
        style={{ background: '#C8A96A' }}
      >
        Subscribe for free →
      </a>
    </div>
  )
}
