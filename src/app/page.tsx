import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vendor } from '@/types'
import SearchBar from '@/components/ui/SearchBar'
import VendorCard from '@/components/vendors/VendorCard'
import HeroSceneClient from '@/components/ui/HeroSceneClient'
import Reveal from '@/components/ui/Reveal'
import { MapPin, ArrowRight, CheckCircle2, Star, Sparkles, Heart, Zap, Shield, TrendingUp } from 'lucide-react'

export const revalidate = 300

const FEATURED_CATEGORIES = [
  { label: 'Photographers',       href: '/category/photographers',     icon: '📸', desc: 'Capture every moment' },
  { label: 'Makeup Artists',      href: '/category/makeup-artists',    icon: '💄', desc: 'Look your radiant best' },
  { label: 'Caterers',            href: '/category/catering',          icon: '🍽️', desc: 'Authentic South Asian cuisine' },
  { label: 'Decorators',          href: '/category/decorators',        icon: '💐', desc: 'Transform your venue' },
  { label: 'DJs & Entertainment', href: '/category/djs-entertainment', icon: '🎵', desc: 'Set the perfect mood' },
  { label: 'Wedding Venues',      href: '/category/wedding-venues',    icon: '🏛️', desc: 'Your perfect setting' },
  { label: 'Mehndi Artists',      href: '/category/mehndi-artists',    icon: '🌿', desc: 'Intricate bridal art' },
  { label: 'Videographers',       href: '/category/videographers',     icon: '🎬', desc: 'Cinematic memories' },
]

const MARQUEE_ITEMS = [
  'Photographers', 'Brampton', 'Makeup Artists', 'Toronto', 'Caterers',
  'Mississauga', 'Mehndi Artists', 'Vaughan', 'DJs', 'Markham',
  'Decorators', 'Scarborough', 'Venues', 'Richmond Hill', 'Videographers', 'Oakville',
]

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Search your category', desc: 'Browse 33+ vendor categories across 55+ Ontario cities — all built for South Asian weddings.' },
  { step: '02', icon: '📋', title: 'Explore real profiles', desc: 'View portfolios, descriptions, and direct contact info for every vendor in the GTA.' },
  { step: '03', icon: '💬', title: 'Connect directly', desc: 'Reach vendors with zero middlemen, no booking fees, no hidden commissions. Ever.' },
]

const TESTIMONIALS = [
  { name: 'Priya & Karan S.', city: 'Brampton', initials: 'PK', stars: 5, text: 'Found our photographer AND decorator through Mela. Saved us weeks of searching through random Google results that had nothing to do with our culture.' },
  { name: 'Aisha M.', city: 'Mississauga', initials: 'AM', stars: 5, text: 'Every vendor on here actually understands Pakistani weddings. That alone made it worth it. Our caterer was exactly what we needed.' },
  { name: 'Simran K.', city: 'Toronto', initials: 'SK', stars: 5, text: 'The mehndi artist we found through Mela was incredible. Never would have found her otherwise. This is a game changer for South Asian couples.' },
]

const WHY_MELA = [
  { Icon: Heart, title: 'South Asian First', desc: 'Every vendor understands your culture, traditions, and ceremonies. No compromises, no explanations needed.' },
  { Icon: Shield, title: 'Verified & Local', desc: 'We review every vendor in the GTA. Only real, active professionals who know what South Asian celebrations deserve.' },
  { Icon: Zap, title: 'Zero Fees. Ever.', desc: 'Contact vendors directly with no booking fees, no commissions, no hidden costs. The way it should be.' },
]

