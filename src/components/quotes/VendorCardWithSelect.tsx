'use client'

import { useQuoteSelection } from './QuoteSelectionProvider'
import VendorCard from '@/components/vendors/VendorCard'
import { Check } from 'lucide-react'
import type { Vendor } from '@/types'

export default function VendorCardWithSelect({ vendor }: { vendor: Vendor }) {
  const { isSelected, toggle, count } = useQuoteSelection()
  const checked = isSelected(vendor.id)
  const disabled = !checked && count >= 3

  // Only show checkboxes when user has started selecting (count > 0)
  // or on hover (desktop). This prevents confusing first-time visitors
  // with unexplained checkboxes on every card.
  const showCheckbox = count > 0

  return (
    <div className="relative group/select">
      <VendorCard vendor={vendor} />

      {/* Checkbox — visible on hover (desktop) or when selecting is active */}
      <button
        type="button"
        aria-label={checked ? `Remove ${vendor.name} from quote request` : `Add ${vendor.name} to quote request`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggle({
            id: vendor.id,
            name: vendor.name,
            slug: vendor.slug,
            categoryName: vendor.category?.name,
          })
        }}
        disabled={disabled}
        className={`
          absolute top-3 left-3 z-10
          w-7 h-7 rounded-lg border-2 flex items-center justify-center
          transition-all duration-150
          ${showCheckbox || checked
            ? 'opacity-100'
            : 'opacity-0 group-hover/select:opacity-100'
          }
          ${checked
            ? 'bg-[#C8A96A] border-[#C8A96A] text-white shadow-saffron'
            : disabled
              ? 'bg-white/60 border-gray-300 cursor-not-allowed opacity-50'
              : 'bg-white/90 border-gray-300 hover:border-[#C8A96A] hover:bg-[#C8A96A]/10'
          }
        `}
      >
        {checked && <Check className="w-4 h-4" />}
      </button>
    </div>
  )
}
