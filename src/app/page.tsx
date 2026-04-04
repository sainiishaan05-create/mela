import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vendor } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import HeroCanvas3D from '@/components/landing/HeroCanvas3D'
import BrowseExplorer from '@/components/landing/BrowseExplorer'
import Reveal from '@/components/ui/Reveal'
import SearchBar from '@/components/ui/SearchBar'
import {
  ArrowRight, Sparkles, CheckCircle2,
  Zap, Shield, Heart, TrendingUp,
} from 'lucide-react'

export const revalidate = 300

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────────────────────── */

const MARQUEE = [
  '📸 Photographers', '🌆 Brampton', '💄 Makeup Artists', '🏙️ Toronto', '🍛 Caterers',
  '🌃 Mississauga', '🌿 Mehndi Artists', '🌇 Vaughan', '🎶 DJs', '🏘️ Markham',
  '💐 Decorators', '🏙️ Scarborough', '🏛️ Venues', '🌆 Richmond Hill', '🎬 Videographers',
  '💍 Jewellery', '👗 Bridal Wear', '🍮 Mithai', '🕉️ Priests', '🐎 Baraat',
]

const WHY_MELAA = [
  {
    Icon: Heart,
    title: 'South Asian First',
    desc: 'Every vendor understands your culture, traditions, and ceremonies. No compromises, no explaining required.',
  },
  {
    Icon: Shield,
    title: 'Verified & Local',
    desc: 'Only real, active GTA professionals who know what South Asian celebrations deserve, reviewed by our team.',
  },
  {
    Icon: Zap,
    title: 'Zero Fees. Ever.',
    desc: 'Contact vendors directly with no booking fees, no commissions, no hidden costs. The way it should always be.',
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  const supabase = await createClient()
  const [{ count: vendorCount }, { data: featuredVendors }] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true).eq('is_featured', true)
      .order('created_at', { ascending: false }).limit(3),
  ])
  const featured = (featuredVendors as Vendor[]) ?? []
  const count = (vendorCount != null && vendorCount > 100)
    ? vendorCount.toLocaleString()
    : '1,200'

  return (
    <div className="bg-dark-1">

      {/* ══════════════════════════════════════════════════════════════════════
          § 1  HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-1">

        <div className="absolute inset-0 z-0">
          <HeroCanvas3D />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-orb-3" />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.055) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        <div className="absolute bottom-0 inset-x-0 h-56 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #07050a 0%, transparent 100%)' }} />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 min-h-screen flex items-center">
          <div className="w-full py-32 lg:py-0 flex items-center justify-center lg:justify-start">

            {/* LEFT: Text */}
            <div className="max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full"
                style={{
                  background: 'rgba(200,169,106,0.08)',
                  border: '1px solid rgba(200,169,106,0.24)',
                  backdropFilter: 'blur(16px)',
                  animation: 'revealUp 0.6s 0.05s var(--ease-expo) both',
                }}>
                <span className="live-dot" />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C8A96A' }}>
                  GTA&apos;s #1 South Asian Wedding Platform
                </span>
              </div>

              <h1
                className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-[5rem] font-bold leading-[1.04] tracking-tight mb-6 text-white"
                style={{ animation: 'revealUp 0.75s 0.12s var(--ease-expo) both' }}
              >
                Your perfect<br />
                <span className="gradient-shimmer">South Asian</span><br />
                wedding awaits.
              </h1>

              <p
                className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
                style={{
                  color: 'rgba(255,255,255,0.50)',
                  animation: 'revealUp 0.75s 0.22s var(--ease-expo) both',
                }}
              >
                Discover{' '}
                <strong style={{ color: 'rgba(200,169,106,0.9)', fontWeight: 600 }}>
                  {count}+ verified vendors
                </strong>{' '}
                across the GTA: photographers, caterers, DJs, mehndi artists, venues and more.
                Built exclusively for South Asian celebrations.
              </p>

              <div style={{ animation: 'revealUp 0.75s 0.30s var(--ease-expo) both' }} className="mb-10">
                <SearchBar dark />
              </div>

              <div
                className="flex flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
                style={{ animation: 'revealUp 0.75s 0.38s var(--ease-expo) both' }}
              >
                <Link href="/vendors" className="btn-gold-glow">
                  <Sparkles className="w-4 h-4" />
                  Browse Vendors
                </Link>
                <Link href="/list-your-business" className="btn-ghost-gold">
                  List Your Business Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div
                className="flex flex-wrap gap-x-10 gap-y-5"
                style={{ animation: 'revealUp 0.75s 0.46s var(--ease-expo) both' }}
              >
                {[
                  { val: count + '+', label: 'Verified Vendors' },
                  { val: '14',        label: 'Categories' },
                  { val: '8+',        label: 'GTA Cities' },
                  { val: '$0',        label: 'Booking Fees' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold font-[family-name:var(--font-playfair)]"
                      style={{ color: '#C8A96A' }}>{val}</p>
                    <p className="text-xs tracking-wide mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.32)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>

        <div className="scroll-indicator flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity">
          <span className="text-[10px] tracking-[0.22em] uppercase font-medium"
            style={{ color: 'rgba(200,169,106,0.7)' }}>Scroll</span>
          <div className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(200,169,106,0.6), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          § 2  MARQUEE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-4 border-y"
        style={{ background: '#0b0910', borderColor: 'rgba(200,169,106,0.08)' }}>
        <div className="marquee-inner">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 px-6 text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap"
              style={{ color: 'rgba(200,169,106,0.40)' }}
            >
              <span className="w-1 h-1 rounded-full shrink-0"
                style={{ background: 'rgba(200,169,106,0.35)' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="divider-cinematic" />

      {/* ══════════════════════════════════════════════════════════════════════
          § 3  WHY MELAA — Bento grid
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-dark-1 section-immersive section-scanline" style={{'--scan-delay': '4s'} as React.CSSProperties}>
        <div className="section-beam-top" />
        <div className="section-glow-gold" />

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-14">
            <div className="divider-gold mx-auto mb-5" />
            <p className="tech-label justify-center mb-3">PLATFORM · SOUTH ASIAN FIRST</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-4 title-glow">
              Built for your culture.<br />
              <span className="gradient-shimmer">Not adapted for it.</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Built from day one for South Asian celebrations, where every vendor knows every ritual.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Wide hero card */}
            <Reveal className="md:col-span-2">
              <div className="relative rounded-3xl overflow-hidden p-10 h-full"
                style={{
                  background: 'rgba(200,169,106,0.055)',
                  border: '1px solid rgba(200,169,106,0.18)',
                  minHeight: 280,
                }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(200,169,106,0.055) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }} />
                <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(200,169,106,0.12) 0%, transparent 70%)',
                    transform: 'translate(30%,-30%)',
                  }} />
                <div className="relative z-10">
                  <div className="text-4xl mb-5">🕉️</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white mb-3">
                    Every ceremony. Every tradition.
                  </h3>
                  <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.48)' }}>
                    From Mehndi nights to Baraat processions, Sangeet to Nikah, our vendors know
                    every ritual, every detail, every expectation. No explaining required.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Mehndi', 'Baraat', 'Sangeet', 'Nikah', 'Anand Karaj', 'Vidai', 'Haldi', 'Walima'].map(c => (
                      <span key={c} className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{
                          border: '1px solid rgba(200,169,106,0.25)',
                          color: '#C8A96A',
                          background: 'rgba(200,169,106,0.07)',
                        }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Gold stat card */}
            <Reveal delay={80}>
              <div className="rounded-3xl p-8 flex flex-col justify-between h-full"
                style={{
                  background: 'linear-gradient(135deg, #C8A96A 0%, #d4a843 60%, #b8900a 100%)',
                  minHeight: 240,
                }}>
                <TrendingUp className="w-8 h-8" style={{ color: 'rgba(7,5,10,0.45)' }} />
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-6xl font-black mb-1"
                    style={{ color: '#07050a' }}>
                    {count}+
                  </p>
                  <p className="font-semibold text-sm" style={{ color: 'rgba(7,5,10,0.7)' }}>
                    Verified Vendors
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(7,5,10,0.5)' }}>
                    Across 8+ GTA cities and growing
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Three feature cards */}
            {WHY_MELAA.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 70}>
                <div className="rounded-3xl p-7 h-full glass-card-dark">
                  <div className="icon-box-gold mb-5">
                    <Icon className="w-5 h-5" style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="font-semibold text-base text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.43)' }}>
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-cinematic" />

      {/* ══════════════════════════════════════════════════════════════════════
          § 4  BROWSE EXPLORER — Category + City selector
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-dark-2 section-immersive section-scanline" style={{'--scan-delay': '0.5s'} as React.CSSProperties}>
        <div className="section-beam-top" />
        <div className="section-glow-top" />
        <div className="max-w-3xl mx-auto relative z-10">
          <Reveal>
            <BrowseExplorer />
          </Reveal>
        </div>
      </section>

      {/* Featured vendors — only when present */}
      {featured.length > 0 && (
        <>
          <div className="divider-cinematic" />
          <section className="py-20 px-4 sm:px-6 bg-dark-2">
            <div className="max-w-7xl mx-auto">
              <Reveal className="flex items-end justify-between mb-12">
                <div>
                  <div className="divider-gold mb-4" />
                  <p className="tech-label mb-2">FEATURED · THIS WEEK</p>
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-white title-glow">
                    Top vendors
                  </h2>
                </div>
                <Link href="/vendors"
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold shrink-0 transition-all duration-200 hover:gap-3"
                  style={{ color: 'rgba(200,169,106,0.75)' }}>
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((v, i) => (
                  <Reveal key={v.id} delay={i * 100}>
                    <VendorCard vendor={v} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <div className="divider-cinematic" />

      {/* ══════════════════════════════════════════════════════════════════════
          § 5  FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-dark-2 section-immersive section-scanline" style={{'--scan-delay': '6s'} as React.CSSProperties}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(200,169,106,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,106,0.25), transparent)' }} />
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,106,0.15), transparent)' }} />
        <div className="section-glow-gold" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
              style={{
                background: 'rgba(200,169,106,0.08)',
                border: '1px solid rgba(200,169,106,0.22)',
              }}>
              <span className="live-dot" />
              <span className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{ color: 'rgba(200,169,106,0.9)' }}>
                {count}+ vendors live right now
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.06] title-glow">
              Your celebration<br />
              <span className="gradient-shimmer">deserves the best.</span>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg sm:text-xl mb-12 max-w-xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Browse {count}+ South Asian wedding vendors across the GTA, completely free with no account needed.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/vendors" className="btn-gold-glow w-full sm:w-auto justify-center">
                <Sparkles className="w-4 h-4" />
                Browse All Vendors
              </Link>
              <Link href="/list-your-business" className="btn-ghost-gold w-full sm:w-auto justify-center">
                List Your Business Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-10 text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Free to browse · No account required · Zero booking fees
            </p>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
