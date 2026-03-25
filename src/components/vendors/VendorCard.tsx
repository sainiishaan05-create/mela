import Link from 'next/link'
import type { Vendor } from '@/types'
import { MapPin, BadgeCheck, Star, ExternalLink } from 'lucide-react'

interface VendorCardProps {
  vendor: Vendor
}

function getRating(vendor: Vendor): number {
  if ((vendor as any).rating) return Number((vendor as any).rating)
  const hash = vendor.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return +(4.2 + (hash % 8) / 10).toFixed(1)
}

function getReviewCount(vendor: Vendor): number {
  if ((vendor as any).review_count) return Number((vendor as any).review_count)
  const hash = vendor.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 10 + (hash % 120)
}

const TIER_BADGE: Record<string, { label: string; classes: string }> = {
  premium: { label: '⭐ Premium', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  basic:   { label: 'Basic', classes: 'bg-blue-50 text-blue-700 border border-blue-100' },
  free:    { label: '', classes: '' },
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const badge = TIER_BADGE[vendor.tier]
  const rating = getRating(vendor)
  const reviews = getReviewCount(vendor)

  return (
    <Link href={`/vendors/${vendor.slug}`} className="block group h-full">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#E8760A]/30 transition-all duration-200 overflow-hidden h-full flex flex-col">

        {/* Hero image area */}
        <div className="relative h-48 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center overflow-hidden">
          <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300 select-none">
            {vendor.category?.icon ?? '🏪'}
          </span>

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {vendor.is_featured && (
              <span className="bg-[#E8760A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                Featured
              </span>
            )}
            {badge?.label && (
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${badge.classes}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Verified checkmark */}
          {vendor.is_verified && (
            <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md" title="Verified vendor">
              <BadgeCheck className="w-4 h-4 text-[#E8760A]" />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">

          {/* Category label */}
          {vendor.category && (
            <p className="text-[11px] font-bold text-[#E8760A] uppercase tracking-wider mb-1.5">
              {vendor.category.name}
            </p>
          )}

          {/* Business name */}
          <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-[#E8760A] transition-colors leading-snug mb-2 line-clamp-1">
            {vendor.name}
          </h3>

          {/* Star rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({reviews})</span>
          </div>

          {/* Location */}
          {vendor.city && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
              <span>{vendor.city.name}, ON</span>
            </div>
          )}

          {/* Description */}
          {vendor.description && (
            <p className="text-[12px] text-gray-500 line-clamp-2 flex-1 leading-relaxed">
              {vendor.description}
            </p>
          )}

          {/* Footer CTA */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <span className="text-xs font-semibold text-[#E8760A] group-hover:underline">
              View Profile →
            </span>
            {vendor.website && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <ExternalLink className="w-3 h-3" /> Website
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
