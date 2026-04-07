// Central site stats helper — all pages should use this for live vendor/category/city counts.
// Never hardcode these numbers. They change as vendors sign up, leads are created, etc.
import { createClient } from '@/lib/supabase/server'

export interface SiteStats {
  vendorCount: number            // total active vendors
  vendorCountDisplay: string     // e.g. "680" or "1,234"
  categoryCount: number          // total active categories (we use 14)
  cityCount: number              // total active cities (we use 8+)
  vendorCountWithPlus: string    // e.g. "680+"
  leadCount: number              // total leads ever created
  reviewCount: number            // total reviews ever created
}

// Cache stats for 60s to avoid hammering the DB on every page render
let cached: { at: number; data: SiteStats } | null = null
const TTL = 60_000

export async function getSiteStats(): Promise<SiteStats> {
  if (cached && Date.now() - cached.at < TTL) return cached.data

  const supabase = await createClient()

  const safeCount = async (table: string): Promise<number> => {
    try {
      const res = await supabase.from(table).select('*', { count: 'exact', head: true })
      return res.count ?? 0
    } catch { return 0 }
  }

  const [
    { count: vendorCount },
    { count: categoryCount },
    { count: cityCount },
    leadCount,
    reviewCount,
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('cities').select('*', { count: 'exact', head: true }),
    safeCount('leads'),
    safeCount('reviews'),
  ])

  const v = vendorCount ?? 0
  const data: SiteStats = {
    vendorCount: v,
    vendorCountDisplay: v.toLocaleString(),
    vendorCountWithPlus: `${v.toLocaleString()}+`,
    categoryCount: categoryCount ?? 0,
    cityCount: cityCount ?? 0,
    leadCount,
    reviewCount,
  }

  cached = { at: Date.now(), data }
  return data
}

// Narrower helper when you only need the vendor count
export async function getVendorCount(): Promise<number> {
  return (await getSiteStats()).vendorCount
}
