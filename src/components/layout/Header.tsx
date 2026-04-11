'use client'

import Link from 'next/link'
import { Menu, X, Sparkles, ChevronDown, MapPin, Search, ArrowRight, User, Grid3X3, ChevronRight, LogOut } from 'lucide-react'
import { CATEGORY_ICONS } from '@/lib/category-icons'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_SUGGESTIONS = [
  { label: 'Photographers in Brampton', href: '/vendors?search=Photographers+in+Brampton' },
  { label: 'Caterers Mississauga', href: '/vendors?search=Caterers+Mississauga' },
  { label: 'Mehndi Artists Toronto', href: '/vendors?search=Mehndi+Artists+Toronto' },
  { label: 'Bridal Makeup GTA', href: '/vendors?search=Bridal+Makeup+GTA' },
  { label: 'South Asian DJ', href: '/vendors?search=South+Asian+DJ' },
  { label: 'Wedding Decorators', href: '/vendors?search=Wedding+Decorators' },
]

/* Top-level categories shown in the dropdown — the most searched */
const FEATURED_CATEGORIES = [
  { label: 'Photographers', href: '/category/photographers', slug: 'photographers' },
  { label: 'Videographers', href: '/category/videographers', slug: 'videographers' },
  { label: 'Content Creators', href: '/category/content-creators', slug: 'content-creators' },
  { label: 'Makeup Artists', href: '/category/makeup-artists', slug: 'makeup-artists' },
  { label: 'Mehndi Artists', href: '/category/mehndi-artists', slug: 'mehndi-artists' },
  { label: 'Catering', href: '/category/catering', slug: 'catering' },
  { label: 'Favours & Live Stations', href: '/category/favours-live-stations', slug: 'favours-live-stations' },
  { label: 'Wedding Venues', href: '/category/wedding-venues', slug: 'wedding-venues' },
  { label: 'Decorators', href: '/category/decorators', slug: 'decorators' },
  { label: 'DJs & Entertainment', href: '/category/djs-entertainment', slug: 'djs-entertainment' },
]

