/**
 * WEALTH AGENT
 * Role: Keep every team member aligned with the financial mission.
 *       Every person should know exactly what the company is worth,
 *       what their stake is worth today, and what 1 more paying vendor means for them.
 * Schedule: 1st of every month, 9am UTC
 *
 * Tasks:
 * 1. Send each team member a personal monthly equity statement
 * 2. Send founder a full cap table snapshot with valuation update
 * 3. Calculate and log "value per vendor added" so team sees direct impact of their work
 * 4. Alert founder when a valuation milestone is crossed
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
const VALUATION_MULTIPLE = 8
const BASIC_PRICE = 99
const PREMIUM_PRICE = 249

export const dynamic = 'force-dynamic'

function currency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n).toLocaleString()}`
}

async function ai(prompt: string, tokens = 200): Promise<string> {
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

  // Only run on 1st of the month (or if forced with ?force=1)
  if (now.getUTCDate() !== 1 && searchParams.get('force') !== '1')
    return NextResponse.json({ ok: true, agent: 'wealth', skipped: 'not 1st of month' })

  // ── Pull live financials ──────────────────────────────────────────────────
  const [
    { count: basicCount },
    { count: premiumCount },
    { count: totalVendors },
    { count: totalLeads },
    { data: teamMembers },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('team').select('*').eq('is_active', true),
  ])

  const mrr = ((basicCount ?? 0) * BASIC_PRICE) + ((premiumCount ?? 0) * PREMIUM_PRICE)
  const arr = mrr * 12
  const valuation = arr * VALUATION_MULTIPLE

  // Value of adding 1 Basic vendor to the platform
  const valuePerBasicVendor = BASIC_PRICE * 12 * VALUATION_MULTIPLE
  const valuePerPremiumVendor = PREMIUM_PRICE * 12 * VALUATION_MULTIPLE

  // Snapshot this month's valuation for tracking
  await supabase.from('valuation_snapshots').insert({
    mrr,
    arr,
    valuation,
    vendor_count: totalVendors ?? 0,
    lead_count: totalLeads ?? 0,
    snapped_at: now.toISOString(),
  })

  // Pull last month's snapshot to compute growth
  const { data: lastSnapshot } = await supabase
    .from('valuation_snapshots')
    .select('valuation, mrr')
    .lte('snapped_at', new Date(now.getFullYear(), now.getMonth() - 1, 28).toISOString())
    .order('snapped_at', { ascending: false })
    .limit(1)
    .single()

  const mrrGrowth = lastSnapshot ? Math.round(((mrr - lastSnapshot.mrr) / Math.max(lastSnapshot.mrr, 1)) * 100) : 0
  const valuationGrowth = lastSnapshot ? Math.round(((valuation - lastSnapshot.valuation) / Math.max(lastSnapshot.valuation, 1)) * 100) : 0

  // ── Task 1: Personal equity statement to each team member ─────────────────
  for (const member of teamMembers ?? []) {
    if (!member.email) continue

    const equityValue = Math.round((member.equity_pct / 100) * valuation)
    const monthsIn = Math.floor((Date.now() - new Date(member.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
    const vestedPct = monthsIn < member.cliff_months ? 0 : Math.min(100, Math.round((monthsIn / member.vesting_months) * 100))
    const vestedValue = Math.round(equityValue * vestedPct / 100)
    const unvestedValue = equityValue - vestedValue

    // What does 1 new vendor mean for this person specifically?
    const valueOfOneBasicForMember = Math.round((member.equity_pct / 100) * valuePerBasicVendor)

    const personalNote = await ai(
      `Write a 2-sentence personal, motivating note for ${member.name} (${member.role}) at a startup called Melaa.
      Their ${member.equity_pct}% equity stake is now worth ${currency(equityValue)}, up ${mrrGrowth}% from last month.
      Warm, founder-to-team tone. Acknowledge their contribution to building this.`
    )

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: member.email,
      subject: `📈 Your monthly equity update — ${currency(equityValue)} and growing`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">

        <div style="background:#1A1A1A;border-radius:16px;padding:28px;margin-bottom:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#C8A96A;text-transform:uppercase;letter-spacing:2px">Your Equity Statement</p>
          <p style="margin:8px 0 0;font-size:13px;color:#999">${now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          <p style="margin:12px 0 0;font-size:48px;font-weight:bold;color:white">${currency(equityValue)}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#C8A96A">${member.equity_pct}% of Melaa</p>
          ${mrrGrowth > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#4ade80">↑ Up ${mrrGrowth}% from last month</p>` : ''}
        </div>

        <p style="color:#333;line-height:1.7;margin-bottom:20px">${personalNote}</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="background:#fafaf7">
            <td style="padding:12px;font-weight:bold;color:#1A1A1A">Your stake</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#C8A96A">${member.equity_pct}%</td>
          </tr>
          <tr>
            <td style="padding:12px;color:#1A1A1A">Total equity value</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#1A1A1A">${currency(equityValue)}</td>
          </tr>
          <tr style="background:#fafaf7">
            <td style="padding:12px;color:#1A1A1A">Vested (${vestedPct}%)</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#16a34a">${currency(vestedValue)}</td>
          </tr>
          <tr>
            <td style="padding:12px;color:#1A1A1A">Unvested (${100 - vestedPct}%)</td>
            <td style="padding:12px;text-align:right;color:#6B6B6B">${currency(unvestedValue)}</td>
          </tr>
          <tr style="background:#fafaf7">
            <td style="padding:12px;color:#1A1A1A">Months vested</td>
            <td style="padding:12px;text-align:right;color:#1A1A1A">${Math.max(0, monthsIn - member.cliff_months)} of ${member.vesting_months}</td>
          </tr>
        </table>

        <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-weight:bold;color:#1A1A1A">💡 What your work is worth in real time</p>
          <p style="margin:0 0 6px;color:#444;font-size:14px">
            Every Basic vendor we sign = <strong style="color:#C8A96A">${currency(valueOfOneBasicForMember)}</strong> added to your equity value
          </p>
          <p style="margin:0;color:#444;font-size:14px">
            Every Premium vendor we sign = <strong style="color:#C8A96A">${currency(Math.round((member.equity_pct / 100) * valuePerPremiumVendor))}</strong> added to your equity value
          </p>
        </div>

        <div style="background:#C8A96A;border-radius:12px;padding:20px;text-align:center">
          <p style="margin:0;color:white;font-weight:bold;font-size:16px">Company Valuation This Month</p>
          <p style="margin:8px 0;color:white;font-size:32px;font-weight:bold">${currency(valuation)}</p>
          <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px">${currency(mrr)} MRR · ${currency(arr)} ARR · ${VALUATION_MULTIPLE}x multiple</p>
          ${valuationGrowth > 0 ? `<p style="margin:8px 0 0;color:white;font-size:13px">↑ Valuation up ${valuationGrowth}% this month</p>` : ''}
        </div>

        <p style="margin-top:20px;color:#333;line-height:1.7">
          This is real. Every vendor we add, every upgrade we close, every lead we generate —
          it compounds directly into this number. Let's keep building.
        </p>
        <p style="color:#444">— Ishaan</p>

        <a href="${SITE}/admin/team" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px;font-size:13px">View Team Dashboard →</a>
      </div>`,
    })
    results.push(`equity_statement:${member.name}(${currency(equityValue)})`)
  }

  // ── Task 2: Founder full cap table summary ────────────────────────────────
  if (ADMIN_EMAIL) {
    const tableRows = (teamMembers ?? []).map((m: {
      name: string; role: string; equity_pct: number; vesting_months: number; cliff_months: number; start_date: string
    }) => {
      const val = Math.round((m.equity_pct / 100) * valuation)
      const monthsIn = Math.floor((Date.now() - new Date(m.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
      const vested = monthsIn < m.cliff_months ? 0 : Math.min(100, Math.round((monthsIn / m.vesting_months) * 100))
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee">${m.name}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;color:#666">${m.role}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#C8A96A">${m.equity_pct}%</td>
        <td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold">${currency(val)}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;color:#16a34a">${vested}% vested</td>
      </tr>`
    }).join('')

    const totalAllocated = (teamMembers ?? []).reduce((s: number, m: { equity_pct: number }) => s + m.equity_pct, 0)

    await resend.emails.send({
      from: 'Melaa Wealth Agent <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `💰 Monthly Cap Table — Company valued at ${currency(valuation)}`,
      html: `<div style="font-family:sans-serif;max-width:650px;margin:0 auto">
        <h2 style="color:#C8A96A">Monthly Cap Table Report</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
          <div style="background:#1A1A1A;padding:16px;border-radius:8px;text-align:center">
            <p style="margin:0;font-size:11px;color:#C8A96A;text-transform:uppercase">Valuation</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:white">${currency(valuation)}</p>
          </div>
          <div style="background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
            <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">MRR</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#C8A96A">${currency(mrr)}</p>
          </div>
          <div style="background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
            <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">MRR Growth</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:${mrrGrowth >= 0 ? '#16a34a' : '#dc2626'}">${mrrGrowth > 0 ? '+' : ''}${mrrGrowth}%</p>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#1A1A1A;color:white">
            <th style="padding:10px;text-align:left">Name</th>
            <th style="padding:10px;text-align:left">Role</th>
            <th style="padding:10px;text-align:left">Equity</th>
            <th style="padding:10px;text-align:left">Value</th>
            <th style="padding:10px;text-align:left">Vesting</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
          <tfoot><tr style="background:#fafaf7;font-weight:bold">
            <td colspan="2" style="padding:10px">Total Allocated</td>
            <td style="padding:10px;color:#C8A96A">${totalAllocated}%</td>
            <td style="padding:10px">${currency(Math.round((totalAllocated / 100) * valuation))}</td>
            <td style="padding:10px;color:#666">${100 - totalAllocated}% unallocated</td>
          </tr></tfoot>
        </table>
        <div style="background:#fafaf7;padding:16px;border-radius:8px;margin-top:16px">
          <p style="margin:0 0 8px;font-weight:bold">Every vendor action = direct valuation impact</p>
          <p style="margin:0 0 4px;font-size:13px;color:#444">+1 Basic vendor = <strong>+${currency(valuePerBasicVendor)}</strong> valuation</p>
          <p style="margin:0;font-size:13px;color:#444">+1 Premium vendor = <strong>+${currency(valuePerPremiumVendor)}</strong> valuation</p>
        </div>
        <a href="${SITE}/admin/team" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Team Dashboard →</a>
      </div>`,
    })
    results.push(`cap_table_report:${currency(valuation)}`)
  }

  return NextResponse.json({ ok: true, agent: 'wealth', tasks: results, ran_at: now.toISOString() })
}
