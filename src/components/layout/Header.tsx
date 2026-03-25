import Link from 'next/link'
import { Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#E8760A] shrink-0">
          Melaa
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-gray-600">
          <Link href="/vendors" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors font-medium">
            Find Vendors
          </Link>
          <Link href="/category/photographers" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors">
            Photographers
          </Link>
          <Link href="/category/catering" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors">
            Caterers
          </Link>
          <Link href="/category/decorators" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors">
            Decorators
          </Link>
          <Link href="/category/mehndi-artists" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors">
            Mehndi
          </Link>
          <Link href="/pricing" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-[#E8760A] transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/vendors" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8760A] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
            <Search className="w-4 h-4" />
          </Link>
          <Link
            href="/list-your-business"
            className="bg-[#E8760A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#d06a09] transition-colors whitespace-nowrap"
          >
            List Free
          </Link>
        </div>
      </div>
    </header>
  )
}
