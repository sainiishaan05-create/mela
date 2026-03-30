import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category, City, Vendor } from '@/types'
import SearchBar from '@/components/ui/SearchBar'
import VendorCard from '@/components/vendors/VendorCard'
import { MapPin, ChevronRight, Star, Shield, Zap, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'

export const revalidate = 300

const FEATURED_CATEGORIES = [
  { label: 'Photographers', href: '/category/photographers', icon: '📸' },
  { label: 'Makeup Artists', href: '/category/makeup-artists', icon: '💄' },
  { label: 'Caterers', href: '/category/catering', icon: '🍽️' },
  { label: 'Decorators', href: '/category/decorators', icon: '💐' },
  { label: 'DJs', href: '/category/djs-entertainment', icon: '🎵' },
  { label: 'Venues', href: '/category/wedding-venues', icon: '🏛️' },
  { label: 'Mehndi Artists', href: '/category/mehndi-artists', icon: '🌿' },
  { label: 'Videographers', href: '/category/videographers', icon: '🎬' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search your category',
    desc: 'Browse 33 vendor categories across 55+ Ontario cities — all built for South Asian weddings.',
  },
  {
    step: '02',
    title: 'Read real profiles',
    desc: 'See portfolios, descriptions, and direct contact info for every vendor.',
  },
  {
    step: '03',
    title: 'Contact directly',
    desc: 'Reach vendors with no middlemen, no booking fees, no hidden commissions. Ever.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya & Karan S.',
    city: 'Brampton',
    initials: 'PK',
    text: 'Found our photographer AND decorator through Melaa. Saved us weeks of searching through random Google results that had nothing to do with our culture.',
    stars: 5,
  },
  {
    name: 'Aisha M.',
    city: 'Mississauga',
    initials: 'AM',
    text: 'Every vendor on here actually understands Pakistani weddings. That alone made it worth it. Our caterer was exactly what we needed.',
    stars: 5,
  },
  {
    name: 'Simran K.',
    city: 'Toronto',
    initials: 'SK',
    text: 'The mehndi artist we found through Melaa was incredible. Never would have found her otherwise. This site is a game changer for South Asian couples.',
    stars: 5,
  },
]

const WHY_MELAA = [
  {
    icon: Heart,
    title: 'Built for South Asian Weddings',
    desc: 'Every vendor understands your culture, traditions, and what makes your celebration unique.',
  },
  {
    icon: Shield,
    title: 'Verified Local Vendors',
    desc: 'We review every vendor in the GTA. No generic directories — only real, active professionals.',
  },
  {
    icon: Zap,
    title: 'Direct Contact, No Fees',
    desc: 'Message vendors directly — no booking fees, no commissions, no hidden costs. Ever.',
  },
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

  const [
    { count: vendorCount },
    { data: featuredVendors },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const featured = (featuredVendors as Vendor[] ?? [])

  return (
    <>
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section
        className="relative"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
            style={{ background: 'radial-gradient(ellipse at 80% 10%, var(--color-gold-light) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-20"
            style={{ background: 'radial-gradient(ellipse at 10% 90%, var(--color-section) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-28 text-center">
          {/* Eyebrow label */}
          <div className="flex justify-center mb-7 animate-fade-up">
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full border"
              style={{
                color: 'var(--color-gold-dark)',
                borderColor: 'var(--color-gold)',
                background: 'var(--color-gold-light)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-gold)' }} />
              The GTA&apos;s South Asian Wedding Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Find Your Perfect
            <br />
            <span style={{ color: 'var(--color-gold)' }}>South Asian</span>
            <br />
            Wedding Vendors
          </h1>

          <p
            className="animate-fade-up delay-200 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: '#6B5E58' }}
          >
            {vendorCount?.toLocaleString() ?? '1,268'}+ vendors across every category —
            built exclusively for South Asian couples in the GTA.
          </p>

          {/* Search */}
          <div className="animate-fade-up delay-300 w-full max-w-2xl mx-auto mb-8">
            <SearchBar />
          </div>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-500 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/vendors"
              className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base min-h-[48px]"
            >
              Browse {vendorCount?.toLocaleString() ?? '1,268'}+ Vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/list-your-business"
              className="btn-outline-taupe inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base min-h-[48px]"
            >
              List Your Business Free
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--color-taupe)', background: 'var(--color-section)' }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: `${vendorCount?.toLocaleString() ?? '1,268'}+`, label: 'Verified Vendors' },
              { value: '500+', label: 'Inquiries Sent' },
              { value: '33+', label: 'Categories' },
              { value: '55+', label: 'Ontario Cities' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div
                  className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8A7B74' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-gold-dark)' }}
              >
                Explore
              </p>
              <h2
                className="font-[family-name:var(--font-playfair)] text-4xl font-bold"
                style={{ color: 'var(--color-text)' }}
              >
                Browse by Category
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-all duration-200 group"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              View All Categories
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((cat, i) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group card-luxury rounded-2xl p-6 text-center border"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-taupe)',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'white' }}
                >
                  {cat.icon}
                </div>
                <p
                  className="font-semibold text-sm leading-tight transition-colors duration-200"
                  style={{ color: 'var(--color-text)' }}
                >
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              View All Categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED VENDORS
      ═══════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--color-section)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-gold-dark)' }}
                >
                  Top Picks
                </p>
                <h2
                  className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  Featured Vendors
                </h2>
                <p style={{ color: '#8A7B74' }}>Handpicked vendors across the GTA</p>
              </div>
              <Link
                href="/vendors"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 group"
                style={{ color: 'var(--color-gold-dark)' }}
              >
                See all
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v, i) => (
                <div key={v.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/vendors"
                className="btn-dark inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm min-h-[48px]"
              >
                View All {vendorCount?.toLocaleString() ?? '1,268'}+ Vendors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CITIES
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              Coverage
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              Search by City
            </h2>
            <p style={{ color: '#8A7B74' }}>Top cities across the GTA &amp; surrounding Ontario</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {TOP_CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="group card-luxury inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm"
                style={{
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-taupe)',
                  background: 'var(--color-bg)',
                }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                {city.name}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              Browse all Ontario cities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--color-section)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              Simple Process
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              How Melaa Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="text-center">
                <div
                  className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-5 opacity-20"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {step.step}
                </div>
                <h3
                  className="font-[family-name:var(--font-playfair)] font-bold text-xl mb-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A7B74' }}>
                  {step.desc}
                </p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY MELAA
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              Our Difference
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              Why Melaa?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {WHY_MELAA.map(item => (
              <div key={item.title} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 border"
                  style={{
                    borderColor: 'var(--color-taupe)',
                    background: 'var(--color-bg)',
                  }}
                >
                  <item.icon className="w-5 h-5" style={{ color: 'var(--color-gold-dark)' }} />
                </div>
                <h3
                  className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A7B74' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--color-section)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              Real Stories
            </p>
            <h2
              className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              What Couples Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="rounded-2xl p-8 border"
                style={{
                  background: 'white',
                  borderColor: 'var(--color-taupe)',
                }}
              >
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-gold)' }} />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-7 italic"
                  style={{ color: '#6B5E58' }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'var(--color-text)' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {t.name}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ color: '#8A7B74' }}>
                      <MapPin className="w-3 h-3" /> {t.city}, ON
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 ml-auto opacity-50" style={{ color: 'var(--color-gold-dark)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VENDOR CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-text)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-gold)' }}
          >
            For Wedding Vendors
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-5 leading-tight"
            style={{ color: 'var(--color-bg)' }}
          >
            Your next clients are searching right now.
          </h2>
          <p
            className="text-base mb-10 max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--color-taupe)' }}
          >
            South Asian weddings are a <span style={{ color: 'var(--color-bg)' }}>$2B+ market</span> in Canada.
            Get listed free and lock in the Founding Vendor rate of{' '}
            <span style={{ color: 'var(--color-gold)' }}>$49/mo</span> forever.
          </p>

          <Link
            href="/list-your-business"
            className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base mb-8 min-h-[52px]"
          >
            Claim My Founding Spot
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--color-taupe)' }}>
            {['No credit card required', 'Profile live same day', 'Cancel anytime'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
