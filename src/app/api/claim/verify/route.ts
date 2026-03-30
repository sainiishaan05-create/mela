import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, PLANS } from '@/lib/stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/claim?error=missing_token`)
  }

  const supabase = getServiceClient()

  // 1. Look up vendor by claim_token
  const { data: vendor, error: lookupError } = await supabase
    .from('vendors')
    .select('id, name, slug, claim_email, claim_token, claim_token_expires_at')
    .eq('claim_token', token)
    .single()

  if (lookupError || !vendor) {
    return NextResponse.redirect(`${siteUrl}/claim?error=invalid_token`)
  }

  // 2. Check token expiry
  const expiresAt = vendor.claim_token_expires_at
    ? new Date(vendor.claim_token_expires_at)
    : null

  if (!expiresAt || expiresAt < new Date()) {
    return NextResponse.redirect(`${siteUrl}/claim/${vendor.slug}?error=token_expired`)
  }

  // 3. Create or retrieve Supabase Auth user using claimant email (not vendor.email which may be null)
  const claimEmail = vendor.claim_email
  if (!claimEmail) {
    return NextResponse.redirect(`${siteUrl}/claim/${vendor.slug}?error=missing_claim_email`)
  }

  const { data: listData } = await supabase.auth.admin.listUsers()
  const existingUser = listData?.users?.find((u) => u.email === claimEmail)
  let userId: string

  if (existingUser) {
    userId = existingUser.id
  } else {
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: claimEmail,
      email_confirm: true,
    })
    if (createError || !createdUser?.user) {
      console.error('Auth user create error:', createError)
      return NextResponse.redirect(`${siteUrl}/claim/${vendor.slug}?error=auth_failed`)
    }
    userId = createdUser.user.id
  }

  // 4. Create Stripe checkout session
  const foundingPriceId =
    process.env.STRIPE_FOUNDING_PRICE_ID ?? PLANS.basic.priceId

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: foundingPriceId, quantity: 1 }],
      metadata: {
        vendorId: vendor.id,
        userId,
        flow: 'claim',
        plan: 'basic',
      },
      success_url: `${siteUrl}/dashboard?claimed=1`,
      cancel_url: `${siteUrl}/claim/${vendor.slug}`,
    })

    // 5. Redirect to Stripe checkout
    return NextResponse.redirect(session.url!)
  } catch (err) {
    console.error('Stripe session error:', err)
    return NextResponse.redirect(`${siteUrl}/claim/${vendor.slug}?error=checkout_failed`)
  }
}
