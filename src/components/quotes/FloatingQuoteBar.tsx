'use client'

import { useQuoteSelection } from './QuoteSelectionProvider'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'

export default function FloatingQuoteBar() {
  const { selected, clear, count } = useQuoteSelection()

  if (count === 0) return null

  const names = [...selected.values()].map(v => v.name)

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 animate-slide-up"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-[#111111] rounded-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.25)] px-5 py-4 flex items-center gap-3">
          {/* Vendor names (desktop) / count (mobile) */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              {count} vendor{count !== 1 ? 's' : ''} selected
            </p>
            <p className="text-gray-400 text-xs truncate hidden sm:block">
              {names.join(', ')}
            </p>
          </div>

          {/* Clear */}
          <button
            type="button"
            onClick={clear}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Get Quotes */}
          <Link
            href="/quote-request"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8A96A] text-white text-sm font-bold shadow-saffron hover:opacity-90 transition-opacity shrink-0"
          >
            Get Quotes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
