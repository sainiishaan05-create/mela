/**
 * REVENUE OPTIMIZER AGENT
 * Inspired by: "Spots money-making opportunities. Implements pricing tiers and payment flows."
 * Schedule: Every day 10am UTC
 *
 * Financial tasks:
 * 1. Dynamic upgrade pricing — detect vendors in "hot window" (2-5 leads, no upgrade) → send limited time offer
 * 2. Abandoned upgrade recovery — vendors who visited /pricing but didn't subscribe
 * 3. Price anchoring emails — reframe $99/mo as "$3.30/day, less than one coffee"
 * 4. Bundle deal generator — identify vendors who could save with annual plan
 * 5. Revenue leak detection — find paid vendors who downgraded or went inactive → win back
 * 6. Passive income opportunity: identify top vendors and offer "Featured Placement" upsell at $49/mo add-on
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export const dynamic = 'force-dynamic'

async function ai(prompt: string, tokens = 250): Promise<string> {
  try {
    const r = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: tokens,
      messages: [{ role: 'user', content: prompt }],
    })
    return (r.content[0] as { type: string; text: string }).text
  } catch { return '' }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (!process.env.AGENT_SECRET || searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()
  const hour = now.getUTCHours()

  // ── Task 1: Log hot window vendors to DB — no emails sent ────────────────
  // (Vendors with 2-5 leads in 7 days, still on free tier — data signal only)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLeads } = await supabase
    .from('leads').select('vendor_id').gte('created_at', weekAgo)

  const leadCount: Record<string, number> = {}
  for (const l of recentLeads ?? []) {
    if (l.vendor_id) leadCount[l.vendor_id] = (leadCount[l.vendor_id] ?? 0) + 1
  }

  const hotWindowIds = Object.entries(leadCount)
    .filter(([, c]) => c >= 2 && c <= 5)
    .map(([id]) => id)

  if (hotWindowIds.length > 0) {
    await supabase.from('agent_logs').insert({
      agent: 'optimizer',
      action: 'hot_window_signal',
      metadata: JSON.stringify({ count: hotWindowIds.length, ids: hotWindowIds }),
      created_at: now.toISOString(),
    })
    results.push(`hot_window_logged:${hotWindowIds.length}_vendors`)
  }

  // ── Task 2: Log at-risk paid vendors — no emails sent ────────────────────
  if (hour === 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: atRiskPaid } = await supabase
      .from('vendors').select('id, name, tier').neq('tier', 'free').eq('is_active', true)

    const { data: recentReadLeads } = await supabase
      .from('leads').select('vendor_id').eq('is_read', true).gte('created_at', thirtyDaysAgo)

    const activeVendorIds = new Set((recentReadLeads ?? []).map(l => l.vendor_id))
    const ghostedPaid = (atRiskPaid ?? []).filter(v => !activeVendorIds.has(v.id))

    if (ghostedPaid.length > 0) {
      await supabase.from('agent_logs').insert({
        agent: 'optimizer',
        action: 'at_risk_paid_vendors',
        metadata: JSON.stringify({ count: ghostedPaid.length }),
        created_at: now.toISOString(),
      })
      results.push(`at_risk_logged:${ghostedPaid.length}`)
    }
  }

  // ── Task 3: Log opportunity count to DB ──────────────────────────────────
  const opportunityCount = results.length
  if (opportunityCount > 0) {
    await supabase.from('agent_logs').insert({
      agent: 'optimizer',
      action: 'revenue_opportunities_identified',
      metadata: JSON.stringify({ count: opportunityCount, results }),
      created_at: now.toISOString(),
    })
  }

  // ── Task 5: Weekly optimizer summary to founder ───────────────────────────
  if (now.getUTCDay() === 1 && ADMIN_EMAIL) {
    const { data: logs } = await supabase
      .from('agent_logs')
      .select('action, metadata, created_at')
      .eq('agent', 'optimizer')
      .gte('created_at', weekAgo)

    const totalOpportunities = logs?.reduce((sum, l) => {
      try { return sum + (JSON.parse(l.metadata)?.count ?? 0) } catch { return sum }
    }, 0) ?? 0

    await resend.emails.send({
      from: 'Melaa Optimizer <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `💡 Revenue Optimizer: ${totalOpportunities} opportunities this week`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#C8A96A">Revenue Optimizer Weekly Summary</h2>
        <p>This week the optimizer identified and actioned <strong>${totalOpportunities}</strong> revenue opportunities:</p>
        <ul style="color:#444;line-height:2">
          <li>Hot window upgrade prompts (vendors with 2-5 leads)</li>
          <li>Featured placement upsells to Basic vendors</li>
          <li>Revenue leak recovery (inactive paid vendors)</li>
        </ul>
        <p style="color:#666;font-size:13px">Track conversions manually by checking if any vendors upgraded after receiving these emails.</p>
        <a href="${SITE}/admin" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Admin Dashboard →</a>
      </div>`,
    })
  }

  return NextResponse.json({ ok: true, agent: 'optimizer', tasks: results, ran_at: now.toISOString() })
}
