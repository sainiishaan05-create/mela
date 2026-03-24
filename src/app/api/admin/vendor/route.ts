// Add ADMIN_EMAIL=your@email.com to .env.local

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Action = 'verify' | 'feature' | 'deactivate'

interface RequestBody {
  vendorId: string
  action: Action
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthenticated' },
      { status: 401 }
    )
  }

  if (user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Parse body
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { vendorId, action } = body

  if (!vendorId || typeof vendorId !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid vendorId' },
      { status: 400 }
    )
  }

  if (!['verify', 'feature', 'deactivate'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  }

  // Build update payload
  const updates: { is_verified?: boolean; is_featured?: boolean; is_active?: boolean } = {}

  if (action === 'verify') updates.is_verified = true
  if (action === 'feature') updates.is_featured = true
  if (action === 'deactivate') updates.is_active = false

  const { error: updateError } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', vendorId)

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
