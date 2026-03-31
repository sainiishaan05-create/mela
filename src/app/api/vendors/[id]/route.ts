import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// PATCH /api/vendors/[id] — update vendor profile (auth required, must own listing)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, claimed_by_user_id')
    .eq('id', id)
    .single()

  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (vendor.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // Only allow safe fields to be updated
  const ALLOWED = ['name', 'phone', 'description', 'website', 'instagram', 'portfolio_images']
  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key] ?? null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase.from('vendors').update(updates).eq('id', id)
  if (error) {
    console.error('Vendor update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// PATCH /api/vendors/[id]/read-lead — mark lead as read (handled separately via leads route)
// DELETE /api/vendors/[id] — deactivate listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, claimed_by_user_id')
    .eq('id', id)
    .single()

  if (!vendor || vendor.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase.from('vendors').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
