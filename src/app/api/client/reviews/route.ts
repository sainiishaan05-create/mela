import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSSR } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function service() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getUser() {
  const supabase = await createSSR()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET /api/client/reviews?vendorId=xxx  — fetch reviews for a vendor (public)
//     /api/client/reviews               — fetch current user's reviews (auth required)
export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId')

  if (vendorId) {
    // Public: reviews for a specific vendor
    const { data, error } = await service()
      .from('reviews')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reviews: data ?? [] })
  }

  // Auth required: return the logged-in user's reviews
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await service()
    .from('reviews')
    .select('*, vendor:vendors(id, name, slug, category:categories(name, icon))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

// POST — submit a review { vendorId, rating, body, reviewerName }
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorId, rating, body, reviewerName } = await req.json()
  if (!vendorId || !rating || !reviewerName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // One review per user per vendor (upsert on user_id + vendor_id)
  const { error } = await service()
    .from('reviews')
    .upsert(
      { user_id: user.id, vendor_id: vendorId, rating, body: body ?? null, reviewer_name: reviewerName },
      { onConflict: 'user_id,vendor_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
