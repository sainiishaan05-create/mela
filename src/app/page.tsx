import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category, City } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Perfect{' '}
            <span className="text-[#E8760A]">South Asian</span>{' '}
            Wedding Vendors
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Discover trusted photographers, decorators, caterers, and more — all serving the South Asian community in the GTA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vendors"
              className="bg-[#E8760A] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#d06a09] transition-colors text-lg"
            >
              Browse All Vendors
            </Link>
            <Link
              href="/list-your-business"
              className="border border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-[#1A1A1A] transition-colors text-lg"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-center mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-500 text-center mb-10">Everything you need for your dream South Asian wedding</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {(categories as Category[] ?? []).map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:border-[#E8760A] hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <p className="font-medium text-sm text-gray-800 group-hover:text-[#E8760A] transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-center mb-2">
            Search by City
          </h2>
          <p className="text-gray-500 text-center mb-10">Vendors serving the Greater Toronto Area</p>
          <div className="flex flex-wrap justify-center gap-3">
            {(cities as City[] ?? []).map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="bg-[#FAFAF7] border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-full hover:border-[#E8760A] hover:text-[#E8760A] transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mela */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-center mb-12">
          Why Mela?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🤝',
              title: 'Built for South Asian Weddings',
              desc: 'Every vendor on Mela understands your culture, traditions, and what makes your celebration unique.',
            },
            {
              icon: '✅',
              title: 'Verified Local Vendors',
              desc: 'We manually verify every vendor in the GTA so you can book with confidence.',
            },
            {
              icon: '💬',
              title: 'Direct Contact',
              desc: 'Message vendors directly — no middlemen, no hidden fees, just real connections.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center p-6">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#E8760A] text-white py-14 px-4 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">
          Are you a wedding vendor?
        </h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          Join Mela free during our founding period and get discovered by thousands of South Asian families planning their weddings.
        </p>
        <Link
          href="/list-your-business"
          className="bg-white text-[#E8760A] font-bold px-8 py-4 rounded-full hover:bg-orange-50 transition-colors text-lg"
        >
          Get Listed Free →
        </Link>
      </section>
    </>
  )
}
