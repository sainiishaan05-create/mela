import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSSRClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const BUCKET = 'vendor-images'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const ssrClient = await createSSRClient()
    const { data: { user } } = await ssrClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const vendorId = form.get('vendorId') as string | null

    if (!file || !vendorId) {
      return NextResponse.json({ error: 'Missing file or vendorId' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG and WebP images are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 5 MB.' }, { status: 400 })
    }

    const service = getServiceClient()

    const { data: vendor } = await service
      .from('vendors')
      .select('id, claimed_by_user_id')
      .eq('id', vendorId)
      .single()

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    if (vendor.claimed_by_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '31536000',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: publicUrl })

  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
