import Link from 'next/link'
import { X } from 'lucide-react'
import type { Category, City } from '@/types'

interface AppliedFilterChipsProps {
  categories: Category[]
  cities: City[]
  activeCategory?: string
  activeCity?: string
  activeSort?: string
  activeBadge?: string
  search?: string
}

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
}

const BADGE_LABELS: Record<string, string> = {
  featured: 'Featured',
  premium: 'Premium',
  verified: 'Verified',
}

/**
 * Server component. Renders a row of chips for every active filter.
 * Each chip is a plain Link — works without JS. Built to be used
 * above the vendor results grid on /vendors.
 */
export default function AppliedFilterChips({
  categories,
  cities,
  activeCategory,
  activeCity,
  activeSort,
  activeBadge,
  search,
}: AppliedFilterChipsProps) {
  const hasFilters = !!(activeCategory || activeCity || activeSort || activeBadge || search)
  if (!hasFilters) return null

  const categoryName = activeCategory
    ? categories.find(c => c.slug === activeCategory)?.name
    : undefined
  const cityName = activeCity
    ? cities.find(c => c.slug === activeCity)?.name
    : undefined

  // Build a href that drops ONE filter while keeping the others
  function hrefWithout(drop: 'category' | 'city' | 'sort' | 'badge' | 'search') {
    const params = new URLSearchParams()
    if (activeCategory && drop !== 'category') params.set('category', activeCategory)
    if (activeCity && drop !== 'city') params.set('city', activeCity)
    if (activeSort && drop !== 'sort') params.set('sort', activeSort)
    if (activeBadge && drop !== 'badge') params.set('badge', activeBadge)
    if (search && drop !== 'search') params.set('search', search)
    const qs = params.toString()
    return `/vendors${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mr-1">
          Active
        </span>

        {categoryName && (
          <Chip label={categoryName} href={hrefWithout('category')} />
        )}
        {cityName && (
          <Chip label={cityName} href={hrefWithout('city')} />
        )}
        {activeSort && SORT_LABELS[activeSort] && (
          <Chip label={SORT_LABELS[activeSort]} href={hrefWithout('sort')} />
        )}
        {activeBadge && BADGE_LABELS[activeBadge] && (
          <Chip label={BADGE_LABELS[activeBadge]} href={hrefWithout('badge')} />
        )}
        {search && (
          <Chip label={`“${search}”`} href={hrefWithout('search')} />
        )}

        <Link
          href="/vendors"
          className="ml-2 text-xs text-gray-500 hover:text-red-500 font-semibold underline underline-offset-2 transition-colors"
        >
          Clear all
        </Link>
      </div>
    </div>
  )
}

function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-[#C8A96A]/30 text-xs font-semibold text-[#8a7442] hover:bg-[#C8A96A]/5 hover:border-[#C8A96A]/60 transition-all"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <X className="w-3 h-3" />
    </Link>
  )
}
