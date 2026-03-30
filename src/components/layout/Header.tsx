'use client'

import Link from 'next/link'
import { Menu, X, Sparkles, ChevronDown, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Categories grouped for mega-menu display
const CATEGORIES_NAV = [
  // Capture
  { label: 'Photographers', href: '/category/photographers', icon: '📸', group: 'Capture & Media' },
  { label: 'Videographers', href: '/category/videographers', icon: '🎥', group: 'Capture & Media' },
  { label: 'Photo Booths', href: '/category/photo-booths', icon: '🎭', group: 'Capture & Media' },
  // Beauty
  { label: 'Makeup Artists', href: '/category/makeup-artists', icon: '💄', group: 'Beauty & Style' },
  { label: 'Mehndi Artists', href: '/category/mehndi-artists', icon: '🌿', group: 'Beauty & Style' },
  { label: 'Hair Stylists', href: '/category/hair-stylists', icon: '💇', group: 'Beauty & Style' },
  { label: 'Nail Artists', href: '/category/nail-artists', icon: '💅', group: 'Beauty & Style' },
  { label: 'Bridal Fitness', href: '/category/bridal-fitness', icon: '🧘', group: 'Beauty & Style' },
  // Venue & Decor
  { label: 'Wedding Venues', href: '/category/wedding-venues', icon: '🏛️', group: 'Venue & Decor' },
  { label: 'Decorators', href: '/category/decorators', icon: '🌸', group: 'Venue & Decor' },
  { label: 'Mandap Rental', href: '/category/mandap-rental', icon: '🕌', group: 'Venue & Decor' },
  { label: 'Florists', href: '/category/florists', icon: '💐', group: 'Venue & Decor' },
  { label: 'Sound & Lighting', href: '/category/sound-lighting', icon: '💡', group: 'Venue & Decor' },
  { label: 'Tent Rentals', href: '/category/tent-rentals', icon: '⛺', group: 'Venue & Decor' },
  { label: 'Linen & Furniture', href: '/category/linen-furniture', icon: '🪑', group: 'Venue & Decor' },
  // Food & Sweets
  { label: 'Catering', href: '/category/catering', icon: '🍽️', group: 'Food & Sweets' },
  { label: 'Sweets & Mithai', href: '/category/sweets-mithai', icon: '🍬', group: 'Food & Sweets' },
  { label: 'Cake & Desserts', href: '/category/cakes-desserts', icon: '🎂', group: 'Food & Sweets' },
  // Entertainment
  { label: 'DJs & Entertainment', href: '/category/djs-entertainment', icon: '🎵', group: 'Entertainment' },
  { label: 'Dhol Players & Bhangra', href: '/category/dhol-players', icon: '🥁', group: 'Entertainment' },
  { label: 'Sangeet Entertainment', href: '/category/sangeet-entertainment', icon: '🎤', group: 'Entertainment' },
  { label: 'Baraat & Entertainment', href: '/category/baraat-entertainment', icon: '🐎', group: 'Entertainment' },
  // Fashion & More
  { label: 'Bridal Wear', href: '/category/bridal-wear', icon: '👗', group: 'Fashion & More' },
  { label: 'Jewellery', href: '/category/jewellery', icon: '💎', group: 'Fashion & More' },
  { label: 'Invitations & Cards', href: '/category/invitations', icon: '💌', group: 'Fashion & More' },
  { label: 'Transportation', href: '/category/transportation', icon: '🚗', group: 'Fashion & More' },
  { label: 'Priest Services', href: '/category/priest-services', icon: '🕉️', group: 'Fashion & More' },
  { label: 'Wedding Planners', href: '/category/wedding-planners', icon: '📋', group: 'Fashion & More' },
  { label: 'Honeymoon Travel', href: '/category/honeymoon-travel', icon: '✈️', group: 'Fashion & More' },
]

// GTA Core cities shown first, then surrounding areas
const CITIES_NAV_GTA = [
  'Toronto', 'Brampton', 'Mississauga', 'Markham', 'Vaughan', 'Scarborough',
  'Richmond Hill', 'Oakville', 'Etobicoke', 'North York', 'Thornhill', 'Woodbridge',
  'Malton', 'Port Credit', 'Streetsville', 'Meadowvale', 'Concord', 'Maple',
]

const CITIES_NAV_SURROUNDING = [
  'Ajax', 'Pickering', 'Oshawa', 'Whitby', 'Bowmanville',
  'Burlington', 'Milton', 'Halton Hills', 'Georgetown',
  'Caledon', 'Bolton', 'King City', 'Kleinburg', 'Nobleton',
  'Newmarket', 'Aurora', 'Bradford', 'East Gwillimbury', 'Innisfil', 'Barrie',
  'Hamilton', 'Brantford', 'Kitchener', 'Waterloo', 'Cambridge', 'Guelph',
  'Stouffville', 'Uxbridge', 'Peterborough',
  'St. Catharines', 'Niagara Falls', 'London', 'Windsor',
]

const CITIES_NAV = [...CITIES_NAV_GTA, ...CITIES_NAV_SURROUNDING]

const POPULAR_SEARCHES = [
  { label: 'South Asian Photographers', href: '/category/photographers' },
  { label: 'Mehndi Artists Near Me', href: '/category/mehndi-artists' },
  { label: 'Indian Wedding Caterers', href: '/category/catering' },
  { label: 'Bridal Makeup Artists', href: '/category/makeup-artists' },
  { label: 'Wedding Mandap Decorators', href: '/category/mandap-stages' },
  { label: 'Bollywood DJs', href: '/category/djs-entertainment' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [citiesOpen, setCitiesOpen] = useState(false)
  const [mobileBrowseOpen, setMobileBrowseOpen] = useState(false)
  const [mobileCitiesOpen, setMobileCitiesOpen] = useState(false)
  const pathname = usePathname()

  const browseRef = useRef<HTMLDivElement>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const browseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const citiesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setBrowseOpen(false)
    setCitiesOpen(false)
  }, [pathname])

  const openBrowse = () => {
    if (browseTimer.current) clearTimeout(browseTimer.current)
    setBrowseOpen(true)
  }
  const closeBrowse = () => {
    browseTimer.current = setTimeout(() => setBrowseOpen(false), 120)
  }
  const openCities = () => {
    if (citiesTimer.current) clearTimeout(citiesTimer.current)
    setCitiesOpen(true)
  }
  const closeCities = () => {
    citiesTimer.current = setTimeout(() => setCitiesOpen(false), 120)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl shadow-sm border-b'
            : 'border-b'
        }`}
        style={{
          background: scrolled ? 'rgba(247,245,242,0.92)' : 'var(--color-bg)',
          borderColor: 'var(--color-taupe)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold shrink-0 hover:opacity-70 transition-opacity duration-200"
            style={{ color: 'var(--color-text)' }}
            onClick={() => setMenuOpen(false)}
          >
            Melaa
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-sm text-gray-600">

            {/* Browse dropdown */}
            <div
              ref={browseRef}
              className="relative"
              onMouseEnter={openBrowse}
              onMouseLeave={closeBrowse}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200`}
                style={{
                  color: browseOpen ? 'var(--color-gold-dark)' : '#5C4F48',
                  background: browseOpen ? 'rgba(200,169,106,0.1)' : 'transparent',
                }}
                aria-expanded={browseOpen}
                aria-haspopup="true"
              >
                Browse
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Browse mega-dropdown */}
              <div
                onMouseEnter={openBrowse}
                onMouseLeave={closeBrowse}
                style={{
                  opacity: browseOpen ? 1 : 0,
                  transform: browseOpen ? 'translateY(0)' : 'translateY(-4px)',
                  pointerEvents: browseOpen ? 'auto' : 'none',
                  transition: 'opacity 200ms ease, transform 200ms ease',
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-taupe)',
                }}
                className="absolute top-full left-0 mt-2 w-[860px] rounded-2xl shadow-2xl p-6 z-50 border"
                role="menu"
              >
                {/* Group headers */}
                <div className="grid grid-cols-5 gap-6">
                  {(['Capture & Media', 'Beauty & Style', 'Venue & Decor', 'Food & Sweets', 'Entertainment'] as const).map((grp) => (
                    <div key={grp}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-taupe)' }}>{grp}</p>
                      <div className="space-y-0.5">
                        {CATEGORIES_NAV.filter(c => c.group === grp).map(({ label, href, icon }) => (
                          <Link
                            key={href}
                            href={href}
                            role="menuitem"
                            className="nav-link flex items-center gap-2 py-1.5 px-2 text-sm"
                          >
                            <span className="text-sm leading-none">{icon}</span>
                            <span className="leading-tight text-xs">{label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Fashion & More row + CTA */}
                <div className="mt-4 pt-4 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: 'var(--color-taupe)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: 'var(--color-taupe)' }}>Fashion & More</p>
                  {CATEGORIES_NAV.filter(c => c.group === 'Fashion & More').map(({ label, href, icon }) => (
                    <Link key={href} href={href} role="menuitem"
                      className="nav-link flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs border"
                      style={{ borderColor: 'var(--color-taupe)', background: 'white' }}>
                      <span>{icon}</span>{label}
                    </Link>
                  ))}
                  <Link href="/vendors" className="ml-auto text-sm font-semibold hover:underline shrink-0" style={{ color: 'var(--color-gold-dark)' }}>
                    All Vendors →
                  </Link>
                </div>
                {/* Hidden popular searches placeholder — kept for structure */}
                <div className="hidden">
                  <div className="flex-[1] border-l border-gray-100 pl-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular Searches</p>
                    <ul className="space-y-1">
                      {POPULAR_SEARCHES.map(({ label, href }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            role="menuitem"
                            className="block text-sm text-gray-600 hover:text-[#E8760A] py-1.5 px-2 rounded-lg hover:bg-[#E8760A]/5 transition-all duration-150"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cities dropdown */}
            <div
              ref={citiesRef}
              className="relative"
              onMouseEnter={openCities}
              onMouseLeave={closeCities}
            >
              <button
                className="nav-link flex items-center gap-1 px-3 py-2 font-medium"
                style={{
                  color: citiesOpen ? 'var(--color-gold-dark)' : '#5C4F48',
                  background: citiesOpen ? 'rgba(200,169,106,0.1)' : 'transparent',
                }}
                aria-expanded={citiesOpen}
                aria-haspopup="true"
              >
                Cities
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${citiesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Cities dropdown panel */}
              <div
                onMouseEnter={openCities}
                onMouseLeave={closeCities}
                style={{
                  opacity: citiesOpen ? 1 : 0,
                  transform: citiesOpen ? 'translateY(0)' : 'translateY(-4px)',
                  pointerEvents: citiesOpen ? 'auto' : 'none',
                  transition: 'opacity 200ms ease, transform 200ms ease',
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-taupe)',
                }}
                className="absolute top-full -right-4 mt-2 w-[620px] rounded-2xl shadow-2xl p-6 z-50 border"
                role="menu"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-taupe)' }}>GTA Core</p>
                    <div className="grid grid-cols-2 gap-x-2">
                      {CITIES_NAV_GTA.map((city) => {
                        const slug = city.toLowerCase().replace(/ /g, '-').replace(/\./g, '')
                        return (
                          <Link key={city} href={`/city/${slug}`} role="menuitem"
                            className="nav-link flex items-center gap-1.5 text-xs py-1.5 px-2">
                            <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />{city}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-taupe)' }}>Surrounding Areas</p>
                    <div className="grid grid-cols-2 gap-x-2 max-h-52 overflow-y-auto scrollbar-hide">
                      {CITIES_NAV_SURROUNDING.map((city) => {
                        const slug = city.toLowerCase().replace(/ /g, '-').replace(/\./g, '')
                        return (
                          <Link key={city} href={`/city/${slug}`} role="menuitem"
                            className="nav-link flex items-center gap-1.5 text-xs py-1.5 px-2">
                            <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />{city}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-taupe)' }}>
                  <Link href="/browse" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                    Browse all Ontario cities →
                  </Link>
                </div>
              </div>
            </div>

            {/* Categories */}
            <Link
              href="/categories"
              className={`nav-link px-3 py-2 font-medium ${pathname === '/categories' ? 'active' : ''}`}
            >
              Categories
            </Link>

            {/* For Vendors */}
            <Link
              href="/list-your-business"
              className={`nav-link px-3 py-2 font-medium ${pathname === '/list-your-business' ? 'active' : ''}`}
            >
              For Vendors
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className={`nav-link px-3 py-2 font-medium ${pathname === '/pricing' ? 'active' : ''}`}
            >
              Pricing
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className={`nav-link px-3 py-2 font-medium ${pathname.startsWith('/blog') ? 'active' : ''}`}
            >
              Blog
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/list-your-business"
              className="btn-gold inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Claim Spot
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-600"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={`transition-all duration-300 ${menuOpen ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`transition-all duration-300 ${menuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}>
                <X className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 backdrop-blur-xl border-b shadow-xl md:hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-y-auto max-h-[calc(100dvh-4rem)] ${
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
        style={{ background: 'rgba(247,245,242,0.97)', borderColor: 'var(--color-taupe)' }}
        aria-hidden={!menuOpen}
      >
        <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">

          {/* Browse all vendors */}
          <Link
            href="/vendors"
            onClick={() => setMenuOpen(false)}
            className="nav-link px-4 py-3.5 text-sm font-medium"
          >
            Browse All Vendors
          </Link>

          {/* Categories accordion */}
          <div>
            <button
              onClick={() => setMobileBrowseOpen(prev => !prev)}
              className="nav-link w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium"
              aria-expanded={mobileBrowseOpen}
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileBrowseOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              style={{
                maxHeight: mobileBrowseOpen ? '600px' : '0',
                overflow: 'hidden',
                transition: 'max-height 300ms ease',
              }}
            >
              <div className="pb-2 px-2">
                {CATEGORIES_NAV.map(({ label, href, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="nav-link flex items-center gap-3 px-4 py-3 text-sm"
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Cities accordion */}
          <div>
            <button
              onClick={() => setMobileCitiesOpen(prev => !prev)}
              className="nav-link w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium"
              aria-expanded={mobileCitiesOpen}
            >
              <span>Cities</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileCitiesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              style={{
                maxHeight: mobileCitiesOpen ? '600px' : '0',
                overflow: 'hidden',
                transition: 'max-height 300ms ease',
              }}
            >
              <div className="pb-2 px-2 grid grid-cols-2 gap-0.5">
                {CITIES_NAV.map((city) => {
                  const slug = city.toLowerCase().replace(/ /g, '-')
                  return (
                    <Link
                      key={city}
                      href={`/city/${slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="nav-link flex items-center gap-1.5 px-4 py-2.5 text-sm"
                    >
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      {city}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* For Vendors */}
          <Link
            href="/list-your-business"
            onClick={() => setMenuOpen(false)}
            className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname === '/list-your-business' ? 'active' : ''}`}
          >
            For Vendors
          </Link>

          {/* Pricing */}
          <Link
            href="/pricing"
            onClick={() => setMenuOpen(false)}
            className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname === '/pricing' ? 'active' : ''}`}
          >
            Pricing
          </Link>

          {/* Blog */}
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname.startsWith('/blog') ? 'active' : ''}`}
          >
            Blog
          </Link>

          <div className="pt-3 pb-2 border-t mt-2" style={{ borderColor: 'var(--color-taupe)' }}>
            <Link
              href="/list-your-business"
              onClick={() => setMenuOpen(false)}
              className="btn-gold flex items-center justify-center gap-2 w-full text-sm px-4 py-3.5 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              Claim My Founding Spot
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
