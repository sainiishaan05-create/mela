import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vendor } from '@/types'
import VendorCard from '@/components/vendors/VendorCard'
import HeroCanvas3D from '@/components/landing/HeroCanvas3D'
import Reveal from '@/components/ui/Reveal'
import SearchBar from '@/components/ui/SearchBar'
import {
  ArrowRight, Star, Sparkles, MapPin, CheckCircle2,
  Zap, Shield, Heart, TrendingUp, Users, Globe,
} from 'lucide-react'

export const revalidate = 300

// ── static data ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Photographers',       href: '/vendors?category=photographers',     icon: '📸', desc: 'Capture every moment' },
  { label: 'Videographers',       href: '/vendors?category=videographers',      icon: '🎬', desc: 'Cinematic memories' },
  { label: 'Makeup & Hair',       href: '/vendors?category=makeup-hair',        icon: '💄', desc: 'Look your radiant best' },
  { label: 'Mehndi Artists',      href: '/vendors?category=mehndi-artists',     icon: '🌿', desc: 'Intricate bridal art' },
  { label: 'Catering',            href: '/vendors?category=catering',           icon: '🍛', desc: 'Authentic South Asian cuisine' },
  { label: 'Decor & Florals',     href: '/vendors?category=decor-florals',      icon: '💐', desc: 'Transform your venue' },
  { label: 'DJ & Entertainment',  href: '/vendors?category=dj-entertainment',   icon: '🎶', desc: 'Set the perfect mood' },
  { label: 'Wedding Venues',      href: '/vendors?category=wedding-venues',     icon: '🏛️', desc: 'Your perfect setting' },
]

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Search your category', desc: 'Browse 14+ vendor categories across GTA cities — all built for South Asian weddings and events.' },
  { step: '02', icon: '📋', title: 'Explore real profiles', desc: 'View portfolios, descriptions, and direct contact info for every vendor. No gatekeeping.' },
  { step: '03', icon: '💬', title: 'Connect directly', desc: 'Reach vendors with zero middlemen, no booking fees, no hidden commissions. Ever.' },
]

const TESTIMONIALS = [
  { name: 'Priya & Karan S.', city: 'Brampton',    initials: 'PK', stars: 5, text: 'Found our photographer AND decorator through Melaa. Saved us weeks of searching through generic results that had nothing to do with our culture.' },
  { name: 'Aisha M.',          city: 'Mississauga', initials: 'AM', stars: 5, text: 'Every vendor on here actually understands Pakistani weddings. Our caterer was exactly what we needed — no explaining, no compromises.' },
  { name: 'Simran K.',         city: 'Toronto',     initials: 'SK', stars: 5, text: 'The mehndi artist we found through Melaa was incredible. Never would have discovered her otherwise. This is a game changer for South Asian couples.' },
]

const CITIES = [
  { name: 'Toronto',        slug: 'toronto' },
  { name: 'Brampton',       slug: 'brampton' },
  { name: 'Mississauga',    slug: 'mississauga' },
  { name: 'Markham',        slug: 'markham' },
  { name: 'Vaughan',        slug: 'vaughan' },
  { name: 'Scarborough',    slug: 'scarborough' },
  { name: 'Richmond Hill',  slug: 'richmond-hill' },
  { name: 'Kitchener',      slug: 'kitchener-waterloo' },
]

const MARQUEE = [
  'Photographers','Brampton','Makeup Artists','Toronto','Caterers',
  'Mississauga','Mehndi Artists','Vaughan','DJs','Markham',
  'Decorators','Scarborough','Venues','Richmond Hill','Videographers',
]

const VENDOR_FEATURES = [
  { Icon: TrendingUp, title: 'Get discovered instantly', desc: 'Your business listed in front of thousands of couples actively searching for South Asian vendors in the GTA.' },
  { Icon: Users,      title: 'Direct leads, no fees',   desc: 'Couples contact you directly. No platform cuts, no middlemen, no per-booking commissions. Ever.' },
  { Icon: Globe,      title: 'Build your presence',     desc: 'A dedicated profile page with your portfolio, contact info, and a link that\'s yours to share anywhere.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Get listed and found.',
    cta: 'List for free',
    href: '/list-your-business',
    highlight: false,
    perks: ['Listed in the directory', 'Basic profile page', 'Direct contact from couples', 'No time limit'],
  },
  {
    name: 'Basic',
    price: '$49',
    period: '/month',
    badge: 'Founding rate',
    desc: 'Stand out. Get more leads.',
    cta: 'Start free trial',
    href: '/list-your-business?plan=basic',
    highlight: true,
    perks: ['Everything in Free', 'Featured badge on profile', 'Priority placement in search', 'Direct inquiry leads', 'Analytics dashboard'],
  },
  {
    name: 'Premium',
    price: 'TBD',
    period: '',
    desc: 'Maximum visibility.',
    cta: 'Join waitlist',
    href: '/list-your-business?plan=premium',
    highlight: false,
    perks: ['Everything in Basic', 'Top of category placement', 'Verified vendor badge', 'Featured on homepage', 'Priority support'],
  },
]