/* Top cities shown in the dropdown */
const FEATURED_CITIES = [
  'Toronto', 'Brampton', 'Mississauga', 'Markham',
  'Vaughan', 'Scarborough', 'Richmond Hill', 'Oakville',
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [browseTab, setBrowseTab] = useState<'categories' | 'cities'>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [navDropdownStyle, setNavDropdownStyle] = useState<React.CSSProperties>({})
  const pathname = usePathname()
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [categoryCount, setCategoryCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetch('/api/stats').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.categoryCount) setCategoryCount(data.categoryCount)
    }).catch(() => {})
  }, [])

  const browseRef = useRef<HTMLDivElement>(null)
  const navSearchRef = useRef<HTMLFormElement>(null)
  const browseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setBrowseOpen(false)
  }, [pathname])

  useEffect(() => {
    function recalc() {
      if (!navSearchRef.current) return
      const rect = navSearchRef.current.getBoundingClientRect()
      setNavDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
    if (searchFocused) recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, { passive: true })
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc)
    }
  }, [searchFocused])

  const openBrowse = () => { if (browseTimer.current) clearTimeout(browseTimer.current); setBrowseOpen(true) }
  const closeBrowse = () => { browseTimer.current = setTimeout(() => setBrowseOpen(false), 120) }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/vendors?search=${encodeURIComponent(q)}`)
  }

  function citySlug(city: string) {
    return city.toLowerCase().replace(/ /g, '-').replace(/\./g, '')
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl shadow-[0_1px_0_rgba(203,191,179,0.5),0_4px_24px_rgba(0,0,0,0.04)] border-b' : 'border-b'}`}
        style={{ background: scrolled ? 'rgba(247,245,242,0.94)' : 'var(--color-bg)', borderColor: 'var(--color-taupe)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

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
          <nav className="hidden md:flex items-center gap-0.5 text-sm text-gray-600 shrink-0">

            {/* Unified Browse dropdown */}
            <div ref={browseRef} className="relative" onMouseEnter={openBrowse} onMouseLeave={closeBrowse}>
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                style={{ color: browseOpen ? 'var(--color-gold-dark)' : '#5C4F48', background: browseOpen ? 'rgba(200,169,106,0.1)' : 'transparent' }}
                aria-expanded={browseOpen}
              >
                Browse
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
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
                className="absolute top-full left-0 mt-2 w-[420px] rounded-2xl shadow-2xl z-50 border overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: 'var(--color-taupe)' }}>
                  <button
                    onClick={() => setBrowseTab('categories')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
                    style={{
                      color: browseTab === 'categories' ? 'var(--color-gold-dark)' : '#9B8E82',
                      borderBottom: browseTab === 'categories' ? '2px solid var(--color-gold-dark)' : '2px solid transparent',
                      background: browseTab === 'categories' ? 'rgba(200,169,106,0.06)' : 'transparent',
                    }}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    Categories
                  </button>
                  <button
                    onClick={() => setBrowseTab('cities')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
                    style={{
                      color: browseTab === 'cities' ? 'var(--color-gold-dark)' : '#9B8E82',
                      borderBottom: browseTab === 'cities' ? '2px solid var(--color-gold-dark)' : '2px solid transparent',
                      background: browseTab === 'cities' ? 'rgba(200,169,106,0.06)' : 'transparent',
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Cities
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-4">
                  {browseTab === 'categories' ? (
                    <>
                      <div className="grid grid-cols-2 gap-0.5">
                        {FEATURED_CATEGORIES.map(({ label, href, slug }) => {
                          const Icon = CATEGORY_ICONS[slug]
                          return (
                            <Link key={href} href={href}
                              className="nav-link flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm hover:bg-[#F5ECD7]/50 transition-colors duration-150 group"
                            >
                              <span className="w-6 text-center flex items-center justify-center">
                                {Icon ? <Icon className="w-4 h-4 text-[#C8A96A]" /> : null}
                              </span>
                              <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                            </Link>
                          )
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-taupe)' }}>
                        <Link href="/browse/categories" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                          View all{categoryCount ? ` ${categoryCount}` : ''} categories
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link href="/vendors" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          All Vendors
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-0.5">
                        {FEATURED_CITIES.map((city) => (
                          <Link key={city} href={`/city/${citySlug(city)}`}
                            className="nav-link flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm hover:bg-[#F5ECD7]/50 transition-colors duration-150 group"
                          >
                            <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C8A96A] shrink-0 transition-colors" />
                            <span className="text-gray-700 group-hover:text-gray-900">{city}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-taupe)' }}>
                        <Link href="/browse" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                          View all 50+ cities
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link href="/browse" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Browse by City
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Link href="/list-your-business" className={`nav-link px-3 py-2 font-medium ${pathname === '/list-your-business' ? 'active' : ''}`}>
              For Vendors
            </Link>
            <Link href="/pricing" className={`nav-link px-3 py-2 font-medium ${pathname === '/pricing' ? 'active' : ''}`}>
              Pricing
            </Link>
            <Link href="/blog" className={`nav-link px-3 py-2 font-medium ${pathname.startsWith('/blog') ? 'active' : ''}`}>
              Blog
            </Link>
          </nav>

          {/* Centre search bar — desktop only */}
          <div className="hidden md:block flex-1 mx-2" style={{ maxWidth: 340 }}>
            <form
              ref={navSearchRef}
              onSubmit={handleSearch}
              className={`flex items-center bg-white border rounded-xl transition-all duration-200 ${
                searchFocused
                  ? 'border-[#C8A96A] shadow-[0_0_0_2px_rgba(200,169,106,0.15)]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Search className={`w-4 h-4 ml-3 shrink-0 transition-colors ${searchFocused ? 'text-[#C8A96A]' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search vendors..."
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                autoComplete="off"
              />
              {searchQuery && (
                <button type="submit" className="mr-2 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors" style={{ background: 'var(--color-gold)', color: 'var(--color-text)' }}>
                  Go
                </button>
              )}
            </form>

            {/* Fixed-position suggestions dropdown */}
            {searchFocused && !searchQuery && (
              <div style={navDropdownStyle} className="bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Popular Searches</p>
                </div>
                {NAV_SUGGESTIONS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5ECD7]/60 transition-colors duration-150 group"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C8A96A] transition-colors shrink-0" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#C8A96A] ml-auto opacity-0 group-hover:opacity-100 transition-all duration-150" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            {/* Login / Dashboard — desktop */}
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border transition-colors hover:border-[#C8A96A] hover:text-[#C8A96A]"
                  style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}
                >
                  <User className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}
                  className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border transition-colors hover:border-[#C8A96A] hover:text-[#C8A96A]"
                  style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}
                >
                  <User className="w-3.5 h-3.5" />
                  Log In
                </Link>
                <Link href="/list-your-business" className="btn-gold hidden md:inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Claim Spot
                </Link>
              </>
            )}

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-600"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-[60] border-b shadow-xl md:hidden transition-all duration-300 overflow-y-auto max-h-[calc(100dvh-4rem)] ${
          menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
        style={{ background: '#F7F5F2', borderColor: 'var(--color-taupe)' }}
      >
        <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">

          {/* Mobile search */}
          <form onSubmit={(e) => { e.preventDefault(); const q = searchQuery.trim(); if (q) { router.push(`/vendors?search=${encodeURIComponent(q)}`); setMenuOpen(false) } }} className="mb-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendors, categories..."
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
          </form>

          <Link href="/vendors" onClick={() => setMenuOpen(false)} className="nav-link flex items-center justify-between px-4 py-3.5 text-sm font-medium">
            <span>Browse All Vendors</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link href="/browse/categories" onClick={() => setMenuOpen(false)} className="nav-link flex items-center justify-between px-4 py-3.5 text-sm font-medium">
            <span>Browse by Category</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link href="/browse" onClick={() => setMenuOpen(false)} className="nav-link flex items-center justify-between px-4 py-3.5 text-sm font-medium">
            <span>Browse by City</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link href="/list-your-business" onClick={() => setMenuOpen(false)} className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname === '/list-your-business' ? 'active' : ''}`}>
            For Vendors
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname === '/pricing' ? 'active' : ''}`}>
            Pricing
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className={`nav-link px-4 py-3.5 text-sm font-medium ${pathname.startsWith('/blog') ? 'active' : ''}`}>
            Blog
          </Link>

          <div className="pt-3 pb-2 border-t mt-2 flex flex-col gap-2" style={{ borderColor: 'var(--color-taupe)' }}>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full text-sm font-medium px-4 py-3.5 rounded-xl border transition-colors" style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}>
                  <User className="w-4 h-4" />
                  My Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    setMenuOpen(false)
                    window.location.href = '/'
                  }}
                  className="flex items-center justify-center gap-2 w-full text-sm font-medium px-4 py-3.5 rounded-xl border transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full text-sm font-medium px-4 py-3.5 rounded-xl border transition-colors" style={{ borderColor: 'var(--color-taupe)', color: '#5C4F48' }}>
                  <User className="w-4 h-4" />
                  Log In
                </Link>
                <Link href="/list-your-business" onClick={() => setMenuOpen(false)} className="btn-gold flex items-center justify-center gap-2 w-full text-sm px-4 py-3.5 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                  Claim My Founding Spot
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
