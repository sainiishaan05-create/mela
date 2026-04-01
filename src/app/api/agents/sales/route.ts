/**
 * SALES AGENT
 * Role: Track conversion signals and log data — NO outbound marketing emails to vendors.
 * Marketing emails are disabled by policy. Only lead notifications and admin reports are sent.
 * Schedule: Every Tuesday + Friday 9am UTC
 *
 * Tasks (data/logging only — no vendor emails):
 * 1. Score free vendors and log conversion signals to DB
 * 2. Identify sleeping vendors (joined >14 days, zero leads) — log only
 * 3. Log 3-month Basic subscribers as annual plan candidates — log only
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

async function logAction(agent: string, action: string) {
  await supabase.from('agent_logs').insert({ agent, action })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (!process.env.AGENT_SECRET || searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  // ── Task 1: Fetch free vendors for scoring (no emails sent) ─────────────────
  const { data: freeVendors } = await supabase
    .from('vendors')
    .select('id, name, email, slug, phone, website, instagram, description, category:categories(name), city:cities(name), created_at')
    .eq('tier', 'free')
    .eq('is_active', true)

  // ── Task 2: Score free vendors — log signals to DB only, no emails ────────
  const { data: allLeads } = await supabase
    .from('leads')
    .select('vendor_id, is_read, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  type ScoredVendor = {
    id: string; name: string; email: string; slug: string;
    phone?: string; website?: string; instagram?: string; description?: string;
    category?: { name: string } | null; city?: { name: string } | null;
    created_at: string; score: number; leadCount: number;
  }

  const scored: ScoredVendor[] = (freeVendors ?? []).map(v => {
    const vendorLeads = (allLeads ?? []).filter(l => l.vendor_id === v.id)
    const leadCount = vendorLeads.length
    const readRate = leadCount > 0 ? vendorLeads.filter(l => l.is_read).length / leadCount : 0
    const profileScore = [v.phone, v.website, v.instagram, v.description].filter(Boolean).length * 10
    const ageScore = Math.max(0, 30 - Math.floor((Date.now() - new Date(v.created_at).getTime()) / (24 * 60 * 60 * 1000)))
    const score = (leadCount * 20) + (readRate * 30) + profileScore + ageScore
    return { ...(v as unknown as ScoredVendor), score, leadCount }
  }).sort((a, b) => b.score - a.score)

  // Log top 5 scored vendors to DB — no emails sent
  const hot = scored.slice(0, 5)
  for (const vendor of hot) {
    if (vendor.leadCount === 0) continue
    await logAction('sales', `hot_signal:${vendor.name}(score:${Math.round(vendor.score)})`)
    results.push(`scored:${vendor.name}(score:${Math.round(vendor.score)})`)
  }

  // ── Task 3: Log sleeping vendors (joined >14 days, zero leads) — no emails ─
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: sleeping } = await supabase
    .from('vendors')
    .select('id, name')
    .eq('tier', 'free')
    .eq('is_active', true)
    .lte('created_at', fourteenDaysAgo)

  const vendorsWithLeads = new Set((allLeads ?? []).map(l => l.vendor_id))
  const sleepingVendors = (sleeping ?? []).filter(v => !vendorsWithLeads.has(v.id))

  if (sleepingVendors.length > 0) {
    await logAction('sales', `sleeping_vendors:${sleepingVendors.length}`)
    results.push(`sleeping_logged:${sleepingVendors.length}`)
  }

  // ── Task 4: Log 3-month Basic subscribers as annual plan candidates — no emails
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: basicVendors } = await supabase
    .from('vendors')
    .select('name')
    .eq('tier', 'basic')
    .lte('created_at', threeMonthsAgo)
    .limit(10)

  if ((basicVendors ?? []).length > 0) {
    await logAction('sales', `annual_candidates:${(basicVendors ?? []).length}`)
    results.push(`annual_candidates_logged:${(basicVendors ?? []).length}`)
  }

  return NextResponse.json({ ok: true, agent: 'sales', tasks: results, ran_at: now.toISOString() })
}
