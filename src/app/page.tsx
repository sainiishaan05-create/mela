import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vendor } from '@/types'
import SearchBar from '@/components/ui/SearchBar'
import VendorCard from '@/components/vendors/VendorCard'
import {
  MapPin, ArrowRight, CheckCircle2, Star,
  Sparkles, Heart, Zap, Shield,
} from 'lucide-react'

export const revalidate = 300

// ─── Static data ────────────────────────────────────────────────────────────

const FEATURED_CATEGORIES = [
  { label: 'Photographers',     href: '/category/photographers',    icon: '📸', desc: 'Capture every moment' },
  { label: 'Makeup Artists',    href: '/category/makeup-artists',   icon: '💄', desc: 'Look your radiant best' },
  { label: 'Caterers',          href: '/category/catering',         icon: '🍽️', desc: 'Authentic South Asian cuisine' },
  { label: 'Decorators',        href: '/category/decorators',       icon: '💐', desc: 'Transform your venue' },
  { label: 'DJs & Entertainment',href: '/category/djs-entertainment',icon: '🎵', desc: 'Set the perfect mood' },
  { label: 'Wedding Venues',    href: '/category/wedding-venues',   icon: '🏛️', desc: 'Your perfect setting' },
  { label: 'Mehndi Artists',    href: '/category/mehndi-artists',   icon: '🌿', desc: 'Intricate bridal art' },
  { label: 'Videographers',     href: '/category/videographers',    icon: '🎬', desc: 'Cinematic memories' },
]

const MARQUEE_ITEMS = [
  'Photographers', 'Brampton', 'Makeup Artists', 'Toronto', 'Caterers',
  'Mississauga', 'Mehndi Artists', 'Vaughan', 'DJs', 'Markham',
  'Decorators', 'Scarborough', 'Venues', 'Richmond Hill', 'Videographers', 'Oakville',
]

const HOW_IT_WORKS = [
  {
    step: '01', icon: '🔍',
    title: 'Search your category',
    desc: 'Browse 33+ vendor categories across 55+ Ontario cities — all built for South Asian weddings.',
  },
  {
    step: '02', icon: '📋',
    title: 'Explore real profiles',
    desc: 'View portfolios, descriptions, and direct contact info for every vendor in the GTA.',
  },
  {
    step: '03', icon: '💬',
    title: 'Connect directly',
    desc: 'Reach vendors with zero middlemen, no booking fees, no hidden commissions. Ever.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya & Karan S.', city: 'Brampton', initials: 'PK', stars: 5,
    text: 'Found our photographer AND decorator through Mela. Saved us weeks of searching through random Google results that had nothing to do with our culture.',
  },
  {
    name: 'Aisha M.', city: 'Mississauga', initials: 'AM', stars: 5,
    text: 'Every vendor on here actually understands Pakistani weddings. That alone made it worth it. Our caterer was exactly what we needed.',
  },
  {
    name: 'Simran K.', city: 'Toronto', initials: 'SK', stars: 5,
    text: 'The mehndi artist we found through Mela was incredible. Never would have found her otherwise. This is a game changer for South Asian couples.',
  },
]

const WHY_MELA = [
  {
    Icon: Heart,
    title: 'South Asian First',
    desc: 'Every vendor understands your culture, traditions, and ceremonies. No compromises, no explanations needed.',
  },
  {
    Icon: Shield,
    title: 'Verified & Local',
    desc: 'We review every vendor in the GTA. Only real, active professionals who know what South Asian celebrations deserve.',
  },
  {
    Icon: Zap,
    title: 'Zero Fees. Ever.',
    desc: 'Contact vendors directly with no booking fees, no commissions, no hidden costs. The way it should be.',
  },
]

