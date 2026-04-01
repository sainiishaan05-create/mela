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

// GET — list all saved vendors for current user
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await service()
    .from('saved_vendors')
    .select('*, vendor:vendors(*, category:categories(*), city:cities(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: data ?? [] })
}

// POST — save a vendor { vendorId }
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorId } = await req.json()
  if (!vendorId) return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 })

  const { error } = await service()
    .from('saved_vendors')
    .upsert({ user_id: user.id, vendor_id: vendorId }, { onConflict: 'user_id,vendor_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — unsave a vendor { vendorId }
export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorId } = await req.json()
  if (!vendorId) return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 })

  const { error } = await service()
    .from('saved_vendors')
    .delete()
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
