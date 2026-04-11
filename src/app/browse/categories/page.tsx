import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import NewsletterSignup from '@/components/ui/NewsletterSignup'

export const metadata: Metadata = {
  title: 'Browse by Category | Melaa | Wedding & Event Vendors Ontario',
  description:
    'Explore every South Asian wedding vendor category on Melaa . Photographers, caterers, decorators, DJs, content creators, bridal wear, and more across the GTA.',
}

interface CategoryRow {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
}

export default async function BrowseCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, icon, description')
    .order('name')

  // Get vendor counts per category so each tile shows "42 vendors"
  const { data: vendorRows } = await supabase
    .from('vendors')
    .select('category_id')
    .eq('is_active', true)

  const countByCategory: Record<string, number> = {}
  for (const v of vendorRows ?? []) {
    if (!v.category_id) continue
    countByCategory[v.category_id] = (countByCategory[v.category_id] ?? 0) + 1
  }

  const list = (categories ?? []) as CategoryRow[]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="py-16 px-4 sm:px-6 text-center border-b"
        style={{ borderColor: 'var(--color-taupe)', background: 'white' }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-gold-dark)' }}
          >
            Every category
          </p>
          <h1
            className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            Browse by Category
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#8A7B74' }}>
            {list.length} vendor categories covering every part of a South Asian wedding,
            from the mehndi to the baraat to the reception dance floor.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center gap-3 mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-gold-dark)' }}
          >
            All categories
          </p>
          <div className="flex-1 h-px" style={{ background: 'var(--color-taupe)' }} />
          <p className="text-xs font-medium" style={{ color: '#8A7B74' }}>
            {list.length}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((cat) => {
            const count = countByCategory[cat.id] ?? 0
            return (
              <Link
                key={cat.slug}
                href={`/vendors?category=${cat.slug}`}
                className="group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 hover:border-[#C8A96A]/50 hover:shadow-sm"
                style={{
                  borderColor: 'var(--color-taupe)',
                  background: 'white',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: 'rgba(200,169,106,0.08)',
                    border: '1px solid rgba(200,169,106,0.18)',
                  }}
                >
                  {cat.icon ?? '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm leading-tight"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8A7B74' }}>
                    {count === 0
                      ? 'Coming soon'
                      : `${count} vendor${count === 1 ? '' : 's'}`}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-gold-dark)' }}
                />
              </Link>
            )
          })}
        </div>

        {/* Newsletter */}
        <div className="mt-16">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  )
}
