import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const PLANS = {
  basic: { name: 'Basic', price: 9900, priceId: '' },   // $99/mo — fill priceId after creating in Stripe dashboard
  premium: { name: 'Premium', price: 24900, priceId: '' }, // $249/mo
}

export type PlanKey = keyof typeof PLANS
