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

const TIER_CONFIG: Record<string, { label: string; classes: string } | null> = {
  premium: { label: '⭐ Premium', classes: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/80' },
  basic:   { label: '✓ Verified', classes: 'bg-blue-50 text-blue-600 border border-blue-100' },
  free:    null,
}

// Soft gradient palettes per category icon
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  '📸': 'from-rose-50 via-pink-50 to-fuchsia-50',
  '🎬': 'from-violet-50 via-purple-50 to-indigo-50',
  '🍽️': 'from-amber-50 via-yellow-50 to-orange-50',
  '🎵': 'from-blue-50 via-cyan-50 to-sky-50',
  '💄': 'from-pink-50 via-rose-50 to-red-50',
  '🌿': 'from-green-50 via-emerald-50 to-teal-50',
  '💐': 'from-fuchsia-50 via-pink-50 to-rose-50',
  '👗': 'from-purple-50 via-violet-50 to-indigo-50',
  '💎': 'from-yellow-50 via-amber-50 to-orange-50',
  '🏛️': 'from-stone-50 via-slate-50 to-gray-50',
}

function getGradient(icon?: string): string {
  if (icon && PLACEHOLDER_GRADIENTS[icon]) return PLACEHOLDER_GRADIENTS[icon]
  return 'from-orange-50 via-amber-50 to-rose-50'
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
    <Link href={`/vendors/${vendor.slug}`} className="block group h-full outline-none focus-visible:ring-2 focus-visible:ring-[#E8760A] focus-visible:ring-offset-2 rounded-2xl">
      <article className="bg-white rounded-2xl border border-gray-100/80 shadow-premium hover:shadow-premium-hover card-interactive overflow-hidden h-full flex flex-col">

        {/* ── Image / Placeholder ── */}
        <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${gradient}`}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={vendor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-orange-100/60 absolute" />
                <div className="w-20 h-20 rounded-full border border-orange-100/80 absolute" />
              </div>
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                {icon ?? '🏪'}
              </div>
              <span className="relative z-10 text-[10px] font-semibold tracking-widest uppercase text-gray-300 select-none">
                No photos yet
              </span>
            </div>
          )}

          {/* Gradient overlay at bottom for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {vendor.is_featured && (
              <span className="bg-[#E8760A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-saffron">
                Featured
              </span>
            )}
            {tierConfig && (
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${tierConfig.classes}`}>
                {tierConfig.label}
              </span>
            )}
          </div>

          {/* Verified badge */}
          {vendor.is_verified && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-sm" title="Verified vendor">
              <BadgeCheck className="w-4 h-4 text-[#E8760A]" />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex flex-col flex-1 gap-1.5">

          {/* Category */}
          {vendor.category && (
            <p className="text-[10px] font-bold text-[#E8760A]/80 uppercase tracking-widest">
              {vendor.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-[family-name:var(--font-playfair)] font-bold text-[15px] leading-snug text-gray-900 group-hover:text-[#E8760A] transition-colors duration-200 line-clamp-1">
            {vendor.name}
          </h3>

          {/* Rating OR new badge */}
          {hasRating ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i <= Math.round(rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{rating!.toFixed(1)}</span>
              <span className="text-[11px] text-gray-400">({reviews})</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse-soft" />
              New Vendor
            </span>
          )}

          {/* Location */}
          {vendor.city && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{vendor.city.name}, ON</span>
            </div>
          )}

          {/* Description */}
          {vendor.description && (
            <p className="text-[11.5px] text-gray-500 line-clamp-2 flex-1 leading-relaxed mt-0.5">
              {vendor.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#E8760A] group-hover:gap-2 transition-all duration-200">
              View Profile
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </span>
            {vendor.website && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors duration-150">
                <Globe className="w-3 h-3" /> Website
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
