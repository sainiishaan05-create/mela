'use client'

import Link from 'next/link'
import { Search, Menu, X, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/vendors', label: 'Find Vendors' },
  { href: '/category/photographers', label: 'Photographers' },
  { href: '/category/catering', label: 'Caterers' },
  { href: '/category/decorators', label: 'Decorators' },
  { href: '/category/mehndi-artists', label: 'Mehndi' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-gray-100/80 shadow-sm'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#E8760A] shrink-0 hover:opacity-80 transition-opacity duration-200"
            onClick={() => setMenuOpen(false)}
          >
            Melaa
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-sm text-gray-600">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                pathname === href ||
                (href !== '/vendors' && href !== '/pricing' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#E8760A] bg-[#E8760A]/8'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8760A]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/vendors"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8760A] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
              aria-label="Search vendors"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              href="/list-your-business"
              className="btn-primary inline-flex items-center gap-1.5 bg-[#E8760A] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-saffron"
            >
              <Sparkles className="w-3.5 h-3.5" />
              List Free
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
        className={`fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl md:hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }, i) => {
            const isActive =
              pathname === href ||
              (href !== '/vendors' && href !== '/pricing' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E8760A]/10 text-[#E8760A] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#E8760A]'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {label}
              </Link>
            )
          })}
          <div className="pt-3 pb-2 border-t border-gray-100 mt-2">
            <Link
              href="/list-your-business"
              onClick={() => setMenuOpen(false)}
              className="btn-primary flex items-center justify-center gap-2 w-full bg-[#E8760A] text-white text-sm font-bold px-4 py-3.5 rounded-xl shadow-saffron"
            >
              <Sparkles className="w-4 h-4" />
              List Your Business Free →
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
