import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/blog'

type PageProps = {
  params: Promise<{ slug: string }>
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

const relatedCategoryLinks: Record<string, { label: string; href: string }> = {
  photographers: {
    label: 'South Asian Wedding Photographers',
    href: '/category/photographers',
  },
  videographers: {
    label: 'South Asian Wedding Videographers',
    href: '/category/videographers',
  },
  decorators: {
    label: 'South Asian Wedding Decorators',
    href: '/category/decorators',
  },
  catering: {
    label: 'South Asian Wedding Caterers',
    href: '/category/catering',
  },
  'djs-entertainment': {
    label: 'South Asian Wedding DJs',
    href: '/category/djs-entertainment',
  },
  'makeup-artists': {
    label: 'South Asian Bridal Makeup Artists',
    href: '/category/makeup-artists',
  },
  'mandap-rental': {
    label: 'Mandap Rental Vendors',
    href: '/category/mandap-rental',
  },
  'wedding-planners': {
    label: 'South Asian Wedding Planners',
    href: '/category/wedding-planners',
  },
  'bridal-wear': {
    label: 'South Asian Bridal Wear',
    href: '/category/bridal-wear',
  },
  'mehndi-artists': {
    label: 'Mehndi Artists',
    href: '/category/mehndi-artists',
  },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: 'Post Not Found | Melaa Blog',
    }
  }

  return {
    title: `${post.title} | Melaa Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const paragraphs = post.content.split('\n\n').filter(Boolean)
  const relatedCategory = relatedCategoryLinks[post.category]
  const categoryLabel = categoryLabels[post.category] ?? post.category

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="bg-[#FAFAF7] border-b border-gray-100 px-4 py-3"
      >
        <ol className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-[#C8A96A] transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-gray-300">
            /
          </li>
          <li>
            <Link
              href="/blog"
              className="hover:text-[#C8A96A] transition-colors"
            >
              Blog
            </Link>
          </li>
          <li aria-hidden="true" className="text-gray-300">
            /
          </li>
          <li
            className="text-[#1A1A1A] font-medium truncate max-w-[200px] sm:max-w-xs"
            aria-current="page"
          >
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-[#C8A96A]/20 text-[#C8A96A] text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">
              {categoryLabel}
            </span>
            {post.city && (
              <span className="text-gray-400 text-xs capitalize">
                {post.city.replace(/-/g, ' ')}
              </span>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <time dateTime={post.date} className="text-gray-400 text-sm">
            Published {formatDate(post.date)}
          </time>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[#1A1A1A] leading-[1.85] text-[1.0625rem] mb-6 font-[family-name:var(--font-inter)]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Related Category Link */}
          {relatedCategory && (
            <div className="mt-10 p-6 bg-[#FAFAF7] border border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">
                Related
              </p>
              <Link
                href={relatedCategory.href}
                className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#C8A96A] hover:underline"
              >
                Browse {relatedCategory.label} on Melaa →
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* CTA Banner */}
      <section className="bg-[#C8A96A] text-white py-14 px-4 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">
          Find {categoryLabel} vendors on Melaa
        </h2>
        <p className="text-[#F5ECD7] text-lg mb-8 max-w-xl mx-auto">
          Discover trusted South Asian wedding vendors across the GTA — verified,
          reviewed, and ready to make your celebration unforgettable.
        </p>
        <Link
          href="/vendors"
          className="bg-white text-[#C8A96A] font-bold px-8 py-4 rounded-full hover:bg-[#F5ECD7] transition-colors text-lg"
        >
          Browse All Vendors →
        </Link>
      </section>
    </>
  )
}
