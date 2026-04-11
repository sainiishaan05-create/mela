import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog'
import { Clock, ArrowRight, BookOpen, Flower2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'South Asian Wedding Planning Blog | Melaa',
  description:
    'Expert advice, local guides, and vendor tips for planning your wedding or event in the GTA. Covering Brampton, Mississauga, Toronto, and beyond.',
}

const categoryLabels: Record<string, string> = {
  photographers: 'Photography',
  videographers: 'Videography',
  'content-creators': 'Content Creation',
  decorators: 'Decoration',
  catering: 'Catering',
  'favours-live-stations': 'Favours & Live Stations',
  'djs-entertainment': 'DJ & Entertainment',
  'makeup-artists': 'Makeup & Hair',
  'mandap-rental': 'Mandap & Stage',
  'wedding-planners': 'Wedding Planning',
  'bridal-wear': 'Bridal Wear',
  'mehndi-artists': 'Mehndi',
  'florists': 'Florals',
  'invitations': 'Invitations',
}

const categoryColors: Record<string, string> = {
  photographers: 'bg-rose-50 text-rose-600',
  videographers: 'bg-violet-50 text-violet-600',
  'content-creators': 'bg-indigo-50 text-indigo-600',
  decorators: 'bg-pink-50 text-pink-600',
  catering: 'bg-amber-50 text-amber-700',
  'favours-live-stations': 'bg-orange-50 text-orange-600',
  'djs-entertainment': 'bg-blue-50 text-blue-600',
  'makeup-artists': 'bg-fuchsia-50 text-fuchsia-600',
  'mandap-rental': 'bg-[#F5ECD7] text-[#C8A96A]',
  'wedding-planners': 'bg-emerald-50 text-emerald-700',
  'bridal-wear': 'bg-purple-50 text-purple-600',
  'mehndi-artists': 'bg-green-50 text-green-700',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const featured = blogPosts[0]
const rest = blogPosts.slice(1)

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Hero — Manuscript identity */}
      <section className="bg-luxury-dark hero-manuscript relative">
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="masthead mb-6">
            <span className="masthead-title">Melaa Editorial</span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Wedding Planning{' '}
            <span className="gradient-text">Guides & Tips</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to plan a perfect South Asian wedding in Brampton, Mississauga,
            Toronto, and across the GTA. Written by people who understand your culture.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/40 text-sm">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {blogPosts.length} articles</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Updated weekly</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Free to read</span>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 mb-12">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover card-interactive border border-gray-100/80 relative">
              <div className="cover-ribbon">COVER STORY</div>
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                  {featured.coverImage ? (
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F5ECD7] to-[#FDF6E9] flex items-center justify-center"><BookOpen className="w-16 h-16 text-[#C8A96A]/50" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 lg:to-transparent" />
                  <span className="absolute top-4 left-4 bg-[#C8A96A] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                </div>

                {/* Content */}
                <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit ${categoryColors[featured.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {categoryLabels[featured.category] ?? featured.category}
                  </span>
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#111111] mb-4 leading-snug group-hover:text-[#C8A96A] transition-colors duration-200">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                      {featured.readTime && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featured.readTime} min read
                          </span>
                        </>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[#C8A96A] text-sm font-bold group-hover:gap-2.5 transition-all duration-200">
                      Read article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#111111]">
            All Articles
          </h2>
          <span className="text-sm text-gray-400">{rest.length} articles</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article
                className="bg-white rounded-2xl border border-gray-100/80 shadow-premium hover:shadow-premium-hover card-interactive overflow-hidden h-full flex flex-col animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
              >
                {/* Cover image */}
                <div className="relative h-44 overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F5ECD7] to-[#FDF6E9] flex items-center justify-center"><BookOpen className="w-10 h-10 text-[#C8A96A]/50" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {categoryLabels[post.category] ?? post.category}
                    </span>
                    <span className="issue-number">№ {String(i + 2).padStart(2, '0')}</span>
                  </div>

                  <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#111111] mb-2 leading-snug group-hover:text-[#C8A96A] transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      {post.readTime && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {post.readTime}m
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[#C8A96A] text-[11px] font-bold group-hover:underline flex items-center gap-0.5">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <Flower2 className="w-4 h-4 text-[#C8A96A]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Stay in the loop</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-white mb-4">
            Get articles delivered to your inbox
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-md mx-auto">
            Weekly vendor spotlights, planning guides, and exclusive deals for South Asian clients in the GTA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/subscribe"
              className="btn-primary inline-flex items-center justify-center gap-2 bg-[#C8A96A] text-white font-bold px-8 py-3.5 rounded-full shadow-saffron text-sm"
            >
              Subscribe Free →
            </Link>
            <Link
              href="/vendors"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 font-semibold px-8 py-3.5 rounded-full text-sm hover:bg-white/5 transition-colors"
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