const TOP_CITIES = [
  { name: 'Toronto',       slug: 'toronto' },
  { name: 'Brampton',      slug: 'brampton' },
  { name: 'Mississauga',   slug: 'mississauga' },
  { name: 'Markham',       slug: 'markham' },
  { name: 'Vaughan',       slug: 'vaughan' },
  { name: 'Scarborough',   slug: 'scarborough' },
  { name: 'Richmond Hill', slug: 'richmond-hill' },
  { name: 'Oakville',      slug: 'oakville' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()

  const [{ count: vendorCount }, { data: featuredVendors }] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const featured = (featuredVendors as Vendor[]) ?? []
  const count = vendorCount?.toLocaleString() ?? '1,200'

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO — dark cinematic with animated orbs
      ═══════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col"
        style={{ background: '#0E0B08', minHeight: '100svh' }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-orb-3" />
          <div className="hero-grid" />
          {/* Radial vignette to keep edges dark */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, #0E0B08 85%)' }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">

          {/* Eyebrow */}
          <div className="animate-fade-up mb-8">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border"
              style={{ color: '#C8A96A', borderColor: 'rgba(200,169,106,0.3)', background: 'rgba(200,169,106,0.06)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] animate-pulse-soft" />
              GTA&apos;s #1 South Asian Wedding Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 font-[family-name:var(--font-playfair)] font-bold leading-[1.0] tracking-tight text-center text-white mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', textShadow: '0 0 80px rgba(200,169,106,0.12)' }}
          >
            Find Your Perfect
            <br />
            <span className="gradient-text">South Asian</span>
            <br />
            Wedding Team
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-up delay-200 text-base sm:text-lg max-w-lg text-center leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {count}+ vendors across every category —
            built exclusively for South Asian couples across the GTA.
          </p>

          {/* Search bar */}
          <div className="animate-fade-up delay-300 w-full max-w-2xl mb-8">
            <SearchBar />
          </div>

          {/* CTAs */}
          <div className="animate-fade-up delay-500 flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              style={{
                background: '#C8A96A',
                color: '#0E0B08',
                boxShadow: '0 0 32px rgba(200,169,106,0.3), 0 4px 16px rgba(200,169,106,0.15)',
              }}
            >
              Browse {count}+ Vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/list-your-business"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border transition-all duration-200 hover:bg-white/[0.04]"
              style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.12)' }}
            >
              List Your Business Free
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="relative z-10 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="max-w-5xl mx-auto px-4 py-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { v: `${count}+`, l: 'Verified Vendors' },
              { v: '500+',       l: 'Couples Matched' },
              { v: '33+',        l: 'Categories' },
              { v: '55+',        l: 'Ontario Cities' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white mb-1">
                  {s.v}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MARQUEE TICKER
      ═══════════════════════════════════════════════ */}
      <div className="border-y overflow-hidden" style={{ background: '#C8A96A', borderColor: '#B8945A', padding: '14px 0' }}>
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-sm font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color: '#2B2623' }}
            >
              {item}
              <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(43,38,35,0.3)' }} />
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
                Browse
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: '#2B2623' }}>
                Every category,
                <br />one platform.
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 group hover:gap-3"
              style={{ color: '#C8A96A' }}
            >
              All 33 categories
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{ borderColor: '#E8E2DC', background: '#FAFAF7' }}
              >
                {/* Slide-up dark fill on hover */}
                <div className="cat-card-fill" />

                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    {cat.icon}
                  </div>
                  <p
                    className="font-bold text-sm mb-1 transition-colors duration-300 group-hover:text-white"
                    style={{ color: '#2B2623' }}
                  >
                    {cat.label}
                  </p>
                  <p
                    className="text-xs transition-colors duration-300 group-hover:text-white/50"
                    style={{ color: '#8A7B74' }}
                  >
                    {cat.desc}
                  </p>
                </div>

                <ArrowRight
                  className="absolute bottom-5 right-5 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ color: '#C8A96A' }}
                />
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#C8A96A' }}>
              View all 33 categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6" style={{ background: '#F7F5F2' }}>
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
              Simple Process
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] font-bold"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: '#2B2623' }}
            >
              Your wedding, simplified.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector lines */}
            <div
              className="hidden md:block absolute top-10 h-px"
              style={{
                left: 'calc(33.3% + 20px)',
                right: 'calc(33.3% + 20px)',
                background: 'linear-gradient(90deg, rgba(200,169,106,0.5), rgba(200,169,106,0.5))',
              }}
            />

            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center group">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 group-hover:border-[#C8A96A] group-hover:bg-[#C8A96A]/5"
                  style={{ borderColor: '#CBBFB3' }}
                >
                  <span className="text-2xl leading-none">{step.icon}</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: '#C8A96A' }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3
                  className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3"
                  style={{ color: '#2B2623' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A7B74' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA below steps */}
          <div className="text-center mt-14">
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: '#2B2623',
                color: '#F7F5F2',
                boxShadow: '0 4px 20px rgba(43,38,35,0.2)',
              }}
            >
              Start exploring vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED VENDORS
      ═══════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">

            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
                  Top Picks
                </p>
                <h2
                  className="font-[family-name:var(--font-playfair)] font-bold"
                  style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: '#2B2623' }}
                >
                  Featured vendors.
                </h2>
              </div>
              <Link
                href="/vendors"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold group transition-all"
                style={{ color: '#C8A96A' }}
              >
                See all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v, i) => (
                <div key={v.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: '#2B2623',
                  color: '#F7F5F2',
                  boxShadow: '0 4px 20px rgba(43,38,35,0.2)',
                }}
              >
                View all {count}+ vendors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — dark
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6" style={{ background: '#0E0B08' }}>
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
              Real Stories
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] font-bold text-white"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}
            >
              Couples love Mela.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="rounded-2xl p-8 border transition-all duration-300 hover:border-[#C8A96A]/30 hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="font-serif text-6xl leading-none mb-4"
                  style={{ color: 'rgba(200,169,106,0.35)' }}
                >
                  &ldquo;
                </div>
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#C8A96A' }} />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {t.text}
                </p>
                <div
                  className="flex items-center gap-3 pt-4 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: '#C8A96A', color: '#0E0B08' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <MapPin className="w-3 h-3" />{t.city}, ON
                    </p>
                  </div>
                  <CheckCircle2
                    className="w-4 h-4 ml-auto"
                    style={{ color: '#C8A96A', opacity: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY MELA
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
              Our Difference
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] font-bold"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: '#2B2623' }}
            >
              Built different.
              <br />For you.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_MELA.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl p-8 border transition-all duration-300 hover:border-[#C8A96A]/40 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: '#E8E2DC', background: '#FAFAF7' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(200,169,106,0.1)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#C8A96A' }} />
                </div>
                <h3
                  className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3"
                  style={{ color: '#2B2623' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A7B74' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CITIES
      ═══════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: '#F7F5F2' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#C8A96A' }}>
            Coverage
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] font-bold mb-3"
            style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', color: '#2B2623' }}
          >
            Across the GTA &amp; beyond.
          </h2>
          <p className="text-sm mb-10" style={{ color: '#8A7B74' }}>
            55+ cities across Ontario
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {TOP_CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all duration-200 hover:border-[#C8A96A] hover:text-[#C8A96A] hover:-translate-y-0.5 bg-white"
                style={{ color: '#2B2623', borderColor: '#CBBFB3' }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#C8A96A' }} />
                {city.name}
              </Link>
            ))}
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: '#C8A96A' }}
          >
            Browse all Ontario cities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          VENDOR CTA — dark
      ═══════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 overflow-hidden" style={{ background: '#0E0B08' }}>
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,169,106,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(160,70,40,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#C8A96A' }}>
            For Vendors
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] font-bold text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Your next clients are
            <br />searching right now.
          </h2>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            South Asian weddings are a{' '}
            <span className="text-white font-semibold">$2B+ market</span> in Canada.
            Get listed free and lock in the Founding Vendor rate of{' '}
            <span style={{ color: '#C8A96A' }} className="font-semibold">$49/mo</span> forever.
          </p>

          <Link
            href="/list-your-business"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm mb-8 transition-all duration-200 hover:-translate-y-1 active:scale-95"
            style={{
              background: '#C8A96A',
              color: '#0E0B08',
              boxShadow: '0 0 40px rgba(200,169,106,0.3), 0 4px 16px rgba(200,169,106,0.2)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Claim My Founding Spot
          </Link>

          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {['No credit card required', 'Profile live same day', 'Cancel anytime'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#C8A96A' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
