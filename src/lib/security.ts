/**
 * Security helpers — HTML escaping + simple in-memory rate limiter.
 *
 * The rate limiter is per-instance (resets on cold start) but is good enough
 * to block casual spam and curl loops. For production-grade rate limiting at
 * scale, plug in Upstash Redis or Vercel KV.
 */

/** Escape HTML special characters to prevent XSS in email/html templates */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const buckets = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple sliding-window rate limiter. Returns true if allowed, false if blocked.
 *
 * @param key   Unique identifier for this bucket (usually IP + route).
 * @param max   Max requests per window.
 * @param windowMs  Window size in milliseconds.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= max) return false
  bucket.count++
  return true
}

/** Extract client IP from Next.js Request headers (works on Vercel). */
export function clientIp(req: Request): string {
  const h = req.headers
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    'unknown'
  )
}

/** Periodically prune old buckets to prevent unbounded memory growth. */
let lastPrune = 0
export function prune() {
  const now = Date.now()
  if (now - lastPrune < 60_000) return
  lastPrune = now
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k)
  }
}
