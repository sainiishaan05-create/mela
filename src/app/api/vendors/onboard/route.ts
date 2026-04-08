/**
 * POST /api/vendors/onboard
 *
 * Session-aware vendor onboarding endpoint. Creates a vendor record linked
 * to the currently authenticated user (from their Supabase session) — so it
 * never tries to create a duplicate auth account.
 *
 * This fixes the specific bug where a vendor signs in with Google, then fills
 * out the VendorSignupForm and gets "email already exists" because /api/vendors
 * attempts supabase.auth.admin.createUser() with an email that's already linked
 * to their existing OAuth identity.
 *
 * Flow:
 * 1. Read the logged-in user from the server Supabase client (cookie-based)
 * 2. If no session → 401
 * 3. If the user already owns a vendor → 409 (with slug for friendly redirect)
 * 4. Else insert a new vendor row with claimed_by_user_id = user.id
 */
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import slugify from 'slugify'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { rateLimit, clientIp, prune } from '@/lib/security'

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: Request) {
  try {
    // Rate limit: 3 onboarding attempts per 10 min per IP
    prune()
    if (!rateLimit(`vendor-onboard:${clientIp(req)}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // Verify session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, category_id, city_id } = body

    if (!name || !category_id || !city_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (String(name).length > 120) {
      return NextResponse.json({ error: 'Business name too long.' }, { status: 400 })
    }

    const svc = admin()

    // Already own a vendor?
    const { data: existing } = await svc
      .from('vendors')
      .select('id, slug')
      .eq('claimed_by_user_id', user.id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json(
        { error: 'You already have a listing.', slug: existing.slug, redirect: '/dashboard' },
        { status: 409 }
      )
    }

    // Another vendor already claimed this email? (defensive — shouldn't happen post-auth)
    const { data: emailTaken } = await svc
      .from('vendors')
      .select('id, claimed_by_user_id')
      .eq('email', user.email)
      .maybeSingle()
    if (emailTaken && emailTaken.claimed_by_user_id && emailTaken.claimed_by_user_id !== user.id) {
      return NextResponse.json(
        { error: 'This email is linked to another vendor. Contact support.' },
        { status: 409 }
      )
    }

    // If there's an unclaimed scraped vendor for this email, claim it
    if (emailTaken && !emailTaken.claimed_by_user_id) {
      const { error: claimErr } = await svc
        .from('vendors')
        .update({
          claimed_by_user_id: user.id,
          claim_status: 'claimed',
          name, // let them update their business name at onboarding
          category_id,
          city_id,
        })
        .eq('id', emailTaken.id)

      if (claimErr) throw claimErr

      const { data: claimed } = await svc
        .from('vendors')
        .select('slug')
        .eq('id', emailTaken.id)
        .single()

      return NextResponse.json({ success: true, slug: claimed?.slug, claimed: true })
    }

    // Create a brand-new vendor owned by the authed user
    let slug = slugify(name, { lower: true, strict: true })
    const { data: slugExists } = await svc.from('vendors').select('id').eq('slug', slug).maybeSingle()
    if (slugExists) slug = `${slug}-${Date.now()}`

    // AI description (best-effort)
    let description = ''
    try {
      const { data: cat } = await svc.from('categories').select('name').eq('id', category_id).maybeSingle()
      const { data: city } = await svc.from('cities').select('name').eq('id', city_id).maybeSingle()
      if (cat?.name && city?.name) {
        const aiRes = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Write a warm, professional 2-sentence business description for a South Asian wedding ${cat.name} called "${name}" based in ${city.name}, GTA. Make it inviting and culturally authentic.`,
          }],
        })
        description = (aiRes.content[0] as { type: string; text: string }).text
      }
    } catch {
      // optional
    }

    const { error: insertErr } = await svc.from('vendors').insert({
      slug,
      name,
      email: user.email,
      category_id,
      city_id,
      description: description || null,
      tier: 'free',
      is_active: true,
      is_verified: false,
      is_featured: false,
      portfolio_images: [],
      claimed_by_user_id: user.id,
      claim_status: 'claimed',
    })

    if (insertErr) throw insertErr

    // Welcome email (best-effort)
    if (user.email) {
      try {
        await resend.emails.send({
          from: 'Melaa <hello@melaa.ca>',
          to: user.email,
          subject: `Welcome to Melaa, ${name}! 🎉`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #C8A96A;">Welcome to Melaa!</h2>
              <p><strong>${name}</strong> is now live on Melaa. South Asian families across the GTA can now discover you.</p>
              <p>Your profile: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/vendors/${slug}">${process.env.NEXT_PUBLIC_SITE_URL}/vendors/${slug}</a></p>
              <p>Sign in at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">${process.env.NEXT_PUBLIC_SITE_URL}/dashboard</a> to complete your profile.</p>
              <p>— The Melaa Team</p>
            </div>
          `,
        })
      } catch (e) {
        console.warn('Welcome email failed:', e)
      }
    }

    return NextResponse.json({ success: true, slug })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Vendor onboard error:', message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