// ── page ─────────────────────────────────────────────────────────────────

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
  const count = vendorCount?.toLocaleString() ?? '1,200'

  return (
    <div style={{ background: '#09070c' }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* 3-D canvas — full bleed behind everything */}
        <div className="absolute inset-0 z-0">
          <HeroCanvas3D />
        </div>

        {/* subtle dot-grid overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.07) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #09070c, transparent)' }} />

        {/* content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-32 w-full">
          <div className="max-w-2xl">

            {/* badge */}
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(200,169,106,0.10)', border: '1px solid rgba(200,169,106,0.28)', backdropFilter: 'blur(12px)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C8A96A' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C8A96A' }}>
                GTA&apos;s #1 South Asian Wedding &amp; Events Platform
              </span>
            </div>

            {/* headline */}
            <h1 className="animate-fade-up font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight mb-6 text-white">
              Every vendor.<br />
              <span style={{
                background: 'linear-gradient(120deg, #a8782a 0%, #e8bc60 40%, #f5d080 65%, #C8A96A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                One platform.
              </span>
            </h1>

            {/* sub */}
            <p className="animate-fade-up text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
              style={{ color: 'rgba(255,255,255,0.58)' }}>
              Discover <strong style={{ color: 'rgba(200,169,106,0.9)', fontWeight: 600 }}>{count}+ verified vendors</strong> across
              the GTA — photographers, caterers, DJs, mehndi artists, venues and more.
              Built exclusively for South Asian weddings &amp; events.
            </p>

            {/* search */}
            <div className="animate-fade-up mb-10">
              <SearchBar dark />
            </div>

            {/* CTAs */}
            <div className="animate-fade-up flex flex-wrap gap-4 mb-14">
              <Link href="/vendors"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(200,169,106,0.35)]"
                style={{ background: 'linear-gradient(135deg,#C8A96A,#d4a843)', color: '#09070c' }}>
                <Sparkles className="w-4 h-4" />
                Browse Vendors
              </Link>
              <Link href="/list-your-business"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm border transition-all duration-200 hover:bg-white/5"
                style={{ border: '1.5px solid rgba(200,169,106,0.35)', color: 'rgba(200,169,106,0.9)' }}>
                List Your Business Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* stats */}
            <div className="animate-fade-up flex flex-wrap gap-x-10 gap-y-5">
              {[
                { val: count + '+', label: 'Verified Vendors' },
                { val: '14',        label: 'Categories' },
                { val: '8+',        label: 'GTA Cities' },
                { val: '$0',        label: 'Booking Fees' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold font-[family-name:var(--font-playfair)]"
                    style={{ color: '#C8A96A' }}>{val}</p>
                  <p className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════════ */}
      <div className="overflow-hidden py-5 border-y" style={{ background: '#0e0a05', borderColor: 'rgba(200,169,106,0.10)' }}>
        <div className="marquee-inner">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-sm font-medium tracking-wide whitespace-nowrap"
              style={{ color: 'rgba(200,169,106,0.50)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(200,169,106,0.5)' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: '#0e0a05' }}>
        {/* corner glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(200,169,106,0.07) 0%, transparent 60%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8A96A' }}>How it works</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-4">
              Find your vendor in minutes
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              No account required. No fees. Browse, discover, and connect directly.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="relative p-8 rounded-3xl h-full"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,169,106,0.14)' }}>
                  {/* connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-6 z-10"
                      style={{ height: '1px', background: 'linear-gradient(90deg,rgba(200,169,106,0.4),transparent)' }} />
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-13 h-13 text-2xl flex items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(200,169,106,0.10)', border: '1px solid rgba(200,169,106,0.18)' }}>
                      {icon}
                    </div>
                    <span className="text-xs font-black tracking-[0.2em]"
                      style={{ color: 'rgba(200,169,106,0.35)' }}>{step}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-14">
            <Link href="/vendors"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#C8A96A,#d4a843)', color: '#09070c' }}>
              <Sparkles className="w-4 h-4" />
              Browse All Vendors
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6" style={{ background: '#09070c' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8A96A' }}>Categories</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white">
                Every vendor you need
              </h2>
            </div>
            <Link href="/vendors"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70 shrink-0"
              style={{ color: 'rgba(200,169,106,0.8)' }}>
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, href, icon, desc }, i) => (
              <Reveal key={href} delay={i * 45}>
                <Link href={href}
                  className="group relative rounded-2xl overflow-hidden p-6 flex flex-col gap-3 h-full transition-all duration-300 hover:shadow-[0_8px_32px_rgba(200,169,106,0.12)]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(200,169,106,0.12)',
                  }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-500 ease-out">{icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-0.5 text-white">{label}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 mt-auto opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                    style={{ color: '#C8A96A' }} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED VENDORS
      ══════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-28 px-4 sm:px-6" style={{ background: '#0e0a05' }}>
          <div className="max-w-7xl mx-auto">
            <Reveal className="flex items-end justify-between mb-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8A96A' }}>Featured</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white">
                  Top vendors this week
                </h2>
              </div>
              <Link href="/vendors"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity shrink-0"
                style={{ color: 'rgba(200,169,106,0.8)' }}>
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
      )}

      {/* ══════════════════════════════════════════
          WHY MELAA  — BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6" style={{ background: '#09070c' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8A96A' }}>Why Melaa</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-4">
              Built for your culture.<br />
              <span style={{
                background: 'linear-gradient(120deg,#C8A96A,#f0c97a)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Not adapted for it.</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Every other wedding platform was built for Western weddings and retrofitted.
              Melaa was built from day one for South Asian celebrations.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* large card */}
            <Reveal className="md:col-span-2">
              <div className="relative rounded-3xl overflow-hidden p-10 h-full"
                style={{ background: 'rgba(200,169,106,0.06)', border: '1px solid rgba(200,169,106,0.18)', minHeight: 280 }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(rgba(200,169,106,0.06) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }} />
                <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(200,169,106,0.12) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
                <div className="relative z-10">
                  <div className="text-3xl mb-6">🕉️</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white mb-3">
                    Every ceremony. Every tradition.
                  </h3>
                  <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    From Mehndi nights to Baraat processions, Sangeet to Nikah — our vendors know every ritual,
                    every detail, every expectation. No explaining required.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {['Mehndi', 'Baraat', 'Sangeet', 'Nikah', 'Anand Karaj', 'Vidai'].map(c => (
                      <span key={c} className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ border: '1px solid rgba(200,169,106,0.28)', color: '#C8A96A', background: 'rgba(200,169,106,0.08)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* stat card */}
            <Reveal delay={80}>
              <div className="rounded-3xl p-8 flex flex-col justify-between h-full"
                style={{ background: 'linear-gradient(135deg,#C8A96A,#d4a843)', minHeight: 200 }}>
                <TrendingUp className="w-8 h-8 text-black/50" />
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-5xl font-black text-[#09070c] mb-1">{count}+</p>
                  <p className="font-semibold text-sm text-[#09070c]/75">Verified Vendors</p>
                  <p className="text-xs text-[#09070c]/55 mt-1">Across 8+ GTA cities and growing</p>
                </div>
              </div>
            </Reveal>

            {[
              { Icon: Heart,   title: 'South Asian First',  desc: 'Every vendor understands your culture, traditions, and ceremonies. No compromises, no explanations needed.' },
              { Icon: Shield,  title: 'Verified & Local',   desc: 'We review every vendor in the GTA. Only real, active professionals who know what South Asian celebrations deserve.' },
              { Icon: Zap,     title: 'Zero Fees. Ever.',   desc: 'Contact vendors directly — no booking fees, no commissions, no hidden costs. The way it should always be.' },
            ].map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 70}>
                <div className="rounded-3xl p-7 h-full"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,169,106,0.12)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(200,169,106,0.12)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="font-semibold text-base text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6" style={{ background: '#0e0a05' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8A96A' }}>Reviews</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white">
              Couples who found their vendors
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, initials, stars, text }, i) => (
              <Reveal key={name} delay={i * 100}>
                <div className="rounded-3xl p-7 flex flex-col gap-5 h-full"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,106,0.12)' }}>
                  <div className="flex gap-0.5">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#C8A96A' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4"
                    style={{ borderTop: '1px solid rgba(200,169,106,0.12)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(200,169,106,0.15)', color: '#C8A96A' }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs" style={{ color: 'rgba(200,169,106,0.5)' }}>{city}, ON</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CITIES
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6" style={{ background: '#09070c' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8A96A' }}>Browse by City</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white">
              Vendors across the GTA
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITIES.map(({ name, slug }, i) => (
              <Reveal key={slug} delay={i * 35}>
                <Link href={`/vendors?city=${slug}`}
                  className="group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:border-[rgba(200,169,106,0.4)] hover:bg-[rgba(200,169,106,0.07)]"
                  style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(200,169,106,0.12)' }}
                >
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'rgba(200,169,106,0.5)' }} />
                  <span className="text-sm font-medium text-white">{name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
                    style={{ color: '#C8A96A' }} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOR VENDORS — PRICING
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: '#0e0a05' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(200,169,106,0.06) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8A96A' }}>For Vendors</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-4">
              Grow your business with Melaa
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Join thousands of South Asian wedding professionals already on the platform.
              Start free, upgrade when you&apos;re ready.
            </p>
          </Reveal>

          {/* vendor feature pills */}
          <Reveal className="flex flex-wrap justify-center gap-4 mb-20">
            {VENDOR_FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-2xl max-w-xs"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,169,106,0.12)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(200,169,106,0.12)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#C8A96A' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white mb-1">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </Reveal>

          {/* pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map(({ name, price, period, badge, desc, cta, href, highlight, perks }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className="rounded-3xl p-8 flex flex-col h-full relative overflow-hidden"
                  style={highlight ? {
                    background: 'linear-gradient(145deg, rgba(200,169,106,0.15), rgba(200,169,106,0.05))',
                    border: '1.5px solid rgba(200,169,106,0.45)',
                    boxShadow: '0 0 60px rgba(200,169,106,0.12)',
                  } : {
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(200,169,106,0.12)',
                  }}>

                  {badge && (
                    <div className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(200,169,106,0.18)', color: '#C8A96A' }}>
                      {badge}
                    </div>
                  )}

                  <p className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(200,169,106,0.7)' }}>{name}</p>
                  <div className="mb-1 flex items-end gap-1">
                    <span className="font-[family-name:var(--font-playfair)] text-4xl font-black text-white">{price}</span>
                    {period && <span className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{period}</span>}
                  </div>
                  <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {perks.map(perk => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#C8A96A' }} />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <Link href={href}
                    className="block text-center py-3 px-6 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.03]"
                    style={highlight ? {
                      background: 'linear-gradient(135deg,#C8A96A,#d4a843)',
                      color: '#09070c',
                    } : {
                      border: '1.5px solid rgba(200,169,106,0.35)',
                      color: 'rgba(200,169,106,0.85)',
                    }}>
                    {cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 relative overflow-hidden" style={{ background: '#09070c' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(200,169,106,0.10) 0%, transparent 65%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.055) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />

        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#C8A96A' }}>Ready?</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Your perfect celebration<br />
            <span style={{
              background: 'linear-gradient(120deg,#C8A96A,#f0c97a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>starts here.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Browse {count}+ South Asian wedding &amp; event vendors — all local, all verified, all free.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/vendors"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(200,169,106,0.30)]"
              style={{ background: 'linear-gradient(135deg,#C8A96A,#d4a843)', color: '#09070c' }}>
              <Sparkles className="w-4 h-4" />
              Find Your Vendors
            </Link>
            <Link href="/list-your-business"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm border transition-all duration-200 hover:bg-white/5"
              style={{ border: '1.5px solid rgba(200,169,106,0.35)', color: 'rgba(200,169,106,0.85)' }}>
              List Your Business Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t px-4 sm:px-6 py-14" style={{ background: '#09070c', borderColor: 'rgba(200,169,106,0.10)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(120deg,#C8A96A,#f0c97a)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                Melaa
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                The #1 South Asian wedding &amp; events platform in the GTA.
              </p>
            </div>
            {[
              { heading: 'For Couples',  links: [['Browse Vendors','/vendors'],['Search by City','/vendors'],['How It Works','/#how-it-works']] },
              { heading: 'For Vendors',  links: [['List Your Business','/list-your-business'],['Vendor Login','/login'],['Pricing','/#pricing']] },
              { heading: 'Company',      links: [['About','/about'],['Contact','/contact'],['Privacy','/privacy'],['Terms','/terms']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(200,169,106,0.6)' }}>{heading}</p>
                <ul className="space-y-2.5">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.40)' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(200,169,106,0.08)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} Melaa · South Asian Wedding &amp; Events · GTA
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>
              Made with ♥ for South Asian celebrations
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
