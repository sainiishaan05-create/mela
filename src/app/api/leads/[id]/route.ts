import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/leads/[id] — mark lead as read (must own the vendor the lead belongs to)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get lead + verify vendor ownership
  const { data: lead } = await supabase
    .from('leads')
    .select('id, vendor_id')
    .eq('id', id)
    .single()

  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: vendor } = await supabase
    .from('vendors')
    .select('claimed_by_user_id')
    .eq('id', lead.vendor_id)
    .single()

  if (!vendor || vendor.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase.from('leads').update({ is_read: true }).eq('id', id)
  return NextResponse.json({ success: true })
}