const TOP_CITIES = [
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Brampton', slug: 'brampton' },
  { name: 'Mississauga', slug: 'mississauga' },
  { name: 'Markham', slug: 'markham' },
  { name: 'Vaughan', slug: 'vaughan' },
  { name: 'Scarborough', slug: 'scarborough' },
  { name: 'Richmond Hill', slug: 'richmond-hill' },
  { name: 'Oakville', slug: 'oakville' },
]

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
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: 'var(--color-bg-dark)' }}>
        <HeroSceneClient />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0C0A08] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0A08]/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
          <div className="max-w-3xl">
            {/* Trust badge — visible immediately */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{ borderColor: 'rgba(200,169,106,0.3)', background: 'rgba(200,169,106,0.08)', backdropFilter: 'blur(12px)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--color-gold)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                The #1 South Asian Wedding Platform in GTA
              </span>
            </div>

            <h1 className="animate-fade-up delay-100 font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              <span className="text-white">Your dream</span>
              <br />
              <span className="gradient-text">South Asian</span>
              <br />
              <span className="text-white">wedding starts here</span>
            </h1>

            <p className="animate-fade-up delay-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Discover {count}+ verified vendors across the GTA — photographers, caterers, mehndi artists, DJs, and more. All South Asian. All local. Zero fees.
            </p>

            <div className="animate-fade-up delay-300 mb-10">
              <SearchBar dark />
            </div>

            {/* Stats — trust signals above the fold */}
            <div className="animate-fade-up delay-400 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { val: count + '+', label: 'Verified Vendors' },
                { val: '33+', label: 'Categories' },
                { val: '55+', label: 'Ontario Cities' },
                { val: '$0', label: 'Booking Fees' },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold)' }}>{val}</span>
                  <span className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smooth bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-5 border-y" style={{ background: 'var(--color-bg-dark)', borderColor: 'rgba(200,169,106,0.12)' }}>
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-sm font-medium tracking-wide whitespace-nowrap" style={{ color: 'rgba(200,169,106,0.55)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-gold)' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── WHY MELA — BENTO GRID ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="section-divider" />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>Why Mela</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Built for your culture.<br />
              <span className="gradient-text-warm">Not adapted for it.</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Every other wedding platform was built for Western weddings and retrofitted. Mela was built from day one for South Asian celebrations.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Large feature card */}
            <Reveal className="md:col-span-2" delay={0}>
              <div className="bento-card h-full p-8 relative overflow-hidden" style={{ background: 'var(--color-bg-dark)', minHeight: 280 }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(rgba(200,169,106,0.08) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{
                  background: 'radial-gradient(circle, rgba(200,169,106,0.15) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)',
                }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: 'rgba(200,169,106,0.15)' }}>
                    🕉️
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white mb-3">
                    Every ceremony. Every tradition.
                  </h3>
                  <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    From Mehndi nights to Baraat processions, Sangeet to Nikah — our vendors know every ritual, every detail, every expectation. No explaining required.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Mehndi', 'Baraat', 'Sangeet', 'Nikah', 'Anand Karaj', 'Vidai'].map(c => (
                      <span key={c} className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: 'rgba(200,169,106,0.3)', color: 'var(--color-gold)', background: 'rgba(200,169,106,0.08)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Stat card */}
            <Reveal delay={100}>
              <div className="bento-card h-full p-8 flex flex-col justify-between" style={{ background: 'var(--color-gold-light)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-gold)' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="stat-number text-5xl mb-2">{count}+</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Verified Vendors</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Across 55+ Ontario cities and growing every week</p>
                </div>
              </div>
            </Reveal>

            {WHY_MELA.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="bento-card h-full p-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: 'var(--color-gold-light)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-gold-dark)' }} />
                  </div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-section)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <div className="section-divider" style={{ margin: '0 0 12px 0' }} />
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-gold-dark)' }}>Browse by Category</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
                Every vendor you need
              </h2>
            </div>
            <Link href="/vendors" className="hidden sm:flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70 shrink-0" style={{ color: 'var(--color-gold-dark)' }}>
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map(({ label, href, icon, desc }, i) => (
              <Reveal key={href} delay={i * 50}>
                <Link href={href} className="group relative rounded-2xl overflow-hidden border p-6 flex flex-col gap-3 h-full transition-all duration-300 hover:border-[#C8A96A] hover:shadow-[0_8px_32px_rgba(200,169,106,0.15)]"
                  style={{ background: 'white', borderColor: 'var(--color-taupe)' }}>
                  <div className="cat-card-fill" />
                  <span className="relative z-10 text-3xl group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">{icon}</span>
                  <div className="relative z-10">
                    <p className="font-semibold text-sm mb-0.5 group-hover:text-white transition-colors duration-300" style={{ color: 'var(--color-text)' }}>{label}</p>
                    <p className="text-xs group-hover:text-white/70 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                  </div>
                  <ArrowRight className="relative z-10 w-4 h-4 mt-auto opacity-0 group-hover:opacity-100 group-hover:text-white transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENDORS ── */}
      {featured.length > 0 && (
        <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto">
            <Reveal className="flex items-end justify-between mb-12">
              <div>
                <div className="section-divider" style={{ margin: '0 0 12px 0' }} />
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-gold-dark)' }}>Featured</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Top vendors this week
                </h2>
              </div>
              <Link href="/vendors" className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity shrink-0" style={{ color: 'var(--color-gold-dark)' }}>
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

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold)' }}>How It Works</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-4">
              Find your vendor in minutes
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              No sign-up required. No fees. Just browse, discover, and connect.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="relative">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px -translate-x-1/2 z-0"
                      style={{ background: 'linear-gradient(90deg, rgba(200,169,106,0.4), transparent)' }} />
                  )}
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                        style={{ background: 'rgba(200,169,106,0.12)', border: '1px solid rgba(200,169,106,0.2)' }}>
                        {icon}
                      </div>
                      <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(200,169,106,0.4)' }}>{step}</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center">
            <Link href="/vendors" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold">
              <Sparkles className="w-4 h-4" />
              Browse All Vendors
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="section-divider" />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>Love Stories</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Couples who found their vendors
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, initials, stars, text }, i) => (
              <Reveal key={name} delay={i * 100}>
                <div className="card-gradient-border quote-mark h-full p-7 flex flex-col gap-4">
                  <div className="flex gap-0.5 relative z-10">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: 'var(--color-gold)' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 relative z-10" style={{ color: 'var(--color-text-muted)' }}>"{text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t relative z-10" style={{ borderColor: 'var(--color-section)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--color-gold-light)', color: 'var(--color-gold-dark)' }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-taupe)' }}>{city}, ON</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-section)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="section-divider" />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>Browse by City</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
              Vendors across the GTA
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOP_CITIES.map(({ name, slug }, i) => (
              <Reveal key={slug} delay={i * 40}>
                <Link href={`/city/${slug}`}
                  className="group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:border-[#C8A96A] hover:shadow-[0_4px_20px_rgba(200,169,106,0.12)]"
                  style={{ background: 'white', borderColor: 'var(--color-taupe)' }}>
                  <MapPin className="w-4 h-4 shrink-0 transition-colors duration-200 group-hover:text-[#C8A96A]" style={{ color: 'var(--color-taupe)' }} />
                  <span className="text-sm font-medium transition-colors duration-200 group-hover:text-[#B8945A]" style={{ color: 'var(--color-text)' }}>{name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" style={{ color: 'var(--color-gold-dark)' }} />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-8">
            <Link href="/browse" className="text-sm font-semibold link-underline" style={{ color: 'var(--color-gold-dark)' }}>
              Browse all Ontario cities →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── VENDOR CTA ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(200,169,106,0.12) 0%, transparent 70%)',
        }} />
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: 'rgba(200,169,106,0.3)', background: 'rgba(200,169,106,0.08)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>For Vendors</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-6">
            Reach thousands of couples<br />
            <span className="gradient-text">planning right now</span>
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            List your business for free. Get discovered by couples actively searching for South Asian wedding vendors in your city.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/list-your-business" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold">
              <Sparkles className="w-4 h-4" />
              Claim Your Free Spot
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium border transition-all hover:border-[#C8A96A] hover:text-[#C8A96A]"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              View Pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: CheckCircle2, text: 'Free forever listing' },
              { icon: CheckCircle2, text: 'No commission fees' },
              { icon: CheckCircle2, text: 'Direct couple inquiries' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  )
}
