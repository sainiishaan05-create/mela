import Link from 'next/link'
import type { Vendor } from '@/types'
import { MapPin, Star, BadgeCheck } from 'lucide-react'

interface VendorCardProps {
  vendor: Vendor
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const tierBadge = {
    free: null,
    basic: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
    premium: { label: 'Premium', color: 'bg-amber-100 text-amber-700' },
  }[vendor.tier]

  return (
    <Link href={`/vendors/${vendor.slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8760A] transition-all overflow-hidden">
        {/* Image placeholder */}
        <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-5xl">
          {vendor.category?.icon ?? '🏪'}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-[#E8760A] transition-colors line-clamp-1">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {vendor.is_verified && (
                <BadgeCheck className="w-4 h-4 text-[#E8760A]" />
              )}
              {tierBadge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierBadge.color}`}>
                  {tierBadge.label}
                </span>
              )}
            </div>
          </div>

          {vendor.category && (
            <p className="text-sm text-[#E8760A] font-medium mb-1">{vendor.category.name}</p>
          )}

          {vendor.city && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {vendor.city.name}
            </div>
          )}

          {vendor.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{vendor.description}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
