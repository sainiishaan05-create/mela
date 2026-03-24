import dotenv from 'dotenv'
dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname })

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
})

async function main() {
  console.log('Creating Stripe products and prices...\n')

  // Basic — $99/month
  const basicProduct = await stripe.products.create({
    name: 'Mela Basic',
  })

  const basicPrice = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 9900,
    currency: 'cad',
    recurring: { interval: 'month' },
  })

  // Premium — $249/month
  const premiumProduct = await stripe.products.create({
    name: 'Mela Premium',
  })

  const premiumPrice = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 24900,
    currency: 'cad',
    recurring: { interval: 'month' },
  })

  console.log('Done. Copy these price IDs into src/lib/stripe/index.ts:\n')
  console.log(`BASIC_PRICE_ID:   ${basicPrice.id}`)
  console.log(`PREMIUM_PRICE_ID: ${premiumPrice.id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
