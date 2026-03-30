import Link from 'next/link'
import type { Vendor } from '@/types'
import { MapPin, BadgeCheck, Star, Globe, ArrowUpRight } from 'lucide-react'

interface VendorCardProps {
  vendor: Vendor
}

function getRealRating(vendor: Vendor): number | null {
  const r = (vendor as any).rating
  return r ? Number(r) : null
}
function getRealReviewCount(vendor: Vendor): number | null {
  const rc = (vendor as any).review_count
  return rc && Number(rc) > 0 ? Number(rc) : null
}

const TIER_CONFIG: Record<string, { label: string } | null> = {
  premium: { label: 'Premium' },
  basic:   { label: 'Verified' },
  free:    null,
}

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  '📸': 'from-stone-50 to-stone-100',
  '🎬': 'from-slate-50 to-stone-100',
  '🍽️': 'from-amber-50 to-stone-100',
  '🎵': 'from-stone-50 to-slate-100',
  '💄': 'from-rose-50 to-stone-100',
  '🌿': 'from-green-50 to-stone-50',
  '💐': 'from-pink-50 to-stone-50',
  '👗': 'from-stone-50 to-neutral-100',
  '💎': 'from-stone-50 to-[#FDF6E9]',
  '🏛️': 'from-neutral-50 to-stone-100',
}

function getGradient(icon?: string): string {
  if (icon && PLACEHOLDER_GRADIENTS[icon]) return PLACEHOLDER_GRADIENTS[icon]
  return 'from-stone-50 to-neutral-100'
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const tierConfig = TIER_CONFIG[vendor.tier] ?? null
  const rating = getRealRating(vendor)
  const reviews = getRealReviewCount(vendor)
  const hasRating = rating !== null && reviews !== null
  const coverImage =
    (vendor.portfolio_images && vendor.portfolio_images.length > 0)
      ? vendor.portfolio_images[0]
      : ((vendor as any).cover_image as string | undefined)
  const icon = vendor.category?.icon ?? undefined
  const gradient = getGradient(icon)

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="block group h-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
      style={{ '--tw-ring-color': 'var(--color-gold)' } as React.CSSProperties}
    >
      <article
        className="card-luxury rounded-2xl border overflow-hidden h-full flex flex-col"
        style={{
          background: 'white',
          borderColor: 'var(--color-taupe)',
        }}
      >
        {/* ── Image / Placeholder ── */}
        <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={vendor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                {icon ?? '🏪'}
              </div>
              <span className="relative z-10 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-taupe)' }}>
                No photos yet
              </span>
            </div>
          )}

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {vendor.is_featured && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{
                  background: 'var(--color-gold)',
                  color: 'var(--color-text)',
                }}
              >
                Featured
              </span>
            )}
            {tierConfig && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  background: 'rgba(247,245,242,0.92)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-taupe)',
                }}
              >
                {tierConfig.label}
              </span>
            )}
          </div>

          {/* Verified badge */}
          {vendor.is_verified && (
            <div
              className="absolute top-3 right-3 rounded-full p-1.5"
              style={{ background: 'rgba(247,245,242,0.92)' }}
              title="Verified vendor"
            >
              <BadgeCheck className="w-4 h-4" style={{ color: 'var(--color-gold-dark)' }} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-5 flex flex-col flex-1 gap-1.5">

          {/* Category */}
          {vendor.category && (
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              {vendor.category.name}
            </p>
          )}

          {/* Name */}
          <h3
            className="font-[family-name:var(--font-playfair)] font-bold text-base leading-snug line-clamp-1 transition-colors duration-200 group-hover:opacity-70"
            style={{ color: 'var(--color-text)' }}
          >
            {vendor.name}
          </h3>

          {/* Rating OR new badge */}
          {hasRating ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-3 h-3 fill-current ${i <= Math.round(rating!) ? '' : 'opacity-20'}`}
                    style={{ color: 'var(--color-gold)' }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                {rating!.toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--color-taupe)' }}>
                ({reviews})
              </span>
            </div>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit"
              style={{
                color: 'var(--color-gold-dark)',
                borderColor: 'var(--color-gold)',
                background: 'var(--color-gold-light)',
              }}
            >
              <span className="w-1 h-1 rounded-full animate-pulse-soft" style={{ background: 'var(--color-gold)' }} />
              New Vendor
            </span>
          )}

          {/* Location */}
          {vendor.city && (
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-taupe)' }}>
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{vendor.city.name}, ON</span>
            </div>
          )}

          {/* Description */}
          {vendor.description && (
            <p className="text-[11.5px] line-clamp-2 flex-1 leading-relaxed mt-0.5" style={{ color: '#8A7B74' }}>
              {vendor.description}
            </p>
          )}

          {/* Footer */}
          <div
            className="mt-auto pt-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--color-section)' }}
          >
            <span
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold group-hover:gap-2 transition-all duration-200"
              style={{ color: 'var(--color-gold-dark)' }}
            >
              View Profile
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </span>
            {vendor.website && (
              <span
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-colors duration-150"
                style={{
                  color: 'var(--color-taupe)',
                  borderColor: 'var(--color-section)',
                  background: 'var(--color-bg)',
                }}
              >
                <Globe className="w-3 h-3" /> Website
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
