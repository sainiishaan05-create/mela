'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SelectedVendor {
  id: string
  name: string
  slug: string
  categoryName?: string
}

interface QuoteSelectionCtx {
  selected: Map<string, SelectedVendor>
  toggle: (v: SelectedVendor) => void
  clear: () => void
  isSelected: (id: string) => boolean
  count: number
}

const Ctx = createContext<QuoteSelectionCtx>({
  selected: new Map(),
  toggle: () => {},
  clear: () => {},
  isSelected: () => false,
  count: 0,
})

const MAX = 3

export function QuoteSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Map<string, SelectedVendor>>(new Map())

  const toggle = useCallback((v: SelectedVendor) => {
    setSelected(prev => {
      const next = new Map(prev)
      if (next.has(v.id)) {
        next.delete(v.id)
      } else if (next.size < MAX) {
        next.set(v.id, v)
      }
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Map()), [])
  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  return (
    <Ctx.Provider value={{ selected, toggle, clear, isSelected, count: selected.size }}>
      {children}
    </Ctx.Provider>
  )
}

export function useQuoteSelection() {
  return useContext(Ctx)
}
