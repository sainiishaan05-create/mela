import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const vendorId = session.metadata?.vendorId
      const plan = session.metadata?.plan
      const flow = session.metadata?.flow
      const userId = session.metadata?.userId

      if (vendorId && plan) {
        await supabase
          .from('vendors')
          .update({ tier: plan })
          .eq('id', vendorId)
      }

      // If this is a claim flow, mark listing as claimed
      if (flow === 'claim' && vendorId) {
        const serviceClient = getServiceClient()
        await serviceClient
          .from('vendors')
          .update({
            claim_status: 'claimed',
            claimed: true,
            ...(userId ? { claimed_by_user_id: userId } : {}),
          })
          .eq('id', vendorId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const vendorId = subscription.metadata?.vendorId

      if (vendorId) {
        await supabase
          .from('vendors')
          .update({ tier: 'free' })
          .eq('id', vendorId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
