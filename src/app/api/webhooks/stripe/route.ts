/**
 * Stripe webhook endpoint — canonical URL: /api/webhooks/stripe
 * This is the URL configured in the Stripe Dashboard.
 * Re-exports the handler from /api/stripe/webhook for backwards compatibility.
 */
export const dynamic = 'force-dynamic'
export { POST } from '@/app/api/stripe/webhook/route'
