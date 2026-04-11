import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find Your Wedding Vendors | Melaa',
  description: 'Find trusted South Asian wedding vendors across the GTA. Photographers, caterers, DJs, decorators, mehndi artists, and more.',
}

/**
 * QR code landing page. This is where the printed QR cards point.
 * Clean, focused, no distractions. One job: get the visitor to /vendors.
 */
export default function QrLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#0A0808' }}>
      {/* Gold glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(200,169,106,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-sm">
        {/* Brand */}
        <h1
          className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-3"
          style={{ color: '#C8A96A' }}
        >
          Melaa
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
          South Asian Wedding Vendors
        </p>

        {/* Headline */}
        <h2
          className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold leading-tight mb-4"
          style={{ color: '#FFFFFF' }}
        >
          Planning a South Asian wedding in the GTA?
        </h2>
        <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Find photographers, caterers, DJs, decorators, mehndi artists, bridal wear, venues, and more. All in one place.
        </p>

        {/* Primary CTA */}
        <Link
          href="/vendors"
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl text-base font-bold transition-opacity hover:opacity-90"
          style={{ background: '#C8A96A', color: '#FFFFFF' }}
        >
          Browse vendors
        </Link>

        {/* Secondary CTA */}
        <Link
          href="/list-your-business"
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl text-sm font-semibold mt-3 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          I'm a vendor, list my business free
        </Link>

        {/* Bottom line */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="w-8 h-px" style={{ background: 'rgba(200,169,106,0.3)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>melaa.ca</p>
          <div className="w-8 h-px" style={{ background: 'rgba(200,169,106,0.3)' }} />
        </div>
      </div>
    </div>
  )
}
