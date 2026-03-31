import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// POST /api/vendors/upload-photo
// Accepts: multipart/form-data with fields: file (File), vendorId (string)
// Uses service role to bypass storage RLS — auth check is done here instead
export async function POST(req: NextRequest) {
  try {
    // Verify auth session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const vendorId = formData.get('vendorId') as string | null

    if (!file || !vendorId) {
      return NextResponse.json({ error: 'Missing file or vendorId' }, { status: 400 })
    }

    // Verify the vendor belongs to the authenticated user
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, claimed_by_user_id')
      .eq('id', vendorId)
      .single()

    if (!vendor || vendor.claimed_by_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max 5MB.` }, { status: 400 })
    }

    // Type check
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed.' }, { status: 400 })
    }

    // Upload using service role key (bypasses RLS)
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const bytes = await file.arrayBuffer()
    const { data, error } = await serviceClient.storage
      .from('vendor-images')
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }

    const { data: { publicUrl } } = serviceClient.storage
      .from('vendor-images')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Upload photo error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
