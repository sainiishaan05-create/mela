import Link from 'next/link'
import { getSiteStats } from '@/lib/stats'

const CATEGORIES = [
  { label: 'Photographers', href: '/category/photographers' },
  { label: 'Videographers', href: '/category/videographers' },
  { label: 'Caterers', href: '/category/catering' },
  { label: 'Decorators', href: '/category/decorators' },
  { label: 'Mehndi Artists', href: '/category/mehndi-artists' },
  { label: 'DJ & Entertainment', href: '/category/djs-entertainment' },
  { label: 'Makeup Artists', href: '/category/makeup-artists' },
  { label: 'Bridal Wear', href: '/category/bridal-wear' },
]

const CITIES = [
  { label: 'Toronto', href: '/city/toronto' },
  { label: 'Brampton', href: '/city/brampton' },
  { label: 'Mississauga', href: '/city/mississauga' },
  { label: 'Markham', href: '/city/markham' },
  { label: 'Vaughan', href: '/city/vaughan' },
  { label: 'Scarborough', href: '/city/scarborough' },
  { label: 'Oakville', href: '/city/oakville' },
  { label: 'Richmond Hill', href: '/city/richmond-hill' },
  { label: 'North York', href: '/city/north-york' },
  { label: 'Etobicoke', href: '/city/etobicoke' },
  { label: 'Newmarket', href: '/city/newmarket' },
  { label: 'Hamilton', href: '/city/hamilton' },
]

const VENDOR_LINKS = [
  { label: 'List Your Business', href: '/list-your-business' },
  { label: 'Pricing Plans', href: '/pricing' },
  { label: 'Vendor Dashboard', href: '/dashboard' },
  { label: 'Blog', href: '/blog' },
]

export default async function Footer() {
  const stats = await getSiteStats()
  return (
    <footer style={{ background: '#0C0A08' }} className="text-gray-400 relative overflow-hidden">
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(200,169,106,0.4) 30%, rgba(200,169,106,0.4) 70%, transparent)',
      }} />

      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center top, rgba(200,169,106,0.06) 0%, transparent 70%)',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 relative z-10">

        {/* Top: brand + stats */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-14 pb-14 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-xs">
            <Link href="/" className="font-[family-name:var(--font-playfair)] text-3xl font-bold block mb-4 hover:opacity-80 transition-opacity" style={{ color: 'var(--color-gold)' }}>
              Melaa
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The GTA's only marketplace built exclusively for South Asian weddings and events. Find vendors who understand your culture, no explaining required.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com/melaa.ca_" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[rgba(200,169,106,0.15)] hover:border-[rgba(200,169,106,0.3)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@melaa.ca" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[rgba(200,169,106,0.15)] hover:border-[rgba(200,169,106,0.3)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.79 1.52V6.7a4.85 4.85 0 01-1.02-.01z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { val: stats.vendorCountWithPlus, label: 'Verified Vendors' },
              { val: `${stats.cityCount}+`, label: 'Ontario Cities' },
              { val: `${stats.categoryCount}+`, label: 'Categories' },
              { val: '$0', label: 'Booking Fees' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-0.5" style={{ color: 'var(--color-gold)' }}>{val}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Categories */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Categories</p>
            <ul className="space-y-2.5">
              {CATEGORIES.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors duration-150 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Cities</p>
            <ul className="space-y-2.5">
              {CITIES.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors duration-150 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/browse" className="text-xs mt-3 inline-block hover:underline" style={{ color: 'var(--color-gold)' }}>
              View all cities →
            </Link>
          </div>

          {/* For Vendors */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">For Vendors</p>
            <ul className="space-y-2.5 mb-6">
              {VENDOR_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors duration-150 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA card */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Get Listed</p>
            <div className="rounded-2xl p-5" style={{ border: '1px solid rgba(200,169,106,0.2)', background: 'rgba(200,169,106,0.06)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-gold)' }}>Founding Vendor Rate</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>First 50 vendors get the exclusive $49/mo rate. Start free for 90 days.</p>
              <Link href="/list-your-business"
                className="inline-block text-xs font-bold px-4 py-2.5 rounded-xl transition-colors duration-200"
                style={{ background: 'var(--color-gold)', color: 'var(--color-text)' }}>
                Claim Free Spot →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
          <p>© {new Date().getFullYear()} Melaa. Built with love for the South Asian community. 🌺</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/vendors" className="hover:text-white transition-colors">Browse</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
