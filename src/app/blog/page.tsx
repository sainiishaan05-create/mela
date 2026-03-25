import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'South Asian Wedding Planning Blog | Melaa',
  description:
    'Expert advice, local guides, and vendor tips for planning your South Asian wedding in the GTA — covering Brampton, Mississauga, Toronto, and beyond.',
}

const categoryLabels: Record<string, string> = {
  photographers: 'Photography',
  videographers: 'Videography',
  decorators: 'Decoration',
  catering: 'Catering',
  'djs-entertainment': 'DJ & Entertainment',
  'makeup-artists': 'Makeup',
  'mandap-rental': 'Mandap Rental',
  'wedding-planners': 'Wedding Planning',
  'bridal-wear': 'Bridal Wear',
  'mehndi-artists': 'Mehndi',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndexPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#E8760A] font-semibold uppercase tracking-widest text-sm mb-3">
            The Melaa Blog
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4 leading-tight">
            South Asian Wedding Planning{' '}
            <span className="text-[#E8760A]">Guides & Tips</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Everything you need to know to plan your perfect South Asian wedding
            in Brampton, Mississauga, Toronto, and across the GTA.
          </p>
        </div>
      </section>

      {/* Post Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8760A] transition-all flex flex-col"
            >
              {/* Category badge */}
              <div className="px-6 pt-6">
                <span className="inline-block bg-[#E8760A]/10 text-[#E8760A] text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">
                  {categoryLabels[post.category] ?? post.category}
                </span>
              </div>

              {/* Content */}
              <div className="px-6 pt-4 pb-6 flex flex-col flex-1">
                <Link href={`/blog/${post.slug}`} className="group">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1A1A1A] mb-3 leading-snug group-hover:text-[#E8760A] transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <time
                    dateTime={post.date}
                    className="text-gray-400 text-xs"
                  >
                    {formatDate(post.date)}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#E8760A] text-sm font-semibold hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#E8760A] text-white py-14 px-4 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">
          Ready to find your vendors?
        </h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          Browse trusted South Asian wedding vendors across the GTA — all in one
          place.
        </p>
        <Link
          href="/vendors"
          className="bg-white text-[#E8760A] font-bold px-8 py-4 rounded-full hover:bg-orange-50 transition-colors text-lg"
        >
          Browse All Vendors →
        </Link>
      </section>
    </>
  )
}
