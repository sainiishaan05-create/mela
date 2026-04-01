import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

// TODO: STRIPE_FOUNDING_PRICE_ID must be added to Vercel env vars by the founder
//       Create a new $49/mo price in Stripe Dashboard and set STRIPE_FOUNDING_PRICE_ID=price_xxx
export const PLANS = {
  basic: {
    name: 'Basic Founding Rate',
    price: 4900,
    priceId: process.env.STRIPE_FOUNDING_PRICE_ID ?? 'price_1TETtdQbR0KbHqJRgoBpb5w7',
  },
  premium: { name: 'Premium', price: 24900, priceId: 'price_1TETtdQbR0KbHqJRTIIBB7aW' },
}

export type PlanKey = keyof typeof PLANS
