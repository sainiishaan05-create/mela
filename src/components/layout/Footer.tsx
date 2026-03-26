import Link from 'next/link'

const CATEGORIES = [
  { label: 'Photographers', href: '/category/photographers' },
  { label: 'Caterers', href: '/category/catering' },
  { label: 'Decorators', href: '/category/decorators' },
  { label: 'Mehndi Artists', href: '/category/mehndi-artists' },
  { label: 'DJ & Entertainment', href: '/category/djs-entertainment' },
  { label: 'Makeup Artists', href: '/category/makeup-artists' },
  { label: 'Bridal Wear', href: '/category/bridal-wear' },
  { label: 'Wedding Venues', href: '/category/wedding-venues' },
]

const CITIES = [
  { label: 'Brampton', href: '/city/brampton' },
  { label: 'Mississauga', href: '/city/mississauga' },
  { label: 'Toronto', href: '/city/toronto' },
  { label: 'Markham', href: '/city/markham' },
  { label: 'Vaughan', href: '/city/vaughan' },
  { label: 'Scarborough', href: '/city/scarborough' },
]

const VENDOR_LINKS = [
  { label: 'List Your Business', href: '/list-your-business' },
  { label: 'Pricing Plans', href: '/pricing' },
  { label: 'Vendor Dashboard', href: '/dashboard' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 relative overflow-hidden">
      {/* Subtle glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#E8760A]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#E8760A] block hover:opacity-80 transition-opacity">
              Melaa
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              The GTA&apos;s only marketplace built exclusively for South Asian weddings.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://instagram.com/melaa.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#E8760A]/15 border border-white/8 hover:border-[#E8760A]/30 flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@melaa.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#E8760A]/15 border border-white/8 hover:border-[#E8760A]/30 flex items-center justify-center transition-all duration-200"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.79 1.52V6.7a4.85 4.85 0 01-1.02-.01z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-white text-sm font-semibold mb-4 tracking-wide">Categories</p>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <p className="text-white text-sm font-semibold mb-4 tracking-wide">Cities</p>
            <ul className="space-y-2.5">
              {CITIES.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <p className="text-white text-sm font-semibold mb-4 tracking-wide">For Vendors</p>
            <ul className="space-y-2.5">
              {VENDOR_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Vendor CTA */}
            <div className="mt-6 p-4 rounded-2xl border border-[#E8760A]/20 bg-[#E8760A]/8">
              <p className="text-xs text-[#E8760A] font-semibold mb-1">Founding Vendor Rate</p>
              <p className="text-xs text-gray-400 mb-3">Lock in $49/mo forever — only 23 spots left</p>
              <Link
                href="/list-your-business"
                className="inline-block text-xs font-bold text-white bg-[#E8760A] hover:bg-[#d06a09] px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Claim Spot →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Melaa. Built for the South Asian community. 🌺</p>
          <div className="flex items-center gap-4">
            <Link href="/vendors" className="hover:text-gray-400 transition-colors">Browse Vendors</Link>
            <Link href="/list-your-business" className="hover:text-gray-400 transition-colors">List Free</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
