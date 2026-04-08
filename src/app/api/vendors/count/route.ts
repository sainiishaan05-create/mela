import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vendors/count?category=...&city=...&badge=...&search=...
 *
 * Returns { count: number } — the number of vendors matching the given filters.
 * Used by the FilterSheet to display a live result count on the Apply button.
 *
 * Mirrors the same filter logic used by src/app/vendors/page.tsx (standard mode).
 * Geolocation mode is not supported here — the sheet never offers near-me filters.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const badge = searchParams.get('badge') ?? undefined
    const search = searchParams.get('search')?.trim().toLowerCase() ?? undefined

    const supabase = await createClient()

    // Resolve slugs to IDs (only if present)
    let categoryId: string | undefined
    if (category) {
      const { data } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .maybeSingle()
      categoryId = data?.id
    }

    let cityId: string | undefined
    if (city) {
      const { data } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', city)
        .maybeSingle()
      cityId = data?.id
    }

    let query = supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (cityId) query = query.eq('city_id', cityId)
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    if (badge === 'featured') query = query.eq('is_featured', true)
    if (badge === 'premium') query = query.eq('tier', 'premium')
    if (badge === 'verified') query = query.eq('is_verified', true)

    const { count, error } = await query
    if (error) return NextResponse.json({ count: 0 }, { status: 200 })

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
