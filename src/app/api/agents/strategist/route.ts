/**
 * PRODUCT STRATEGIST AGENT
 * Inspired by: "Looks at your features and asks the hard questions. Tells you what to build next and what to kill."
 * + Growth Engineer: "Finds where users get hooked. Builds viral loops that actually work."
 * Schedule: Every Sunday 6am UTC
 *
 * Financial tasks:
 * 1. Feature ROI analysis — which features drive the most upgrades, which are dead weight
 * 2. Viral loop identification — where vendors/buyers naturally share Melaa, amplify those
 * 3. Funnel leakage report — where are vendors dropping off before upgrading
 * 4. Next 3 features to build ranked by revenue impact
 * 5. Cohort retention analysis — do vendors stay or leave after month 1, 2, 3
 * 6. Weekly "build vs kill" decision memo to founder
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

async function ai(prompt: string, tokens = 400): Promise<string> {
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
  if (searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  if (!ADMIN_EMAIL) return NextResponse.json({ ok: true, agent: 'strategist', tasks: ['no_admin_email'] })

  // ── Pull cohort and funnel data ────────────────────────────────────────────
  const { data: allVendors } = await supabase
    .from('vendors')
    .select('id, tier, is_active, created_at, is_verified, phone, website, instagram, description, portfolio_images')

  const { data: allLeads } = await supabase
    .from('leads')
    .select('vendor_id, is_read, created_at')

  const leadsByVendor: Record<string, number> = {}
  const readLeadsByVendor: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    if (!l.vendor_id) continue
    leadsByVendor[l.vendor_id] = (leadsByVendor[l.vendor_id] ?? 0) + 1
    if (l.is_read) readLeadsByVendor[l.vendor_id] = (readLeadsByVendor[l.vendor_id] ?? 0) + 1
  }

  // Cohort: vendors by month, what % converted to paid
  const cohorts: Record<string, { total: number; paid: number }> = {}
  for (const v of allVendors ?? []) {
    const monthKey = v.created_at.slice(0, 7) // YYYY-MM
    if (!cohorts[monthKey]) cohorts[monthKey] = { total: 0, paid: 0 }
    cohorts[monthKey].total++
    if (v.tier !== 'free') cohorts[monthKey].paid++
  }

  // Funnel analysis: free vendors segmented by profile completeness
  const freeVendors = (allVendors ?? []).filter(v => v.tier === 'free')
  const noProfile = freeVendors.filter(v => !v.description && !v.phone).length
  const partialProfile = freeVendors.filter(v => v.description || v.phone).length
  const fullProfile = freeVendors.filter(v => v.description && v.phone && v.website).length
  const noLeads = freeVendors.filter(v => !leadsByVendor[v.id]).length
  const hasLeads = freeVendors.filter(v => (leadsByVendor[v.id] ?? 0) > 0).length

  // Viral loop data: vendors with Instagram (they'll share their Melaa profile)
  const withInstagram = (allVendors ?? []).filter(v => v.instagram).length
  const viralCoefficient = (allVendors ?? []).length > 0
    ? Math.round((withInstagram / (allVendors ?? []).length) * 100) : 0

  // ── Task 1: Feature ROI analysis ──────────────────────────────────────────
  const featureROI = await ai(
    `You are a product strategist for Melaa.ca, a South Asian wedding vendor marketplace.
    Current features: vendor profiles, lead forms, WhatsApp button, Instagram link, portfolio images, verified badge, admin dashboard, AI lead replies, outreach tracker, pricing page.

    Data:
    - ${(allVendors ?? []).filter(v => v.tier !== 'free').length} paid vendors out of ${(allVendors ?? []).length} total
    - ${withInstagram} vendors have Instagram linked (${viralCoefficient}%)
    - ${fullProfile} free vendors have complete profiles
    - ${noLeads} free vendors have zero leads ever

    Rank the top 5 existing features by their impact on upgrade conversion.
    Then identify 1 feature that is likely dead weight (low usage, low conversion impact).
    Be ruthlessly honest. Under 200 words.`, 350
  )

  // ── Task 2: Next 3 features to build ─────────────────────────────────────
  const nextFeatures = await ai(
    `You are a product strategist for Melaa.ca (South Asian wedding vendor marketplace in GTA).
    Current features: basic profiles, lead forms, WhatsApp, Stripe subscriptions, admin dashboard, AI agent.
    Paid tiers: Basic $99/mo, Premium $249/mo.

    Based on: ${(allLeads ?? []).length} total leads, ${(allVendors ?? []).length} vendors, ${noLeads} vendors with zero leads.

    Recommend the next 3 features to build, ranked by revenue impact.
    For each feature:
    - Feature name
    - How it directly increases MRR (be specific)
    - Build time estimate (days)
    - Revenue impact ($X new MRR or X% conversion lift)

    Think about: what would make buyers come back, what would make vendors upgrade faster, what would create network effects.`, 450
  )

  // ── Task 3: Viral loop identification ────────────────────────────────────
  const viralLoops = await ai(
    `Identify 3 viral loops for Melaa.ca, a South Asian wedding vendor marketplace.

    Current natural virality:
    - Vendors share their Melaa profile link in their Instagram bio
    - Buyers tell friends about vendors they found on Melaa
    - ${viralCoefficient}% of vendors have Instagram linked

    For each viral loop:
    1. Name the loop
    2. How it works step by step (3-4 steps)
    3. What needs to be built/changed to make it 10x stronger
    4. Estimated K-factor improvement

    Focus on loops that compound over time and cost nothing to run.`, 400
  )

  // ── Task 4: Cohort retention analysis ────────────────────────────────────
  const cohortRows = Object.entries(cohorts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([month, data]) => {
      const rate = data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${month}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${data.total}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${data.paid}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:${rate >= 10 ? '#16a34a' : rate >= 5 ? '#f59e0b' : '#dc2626'};font-weight:bold">${rate}%</td>
      </tr>`
    }).join('')

  // ── Task 5: Funnel leakage ────────────────────────────────────────────────
  const funnelLeakage = await ai(
    `Analyze the conversion funnel for Melaa.ca based on this data:
    - Total free vendors: ${freeVendors.length}
    - Free vendors with NO profile (no description, no phone): ${noProfile} (${Math.round(noProfile/Math.max(freeVendors.length,1)*100)}%)
    - Free vendors with PARTIAL profile: ${partialProfile}
    - Free vendors with FULL profile: ${fullProfile}
    - Free vendors with ZERO leads: ${noLeads} (${Math.round(noLeads/Math.max(freeVendors.length,1)*100)}%)
    - Free vendors with at least 1 lead: ${hasLeads}

    Where is the biggest drop-off in the funnel from signup → leads → upgrade?
    What is the single highest-leverage intervention to fix the biggest leak?
    Under 150 words.`, 250
  )

  // ── Send full strategic memo to founder ───────────────────────────────────
  await resend.emails.send({
    from: 'Melaa Strategist <agent@melaa.ca>',
    to: ADMIN_EMAIL,
    subject: `🧠 Weekly Strategy Memo — What to build, what to kill, where to grow`,
    html: `<div style="font-family:sans-serif;max-width:680px;margin:0 auto">
      <h2 style="color:#E8760A">Weekly Product Strategy Memo</h2>
      <p style="color:#666;font-size:13px">${now.toDateString()} · For Ishaan, Founder of Melaa.ca</p>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px">🔍 Funnel Leakage Analysis</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">
        <div style="background:#fafaf7;padding:12px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">No Profile Set Up</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#dc2626">${noProfile}</p>
          <p style="margin:0;font-size:11px;color:#999">vendors (${Math.round(noProfile/Math.max(freeVendors.length,1)*100)}%)</p>
        </div>
        <div style="background:#fafaf7;padding:12px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Zero Leads Ever</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#f59e0b">${noLeads}</p>
          <p style="margin:0;font-size:11px;color:#999">vendors (${Math.round(noLeads/Math.max(freeVendors.length,1)*100)}%)</p>
        </div>
      </div>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${funnelLeakage}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">📊 Cohort Conversion (last 6 months)</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#1A1A1A;color:white">
          <th style="padding:10px;text-align:left">Cohort</th>
          <th style="padding:10px;text-align:right">Vendors</th>
          <th style="padding:10px;text-align:right">Paid</th>
          <th style="padding:10px;text-align:right">Rate</th>
        </tr></thead>
        <tbody>${cohortRows}</tbody>
      </table>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">⭐ Feature ROI Analysis</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${featureROI}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">🔨 Next 3 Features to Build (ranked by revenue impact)</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${nextFeatures}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">🔄 Viral Loops to Engineer</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${viralLoops}</div>

      <div style="background:#1A1A1A;border-radius:12px;padding:20px;margin-top:24px">
        <p style="margin:0;color:white;font-weight:bold">Viral Coefficient Snapshot</p>
        <p style="margin:4px 0 0;color:#E8760A;font-size:28px;font-weight:bold">${viralCoefficient}%</p>
        <p style="margin:4px 0 0;color:#999;font-size:12px">of vendors have Instagram linked → will share their Melaa profile link</p>
      </div>

      <div style="margin-top:24px">
        <a href="${SITE}/admin" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Admin Dashboard →</a>
      </div>
      <p style="color:#999;font-size:12px;margin-top:20px">Melaa Product Strategist Agent · ${now.toDateString()}</p>
    </div>`,
  })
  results.push('strategy_memo:sent')

  await supabase.from('agent_logs').insert({
    agent: 'strategist',
    action: 'weekly_strategy_memo',
    metadata: JSON.stringify({ viralCoefficient, noProfile, noLeads, freeVendors: freeVendors.length }),
    created_at: now.toISOString(),
  })

  return NextResponse.json({ ok: true, agent: 'strategist', tasks: results, ran_at: now.toISOString() })
}
