import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const PLANS = {
  basic: { name: 'Basic', price: 9900, priceId: 'price_1TETtdQbR0KbHqJRgoBpb5w7' },
  premium: { name: 'Premium', price: 24900, priceId: 'price_1TETtdQbR0KbHqJRTIIBB7aW' },
}

export type PlanKey = keyof typeof PLANS
