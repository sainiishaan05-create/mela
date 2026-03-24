/**
 * MARKET ANALYST AGENT
 * Inspired by: "Compares your features to competitors. Finds your unfair advantages. Shows what to build to win."
 * Schedule: Every Monday 7am UTC
 *
 * Financial tasks:
 * 1. Competitive pricing analysis — generate report vs WeddingWire, Thumbtack, Shaadi.com
 * 2. Market sizing — estimate TAM/SAM from lead volume × category × GTA population
 * 3. Unfair advantage report — what Mela can do that big platforms can't
 * 4. New revenue stream ideas — identify monetization gaps (vendor insurance, consultations, etc.)
 * 5. Seasonal demand forecast — predict lead volume spikes and prep vendors/inventory
 * 6. Category expansion opportunities — which new vendor types would buyers pay for
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

async function ai(prompt: string, tokens = 500): Promise<string> {
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

  if (!ADMIN_EMAIL) return NextResponse.json({ ok: true, agent: 'market', tasks: ['no_admin_email'] })

  // ── Pull real platform data to ground the analysis ────────────────────────
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalVendors },
    { count: totalLeads },
    { count: paidVendors },
    { data: categoryData },
    { data: cityData },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).neq('tier', 'free'),
    supabase.from('leads').select('vendor:vendors(category:categories(name))').gte('created_at', monthAgo),
    supabase.from('leads').select('vendor:vendors(city:cities(name))').gte('created_at', monthAgo),
  ])

  // Category demand map
  const catDemand: Record<string, number> = {}
  for (const l of categoryData ?? []) {
    const cat = (l.vendor as { category?: { name: string } })?.category?.name
    if (cat) catDemand[cat] = (catDemand[cat] ?? 0) + 1
  }

  const cityDemand: Record<string, number> = {}
  for (const l of cityData ?? []) {
    const city = (l.vendor as { city?: { name: string } })?.city?.name
    if (city) cityDemand[city] = (cityDemand[city] ?? 0) + 1
  }

  const topCats = Object.entries(catDemand).sort(([, a], [, b]) => b - a)
  const topCities = Object.entries(cityDemand).sort(([, a], [, b]) => b - a)
  const conversionRate = totalVendors && totalVendors > 0
    ? Math.round(((paidVendors ?? 0) / totalVendors) * 100) : 0

  // ── Task 1: Competitive analysis ─────────────────────────────────────────
  const competitiveReport = await ai(
    `You are a market analyst for Melaa.ca — a niche South Asian wedding vendor marketplace in GTA, Canada.
    Current platform data: ${totalVendors} vendors, ${totalLeads} total leads, ${conversionRate}% paid conversion rate.
    Top categories: ${topCats.slice(0, 5).map(([c, n]) => `${c}(${n} leads/mo)`).join(', ')}.
    Top cities: ${topCities.slice(0, 4).map(([c, n]) => `${c}(${n} leads/mo)`).join(', ')}.

    Compare Mela against: WeddingWire ($50-200/mo), Thumbtack (pay-per-lead $15-50 each), Shaadi.com, Google/Instagram (free but no discovery).

    Write a market analysis covering:
    1. Mela's 3 unfair advantages vs each competitor
    2. Where Mela is currently underpriced and what premium tiers could look like
    3. One new revenue stream Mela could launch in 30 days

    Be specific, financial, strategic. Under 300 words.`, 500
  )

  // ── Task 2: Market sizing ─────────────────────────────────────────────────
  const marketSizing = await ai(
    `Do a quick market sizing for Melaa.ca, a South Asian wedding vendor directory in GTA.
    Facts: ~30,000 South Asian weddings happen in GTA each year. Average wedding spend $50,000.
    Vendors per wedding: ~8-12 (photographer, caterer, decorator, DJ, mehndi, etc.)
    Mela charges vendors $99-249/month.

    Calculate:
    - TAM (total addressable market — all South Asian wedding vendor spend in GTA)
    - SAM (serviceable — vendors who would list on a directory)
    - SOM (what Mela can realistically capture in year 1-2)
    - What MRR looks like at 1%, 5%, 10% market penetration
    Show the math. Under 200 words.`, 400
  )

  // ── Task 3: New revenue streams ───────────────────────────────────────────
  const newStreams = await ai(
    `Identify 5 new passive revenue streams for Melaa.ca, a South Asian wedding vendor marketplace.
    Current model: vendor subscriptions $99-249/mo.
    Platform data: ${totalVendors} vendors, ${totalLeads} leads total.

    Think creatively about:
    - Buyer-side monetization (they currently pay nothing)
    - Data/analytics products for vendors
    - Premium features (vendor insurance referrals, booking deposits, review verification)
    - Affiliate/partnership revenue
    - Event or community monetization

    For each stream: name it, estimate monthly revenue potential, and how long to build. Be specific and realistic.`, 500
  )

  // ── Task 4: Seasonal demand forecast ─────────────────────────────────────
  const month = now.getMonth() + 1
  const seasonalForecast = await ai(
    `Write a seasonal demand forecast for Melaa.ca based on South Asian wedding patterns in GTA.
    Current month: ${month}.
    South Asian wedding peaks: April-June (spring), October-November (fall), December (winter).
    Off-peak: January-March, July-August.

    Forecast:
    1. Expected lead volume change next 60 days vs current
    2. Which vendor categories will see biggest demand spikes
    3. 2 specific actions to take NOW to capitalize on the upcoming season
    4. Which vendor categories to aggressively recruit in the next 30 days

    Be specific. Under 200 words.`, 350
  )

  // ── Task 5: Category expansion opportunities ──────────────────────────────
  const expansion = await ai(
    `Based on South Asian wedding needs in GTA, identify 5 vendor categories NOT yet on Melaa.ca that buyers are searching for.
    Think: what does a South Asian family need for a wedding that isn't covered by photographers, decorators, caterers, mehndi, makeup, DJs?
    For each: category name, estimated number of vendors in GTA, monthly search volume estimate, suggested listing price.
    Format as a numbered list.`, 300
  )

  // ── Send full report to founder ───────────────────────────────────────────
  await resend.emails.send({
    from: 'Mela Market Analyst <agent@melaa.ca>',
    to: ADMIN_EMAIL,
    subject: `🔍 Weekly Market Intelligence Report — ${now.toDateString()}`,
    html: `<div style="font-family:sans-serif;max-width:680px;margin:0 auto">
      <h2 style="color:#E8760A">Market Intelligence Report</h2>
      <p style="color:#666;font-size:13px">${now.toDateString()} · Melaa.ca</p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:20px 0">
        <div style="background:#fafaf7;padding:12px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Vendors</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#1A1A1A">${totalVendors}</p>
        </div>
        <div style="background:#fafaf7;padding:12px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Total Leads</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#E8760A">${totalLeads}</p>
        </div>
        <div style="background:#fafaf7;padding:12px;border-radius:8px;text-align:center">
          <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Paid Conversion</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#16a34a">${conversionRate}%</p>
        </div>
      </div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px">⚔️ Competitive Analysis</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${competitiveReport}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">📐 Market Sizing (TAM/SAM/SOM)</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${marketSizing}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">💰 New Revenue Streams</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${newStreams}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">📅 Seasonal Demand Forecast</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${seasonalForecast}</div>

      <h3 style="border-bottom:2px solid #E8760A;padding-bottom:6px;margin-top:24px">🚀 Category Expansion Opportunities</h3>
      <div style="background:#fafaf7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#333;line-height:1.7">${expansion}</div>

      <div style="margin-top:24px">
        <a href="${SITE}/admin" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-right:8px">Admin Dashboard</a>
        <a href="${SITE}/admin/outreach" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Run Outreach →</a>
      </div>
      <p style="color:#999;font-size:12px;margin-top:20px">Mela Market Analyst Agent · ${now.toDateString()}</p>
    </div>`,
  })
  results.push('market_report:sent')

  // Store insights in DB
  await supabase.from('agent_logs').insert({
    agent: 'market',
    action: 'weekly_market_report',
    metadata: JSON.stringify({ totalVendors, totalLeads, conversionRate, topCats: topCats.slice(0, 5) }),
    created_at: now.toISOString(),
  })

  return NextResponse.json({ ok: true, agent: 'market', tasks: results, ran_at: now.toISOString() })
}
