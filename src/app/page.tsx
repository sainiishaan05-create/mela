import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category, City, Vendor } from '@/types'
import SearchBar from '@/components/ui/SearchBar'
import VendorCard from '@/components/vendors/VendorCard'
import { MapPin, ChevronRight, TrendingUp, Star, Shield, Users } from 'lucide-react'

export const revalidate = 300

const TRENDING_SEARCHES = [
  { label: 'Photographers in Brampton', href: '/vendors?category=photographers&city=brampton' },
  { label: 'Caterers in Mississauga', href: '/vendors?category=catering&city=mississauga' },
  { label: 'Mehndi Artists GTA', href: '/category/mehndi-artists' },
  { label: 'Bridal Makeup Toronto', href: '/vendors?category=makeup-artists&city=toronto' },
  { label: 'Mandap Rental', href: '/category/mandap-rental' },
  { label: 'South Asian DJs', href: '/category/djs-entertainment' },
]

const HOW_IT_WORKS = [
  { step: '1', icon: '🔍', title: 'Search your category', desc: 'Browse by vendor type and city — photographers, caterers, decorators and more.' },
  { step: '2', icon: '📋', title: 'Read real profiles', desc: 'See ratings, photos, descriptions and contact info for every verified vendor.' },
  { step: '3', icon: '💬', title: 'Contact directly', desc: 'Message vendors directly — no middlemen, no booking fees, no commissions.' },
]

const TESTIMONIALS = [
  { name: 'Priya & Karan S.', city: 'Brampton', text: 'Found our photographer AND decorator through Melaa. Saved us weeks of searching through random Google results that had nothing to do with our culture.', stars: 5 },
  { name: 'Aisha M.', city: 'Mississauga', text: 'Every vendor on here actually understands Pakistani weddings. That alone made it worth it. Our caterer was exactly what we needed.', stars: 5 },
  { name: 'Simran K.', city: 'Toronto', text: 'The mehndi artist we found through Melaa was incredible. Never would have found her otherwise. This site is a game changer for South Asian couples.', stars: 5 },
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
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const spotsLeft = Math.max(0, 50 - (vendorCount ?? 0))
  const featured = (featuredVendors as Vendor[] ?? [])

  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #E8760A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #E8760A 0%, transparent 40%)'}} />
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          {spotsLeft > 0 && (
            <div className="inline-flex items-center gap-2 mb-6 bg-[#E8760A]/20 border border-[#E8760A]/40 text-[#E8760A] text-sm font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8760A] animate-pulse" />
              {spotsLeft} Founding Vendor spots left — free for 90 days
            </div>
          )}

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Find Your Perfect{' '}
            <span className="text-[#E8760A]">South Asian</span>{' '}
            Wedding Vendors
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            The GTA&apos;s only marketplace built exclusively for South Asian weddings.
            {' '}{vendorCount ?? 62}+ verified vendors across every category.
          </p>

          <div className="w-full max-w-2xl mx-auto mb-6">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="flex items-center gap-1 text-xs text-gray-500 mr-1">
              <TrendingUp className="w-3 h-3" /> Trending:
            </span>
            {TRENDING_SEARCHES.map(s => (
              <Link key={s.href} href={s.href}
                className="text-xs bg-white/10 hover:bg-[#E8760A]/20 border border-white/10 hover:border-[#E8760A]/40 text-gray-300 hover:text-[#E8760A] px-3 py-1.5 rounded-full transition-all">
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/vendors"
              className="bg-[#E8760A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#d06a09] transition-colors text-lg shadow-lg shadow-orange-900/30">
              Browse {vendorCount ?? 62}+ Vendors
            </Link>
            <Link href="/list-your-business"
              className="border border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-[#1A1A1A] transition-colors text-lg">
              List Your Business Free →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              { value: `${vendorCount ?? 62}+`, label: 'Verified Vendors' },
              { value: `${leadCount ?? 0}+`, label: 'Couple Inquiries' },
              { value: '8', label: 'Cities Covered' },
              { value: '100%', label: 'Free to Browse' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-gray-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 px-4 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-gray-500">Everything you need for your dream South Asian wedding</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(categories as Category[] ?? []).map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:border-[#E8760A] hover:shadow-md transition-all group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-[#E8760A] transition-colors">{cat.name}</p>
                <p className="text-[11px] text-gray-400 mt-1">Browse all →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VENDORS */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-1">Featured Vendors</h2>
                <p className="text-gray-500">Handpicked top-rated vendors across the GTA</p>
              </div>
              <Link href="/vendors" className="hidden sm:flex items-center gap-1 text-sm text-[#E8760A] font-semibold hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(v => <VendorCard key={v.id} vendor={v} />)}
            </div>
            <div className="text-center mt-8">
              <Link href="/vendors"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-full hover:border-[#E8760A] hover:text-[#E8760A] transition-colors">
                View All {vendorCount ?? 62}+ Vendors <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CITIES */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">Search by City</h2>
            <p className="text-gray-500">Vendors serving the entire Greater Toronto Area</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(cities as City[] ?? []).map((city) => (
              <Link key={city.slug} href={`/city/${city.slug}`}
                className="group bg-[#FAFAF7] border border-gray-100 rounded-2xl p-4 text-center hover:border-[#E8760A] hover:bg-orange-50 transition-all">
                <MapPin className="w-5 h-5 text-gray-300 group-hover:text-[#E8760A] mx-auto mb-2 transition-colors" />
                <p className="font-semibold text-gray-800 group-hover:text-[#E8760A] transition-colors text-sm">{city.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Ontario</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">How Melaa Works</h2>
            <p className="text-gray-500">Find your perfect vendor in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-[#E8760A]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-[#E8760A] uppercase tracking-widest mb-2">Step {step.step}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY MELAA */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">Why Melaa?</h2>
            <p className="text-gray-500">Built by the community, for the community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🌺', title: 'Built for South Asian Weddings', desc: 'Every vendor on Melaa understands your culture, traditions, and what makes your celebration unique. We speak your language — literally.' },
              { icon: '✅', title: 'Verified Local Vendors', desc: 'We manually review every vendor in the GTA. No generic directories — only real, active professionals who serve the community.' },
              { icon: '💬', title: 'Direct Contact, No Fees', desc: 'Message vendors directly. No booking fees, no commissions, no hidden costs. Just real connections between couples and vendors.' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#1A1A1A] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">What Couples Are Saying</h2>
            <p className="text-gray-400">Real reviews from real South Asian couples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.city}, ON</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDOR CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#E8760A] text-sm font-bold uppercase tracking-widest mb-3">For Wedding Vendors</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Your next clients are searching right now.
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            South Asian weddings are a $2B+ market in Canada. Get listed free for 90 days and lock in the Founding Vendor rate of{' '}
            <strong className="text-[#E8760A]">$49/mo forever</strong>. Regular price goes to $197/mo.
          </p>
          {spotsLeft > 0 && (
            <p className="text-[#E8760A] font-semibold mb-6 text-sm">🔥 Only {spotsLeft} founding spots remaining</p>
          )}
          <Link href="/list-your-business"
            className="inline-block bg-[#E8760A] text-white font-bold px-10 py-4 rounded-full hover:bg-[#d06a09] transition-colors text-lg shadow-lg shadow-orange-200">
            Claim My Founding Spot →
          </Link>
          <p className="text-gray-400 text-sm mt-4">No credit card required · Profile live same day · Cancel anytime</p>
        </div>
      </section>
    </>
  )
}
