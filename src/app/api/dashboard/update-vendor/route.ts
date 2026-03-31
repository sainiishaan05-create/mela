import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Verify authenticated session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { description, phone, website, instagram, category_id, city_id, portfolio_images } = body

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find vendor owned by this user
    const { data: vendor } = await admin
      .from('vendors')
      .select('id')
      .eq('claimed_by_user_id', user.id)
      .single()

    if (!vendor) return NextResponse.json({ error: 'No listing found for this account' }, { status: 404 })

    const { error } = await admin.from('vendors').update({
      description: description || null,
      phone: phone || null,
      website: website || null,
      instagram: instagram || null,
      category_id: category_id || null,
      city_id: city_id || null,
      portfolio_images: Array.isArray(portfolio_images) ? portfolio_images : [],
    }).eq('id', vendor.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Update vendor error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
