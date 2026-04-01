import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'

// Founding Member offer: 90-day free trial as advertised on pricing/list-your-business pages
const TRIAL_DAYS = 90

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, vendorId, userId } = (await req.json()) as { plan: PlanKey; vendorId: string; userId?: string }

    // Verify the vendor belongs to the authenticated user
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, claimed_by_user_id')
      .eq('id', vendorId)
      .single()

    if (!vendor || vendor.claimed_by_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const selectedPlan = PLANS[plan]
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      // 90-day free trial — matches the "First 90 days free" promise on the site
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { vendorId, plan },
      },
      metadata: {
        vendorId,
        plan,
        ...(userId ? { userId } : {}),
        flow: 'vendor_upgrade',
      },
      // Collect card upfront but don't charge until trial ends
      payment_method_collection: 'if_required',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
