/**
 * REVENUE AGENT
 * Role: MRR growth, pricing strategy, financial intelligence
 * Schedule: Every Friday 8am UTC
 *
 * Tasks:
 * 1. Full P&L snapshot — MRR, churn rate, LTV estimate → email to founder
 * 2. Identify top 3 revenue levers this week and write action items
 * 3. Pricing experiment — test a different CTA on upgrade emails for 50% of free vendors
 * 4. LTV maximization — identify Premium candidates among Basic tier vendors
 * 5. Revenue forecast — 30/60/90 day projection based on current growth rate
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

  if (!ADMIN_EMAIL) return NextResponse.json({ ok: true, agent: 'revenue', tasks: ['no_admin_email'], ran_at: now.toISOString() })

  // ── Pull all core metrics ─────────────────────────────────────────────────
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalVendors },
    { count: freeVendors },
    { count: basicVendors },
    { count: premiumVendors },
    { count: newVendorsThisWeek },
    { count: newVendorsLastWeek },
    { count: totalLeads },
    { count: leadsThisWeek },
    { count: leadsLastWeek },
    { data: categoryLeads },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'free').eq('is_active', true),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic').eq('is_active', true),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium').eq('is_active', true),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgo).lte('created_at', weekAgo),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgo).lte('created_at', weekAgo),
    supabase.from('leads').select('vendor:vendors(category:categories(name))').gte('created_at', monthAgo),
  ])

  // MRR calculation
  const mrr = ((basicVendors ?? 0) * 99) + ((premiumVendors ?? 0) * 249)
  const arr = mrr * 12
  const vendorGrowthRate = newVendorsLastWeek && newVendorsLastWeek > 0
    ? Math.round(((newVendorsThisWeek ?? 0) - newVendorsLastWeek) / newVendorsLastWeek * 100)
    : 0
  const leadGrowthRate = leadsLastWeek && leadsLastWeek > 0
    ? Math.round(((leadsThisWeek ?? 0) - leadsLastWeek) / leadsLastWeek * 100)
    : 0

  // LTV estimate: avg subscription = 8 months
  const avgLTV = Math.round(((basicVendors ?? 0) * 99 * 8 + (premiumVendors ?? 0) * 249 * 8) / Math.max((basicVendors ?? 0) + (premiumVendors ?? 0), 1))

  // 30/60/90 day MRR forecast (simple linear)
  const weeklyMRRGrowth = mrr * (vendorGrowthRate / 100 / 4)
  const forecast30 = Math.round(mrr + weeklyMRRGrowth * 4)
  const forecast60 = Math.round(mrr + weeklyMRRGrowth * 8)
  const forecast90 = Math.round(mrr + weeklyMRRGrowth * 12)

  // Top categories by demand
  const catCount: Record<string, number> = {}
  for (const lead of categoryLeads ?? []) {
    const cat = (lead.vendor as { category?: { name: string } })?.category?.name
    if (cat) catCount[cat] = (catCount[cat] ?? 0) + 1
  }
  const topCats = Object.entries(catCount).sort(([, a], [, b]) => b - a).slice(0, 5)

  // ── Task 1: AI-generated revenue analysis ─────────────────────────────────
  const analysis = await ai(
    `You are a revenue advisor for Melaa.ca, a South Asian wedding vendor marketplace in GTA.
    Current metrics:
    - Total vendors: ${totalVendors} (${freeVendors} free, ${basicVendors} basic @ $99/mo, ${premiumVendors} premium @ $249/mo)
    - MRR: $${mrr} | ARR: $${arr}
    - New vendors this week: ${newVendorsThisWeek} (${vendorGrowthRate > 0 ? '+' : ''}${vendorGrowthRate}% vs last week)
    - Leads this week: ${leadsThisWeek} (${leadGrowthRate > 0 ? '+' : ''}${leadGrowthRate}% vs last week)
    - Top categories: ${topCats.map(([c, n]) => `${c}(${n})`).join(', ')}

    Write 3 specific, actionable revenue levers for this week. Number them. Be concrete, not generic. Under 200 words.`, 300
  )

  // ── Task 2: Pitch Premium to top Basic vendors ─────────────────────────────
  const { data: basicList } = await supabase
    .from('vendors')
    .select('id, name, email, created_at, category:categories(name)')
    .eq('tier', 'basic')
    .lte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .limit(5)

  for (const vendor of basicList ?? []) {
    if (!vendor.email) continue
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding vendor'
    const pitch = await ai(`Write a 2-paragraph email pitching ${vendor.name} (${catName}) to upgrade from Basic ($99/mo) to Premium ($249/mo) on Melaa.ca.
    Premium benefits: homepage featured, premium badge, priority support, first in all searches.
    Calculate their ROI: one extra booking pays for a year of Premium. Sign as "Ishaan, Founder".`)

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `${vendor.name} — ready for Premium? (one booking pays for a year)`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${pitch.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:bold">Upgrade to Premium →</a>
      </div>`,
    })
    results.push(`premium_pitch:${vendor.name}`)
  }

  // ── Task 3: Weekly P&L report to founder ─────────────────────────────────
  await resend.emails.send({
    from: 'Melaa Revenue <agent@melaa.ca>',
    to: ADMIN_EMAIL,
    subject: `💰 Weekly Revenue Report — $${mrr} MRR · ${vendorGrowthRate > 0 ? '📈' : '📊'} ${vendorGrowthRate > 0 ? '+' : ''}${vendorGrowthRate}% growth`,
    html: `<div style="font-family:sans-serif;max-width:650px;margin:0 auto">
      <h2 style="color:#C8A96A">Weekly Revenue Intelligence</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0">
        <div style="background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">MRR</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#16a34a">$${mrr.toLocaleString()}</p>
        </div>
        <div style="background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">ARR</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A">$${arr.toLocaleString()}</p>
        </div>
        <div style="background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Avg LTV</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#C8A96A">$${avgLTV.toLocaleString()}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#fafaf7"><td style="padding:10px;font-weight:bold">Free Vendors</td><td style="padding:10px;text-align:right">${freeVendors}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">Basic ($99/mo)</td><td style="padding:10px;text-align:right">${basicVendors}</td></tr>
        <tr style="background:#fafaf7"><td style="padding:10px;font-weight:bold">Premium ($249/mo)</td><td style="padding:10px;text-align:right">${premiumVendors}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">Total Leads (all time)</td><td style="padding:10px;text-align:right">${totalLeads}</td></tr>
        <tr style="background:#fafaf7"><td style="padding:10px;font-weight:bold">Vendor Growth (WoW)</td><td style="padding:10px;text-align:right;color:${vendorGrowthRate >= 0 ? '#16a34a' : '#dc2626'}">${vendorGrowthRate > 0 ? '+' : ''}${vendorGrowthRate}%</td></tr>
        <tr><td style="padding:10px;font-weight:bold">Lead Growth (WoW)</td><td style="padding:10px;text-align:right;color:${leadGrowthRate >= 0 ? '#16a34a' : '#dc2626'}">${leadGrowthRate > 0 ? '+' : ''}${leadGrowthRate}%</td></tr>
      </table>

      <h3>📈 MRR Forecast</h3>
      <table style="width:100%;border-collapse:collapse;margin:8px 0">
        <tr style="background:#fafaf7"><td style="padding:10px">30 days</td><td style="padding:10px;text-align:right;font-weight:bold;color:#C8A96A">$${forecast30.toLocaleString()}</td></tr>
        <tr><td style="padding:10px">60 days</td><td style="padding:10px;text-align:right;font-weight:bold;color:#C8A96A">$${forecast60.toLocaleString()}</td></tr>
        <tr style="background:#fafaf7"><td style="padding:10px">90 days</td><td style="padding:10px;text-align:right;font-weight:bold;color:#16a34a">$${forecast90.toLocaleString()}</td></tr>
      </table>

      <h3>🏆 Top Categories by Demand (30d)</h3>
      ${topCats.map(([cat, count]) => `<p style="margin:4px 0">• <strong>${cat}</strong> — ${count} leads</p>`).join('')}

      <h3>🎯 This Week's Revenue Levers</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;color:#333;line-height:1.6;font-size:14px">${analysis}</div>

      <div style="margin-top:20px">
        <a href="${SITE}/admin" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-right:8px">Admin Dashboard</a>
        <a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Pricing Page</a>
      </div>
      <p style="color:#999;font-size:12px;margin-top:24px">Melaa Revenue Agent · ${now.toDateString()}</p>
    </div>`,
  })
  results.push(`revenue_report:$${mrr}_mrr`)

  return NextResponse.json({ ok: true, agent: 'revenue', tasks: results, ran_at: now.toISOString() })
}
