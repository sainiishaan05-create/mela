import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#E8760A]">
          Mela
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/vendors" className="hover:text-[#E8760A] transition-colors">Find Vendors</Link>
          <Link href="/pricing" className="hover:text-[#E8760A] transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-[#E8760A] transition-colors">Blog</Link>
        </nav>
        <Link
          href="/list-your-business"
          className="bg-[#E8760A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#d06a09] transition-colors"
        >
          List Your Business
        </Link>
      </div>
    </header>
  )
}
