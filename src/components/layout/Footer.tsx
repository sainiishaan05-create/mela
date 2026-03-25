import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#E8760A] mb-2">Melaa</p>
          <p className="text-sm">South Asian wedding vendors in the Greater Toronto Area.</p>
        </div>
        <div>
          <p className="text-white font-medium mb-3">Categories</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category/photographers" className="hover:text-white transition-colors">Photographers</Link></li>
            <li><Link href="/category/decorators" className="hover:text-white transition-colors">Decorators</Link></li>
            <li><Link href="/category/catering" className="hover:text-white transition-colors">Catering</Link></li>
            <li><Link href="/category/makeup-artists" className="hover:text-white transition-colors">Makeup Artists</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-medium mb-3">Cities</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/city/brampton" className="hover:text-white transition-colors">Brampton</Link></li>
            <li><Link href="/city/mississauga" className="hover:text-white transition-colors">Mississauga</Link></li>
            <li><Link href="/city/toronto" className="hover:text-white transition-colors">Toronto</Link></li>
            <li><Link href="/city/markham" className="hover:text-white transition-colors">Markham</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-medium mb-3">Vendors</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/list-your-business" className="hover:text-white transition-colors">List Your Business</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center text-xs py-4">
        © {new Date().getFullYear()} Melaa. All rights reserved.
      </div>
    </footer>
  )
}
