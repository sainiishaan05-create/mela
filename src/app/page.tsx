import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category, City, Vendor } from '@/types'
import SearchBar from '@/components/ui/SearchBar'
import VendorCard from '@/components/vendors/VendorCard'
import { MapPin, ChevronRight, Star, Shield, Zap, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'

export const revalidate = 300

const TRENDING_SEARCHES = [
  { label: '📸 Photographers', href: '/category/photographers' },
  { label: '🍽️ Caterers', href: '/category/catering' },
  { label: '🌿 Mehndi Artists', href: '/category/mehndi-artists' },
  { label: '💄 Bridal Makeup', href: '/category/makeup-artists' },
  { label: '🎵 DJs', href: '/category/djs-entertainment' },
  { label: '💐 Decorators', href: '/category/decorators' },
  { label: '🏛️ Venues', href: '/category/wedding-venues' },
  { label: '🎬 Videographers', href: '/category/videographers' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🔍',
    title: 'Search your category',
    desc: 'Browse by vendor type and city — 14 categories across 8 GTA cities.',
    color: 'from-blue-50 to-indigo-50',
    accent: 'text-indigo-500',
  },
  {
    step: '02',
    icon: '📋',
    title: 'Read real profiles',
    desc: 'See descriptions, contact info, and websites for every vendor.',
    color: 'from-orange-50 to-amber-50',
    accent: 'text-[#E8760A]',
  },
  {
    step: '03',
    icon: '💬',
    title: 'Contact directly',
    desc: 'Message vendors with no middlemen, no booking fees, no commissions.',
    color: 'from-emerald-50 to-teal-50',
    accent: 'text-emerald-600',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya & Karan S.',
    city: 'Brampton',
    initials: 'PK',
    color: 'from-rose-400 to-pink-500',
    text: 'Found our photographer AND decorator through Melaa. Saved us weeks of searching through random Google results that had nothing to do with our culture.',
    stars: 5,
  },
  {
    name: 'Aisha M.',
    city: 'Mississauga',
    initials: 'AM',
    color: 'from-violet-400 to-purple-500',
    text: 'Every vendor on here actually understands Pakistani weddings. That alone made it worth it. Our caterer was exactly what we needed.',
    stars: 5,
  },
  {
    name: 'Simran K.',
    city: 'Toronto',
    initials: 'SK',
    color: 'from-amber-400 to-orange-500',
    text: 'The mehndi artist we found through Melaa was incredible. Never would have found her otherwise. This site is a game changer for South Asian couples.',
    stars: 5,
  },
]

const WHY_MELAA = [
  {
    icon: Heart,
    title: 'Built for South Asian Weddings',
    desc: 'Every vendor understands your culture, traditions, and what makes your celebration unique.',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    icon: Shield,
    title: 'Verified Local Vendors',
    desc: 'We review every vendor in the GTA. No generic directories — only real, active professionals.',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: Zap,
    title: 'Direct Contact, No Fees',
    desc: 'Message vendors directly — no booking fees, no commissions, no hidden costs. Ever.',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: cities },
    { count: vendorCount },
    { count: leadCount },
    { data: featuredVendors },
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase.from('cities').select('*').eq('is_active', true).order('name'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const spotsLeft = 23
  const featured = (featuredVendors as Vendor[] ?? [])

  return (
    <>
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative bg-[#111111] text-white overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[800px] h-[600px] opacity-20"
            style={{ background: 'radial-gradient(ellipse at 20% 30%, #E8760A 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-10"
            style={{ background: 'radial-gradient(ellipse at 80% 80%, #F5A623 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          {/* Announcement pill */}
          {spotsLeft > 0 && (
            <div className="flex justify-center mb-8 animate-fade-up">
              <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/12 text-sm px-5 py-2.5 rounded-full backdrop-blur-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#E8760A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8760A]"></span>
                </span>
                <span className="text-gray-300">
                  <span className="text-[#E8760A] font-bold">{spotsLeft} founding spots</span> left — free for 90 days
                </span>
              </div>
            </div>
          )}

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="animate-fade-up delay-100 font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Find Your Perfect{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">South Asian</span>{' '}
              <br className="hidden sm:block" />
              Wedding Vendors
            </h1>
            <p className="animate-fade-up delay-200 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              The GTA&apos;s only marketplace built exclusively for South Asian weddings.{' '}
              <span className="text-gray-300">{vendorCount?.toLocaleString() ?? '1,268'}+ vendors</span> across every category.
            </p>
          </div>

          {/* Search bar */}
          <div className="animate-fade-up delay-300 w-full max-w-2xl mx-auto mb-6">
            <SearchBar />
          </div>

          {/* Trending pills */}
          <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-2 mb-12">
            {TRENDING_SEARCHES.map(s => (
              <Link key={s.href} href={s.href}
                className="text-xs bg-white/6 hover:bg-[#E8760A]/20 border border-white/8 hover:border-[#E8760A]/40 text-gray-400 hover:text-white px-4 py-2 rounded-full transition-all duration-200">
                {s.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-500 flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/vendors"
              className="btn-primary inline-flex items-center justify-center gap-2 bg-[#E8760A] text-white font-bold px-8 py-4 rounded-2xl text-base shadow-saffron-lg">
              Browse {vendorCount?.toLocaleString() ?? '1,268'}+ Vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/list-your-business"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/6 hover:bg-white/12 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 backdrop-blur-sm">
              List Your Business Free
            </Link>
          </div>

          {/* Stats grid */}
          <div className="animate-fade-up delay-600 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: `${vendorCount?.toLocaleString() ?? '1,268'}+`, label: 'Verified Vendors', sub: 'across the GTA' },
              { value: `${leadCount?.toLocaleString() ?? '0'}+`, label: 'Couple Inquiries', sub: 'sent to vendors' },
              { value: '8', label: 'Cities Covered', sub: 'in Ontario' },
              { value: '100%', label: 'Free to Browse', sub: 'no signup needed' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center backdrop-blur-sm hover:bg-white/8 transition-colors duration-200">
                <div className="text-3xl md:text-4xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-xs font-semibold text-gray-300">{s.label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Explore</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">Browse by Category</h2>
            <p className="text-gray-500 max-w-md mx-auto">Everything you need for your dream South Asian wedding, all in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {(categories as Category[] ?? []).map((cat, i) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-premium card-interactive hover:border-[#E8760A]/30"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FAFAF7] group-hover:bg-[#E8760A]/8 flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-[#E8760A] transition-colors duration-200 leading-tight">{cat.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 group-hover:text-[#E8760A]/60 transition-colors">Browse all →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED VENDORS
      ═══════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Top Picks</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2">Featured Vendors</h2>
                <p className="text-gray-500">Handpicked top-rated vendors across the GTA</p>
              </div>
              <Link href="/vendors"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8760A] hover:gap-2.5 transition-all duration-200 group">
                See all
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((v, i) => (
                <div key={v.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/vendors"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-2xl hover:border-[#E8760A] hover:text-[#E8760A] transition-all duration-200 group">
                View All {vendorCount?.toLocaleString() ?? '1,268'}+ Vendors
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CITIES
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Coverage</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">Search by City</h2>
            <p className="text-gray-500">Vendors serving the entire Greater Toronto Area</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(cities as City[] ?? []).map((city) => (
              <Link key={city.slug} href={`/city/${city.slug}`}
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-premium card-interactive hover:border-[#E8760A]/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8760A]/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <MapPin className="w-5 h-5 text-gray-300 group-hover:text-[#E8760A] mx-auto mb-2.5 transition-colors duration-200 relative z-10" />
                <p className="font-bold text-gray-800 group-hover:text-[#E8760A] transition-colors duration-200 text-sm relative z-10">{city.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 relative z-10">Ontario, Canada</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">How Melaa Works</h2>
            <p className="text-gray-500">Find your perfect vendor in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="group">
                <div className={`bg-gradient-to-br ${step.color} rounded-3xl p-7 text-center border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1`}>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest mb-2 ${step.accent}`}>Step {step.step}</div>
                  <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY MELAA
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Our Difference</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">Why Melaa?</h2>
            <p className="text-gray-500">Built by the community, for the community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {WHY_MELAA.map((item) => (
              <div key={item.title}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-premium hover:shadow-premium-hover card-interactive">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#111111] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #E8760A 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-[#E8760A] text-xs font-bold uppercase tracking-widest mb-3">Real Stories</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">What Couples Are Saying</h2>
            <p className="text-gray-500">Real reviews from real South Asian couples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 transition-colors duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.city}, ON
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto opacity-70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VENDOR CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-[#FAFAF7] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8760A]/4 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/60 rounded-full translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#E8760A]/10 text-[#E8760A] text-xs font-bold px-4 py-2 rounded-full mb-6 border border-[#E8760A]/20">
            For Wedding Vendors
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-5 text-gray-900 leading-tight">
            Your next clients are{' '}
            <span className="gradient-text-warm">searching right now.</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            South Asian weddings are a <strong className="text-gray-900">$2B+ market</strong> in Canada. Get listed free for 90 days and lock in the Founding Vendor rate of{' '}
            <strong className="text-[#E8760A]">$49/mo forever</strong>.{' '}
            <span className="text-gray-500">Regular price will be $197/mo.</span>
          </p>

          {spotsLeft > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#E8760A] font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8760A] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8760A]"></span>
              </span>
              Only {spotsLeft} founding spots remaining
            </div>
          )}

          <Link href="/list-your-business"
            className="btn-primary inline-flex items-center gap-2 bg-[#E8760A] text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-saffron-lg mb-6">
            Claim My Founding Spot
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400 mt-2">
            {['No credit card required', 'Profile live same day', 'Cancel anytime'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
