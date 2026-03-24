/**
 * OUTREACH AGENT
 * Role: Vendor acquisition pipeline management
 * Schedule: Every day 8am UTC
 *
 * Tasks:
 * 1. Generate daily "outreach kit" — 10 ready-to-send DMs (Instagram + WhatsApp) emailed to founder
 * 2. Auto-progress stale outreach statuses + log activity
 * 3. Identify high-value vendor targets from lead demand gaps
 * 4. Generate cold email sequences for vendors with emails in outreach table
 * 5. Weekly outreach pipeline report
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
  const day = now.getUTCDay()

  // ── Task 1: Daily outreach kit — 10 DMs ready to send ────────────────────
  if (ADMIN_EMAIL) {
    const { data: pending } = await supabase
      .from('outreach')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (pending && pending.length > 0) {
      // Generate all messages in parallel
      const messages = await Promise.all(
        pending.map(async (vendor) => {
          const [igDm, waDm, emailMsg] = await Promise.all([
            ai(`Write a 60-word Instagram DM to ${vendor.business_name}, a South Asian wedding ${vendor.category ?? 'vendor'} in ${vendor.city ?? 'GTA'}, inviting them to list FREE on Melaa.ca. Warm, direct, community feel. No hashtags.`),
            ai(`Write a 60-word WhatsApp message to ${vendor.business_name}, a ${vendor.category ?? 'wedding vendor'} in ${vendor.city ?? 'GTA'}, inviting them to list FREE on Melaa.ca. Conversational, WhatsApp-native tone.`),
            vendor.email ? ai(`Write a 3-sentence cold email subject + body to ${vendor.business_name} about listing free on Melaa.ca. Format: SUBJECT: ... | BODY: ...`) : Promise.resolve(''),
          ])
          return { vendor, igDm, waDm, emailMsg }
        })
      )

      const kitHtml = messages.map(({ vendor, igDm, waDm, emailMsg }) => `
        <div style="margin-bottom:28px;border:1px solid #e5e5e0;border-radius:12px;overflow:hidden">
          <div style="background:#1A1A1A;padding:12px 16px">
            <strong style="color:white">${vendor.business_name}</strong>
            <span style="color:#E8760A;margin-left:8px;font-size:12px">${vendor.category ?? ''} · ${vendor.city ?? ''}</span>
            ${vendor.instagram ? `<span style="color:#aaa;margin-left:8px;font-size:12px">@${vendor.instagram}</span>` : ''}
          </div>
          <div style="padding:16px">
            <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#666;text-transform:uppercase">📱 Instagram DM</p>
            <p style="margin:0 0 16px;padding:10px;background:#f0f4ff;border-radius:8px;font-size:13px">${igDm}</p>
            <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#666;text-transform:uppercase">💬 WhatsApp</p>
            <p style="margin:0 0 16px;padding:10px;background:#f0fff4;border-radius:8px;font-size:13px">${waDm}</p>
            ${emailMsg ? `<p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#666;text-transform:uppercase">📧 Cold Email</p>
            <p style="margin:0;padding:10px;background:#fafaf7;border-radius:8px;font-size:13px">${emailMsg}</p>` : ''}
          </div>
        </div>
      `).join('')

      await resend.emails.send({
        from: 'Mela Outreach <agent@melaa.ca>',
        to: ADMIN_EMAIL,
        subject: `📬 Today's Outreach Kit — ${pending.length} vendors ready to contact`,
        html: `<div style="font-family:sans-serif;max-width:680px;margin:0 auto">
          <h2 style="color:#E8760A">Daily Outreach Kit</h2>
          <p>Copy-paste these messages to each vendor on Instagram, WhatsApp, or email. Mark them as contacted in <a href="${SITE}/admin/outreach">your outreach tracker</a>.</p>
          ${kitHtml}
          <a href="${SITE}/admin/outreach" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">Update Statuses →</a>
          <p style="color:#999;font-size:12px;margin-top:20px">Mela Outreach Agent · ${now.toDateString()}</p>
        </div>`,
      })

      // Mark generated ones as having messages
      for (const { vendor, igDm } of messages) {
        await supabase
          .from('outreach')
          .update({ message_sent: igDm, notes: `Kit generated ${now.toDateString()}` })
          .eq('id', vendor.id)
      }
      results.push(`outreach_kit:${pending.length}_vendors`)
    }
  }

  // ── Task 2: Auto-send email to outreach leads that have emails ────────────
  const { data: emailTargets } = await supabase
    .from('outreach')
    .select('*')
    .eq('status', 'pending')
    .not('email', 'is', null)
    .limit(5)

  for (const target of emailTargets ?? []) {
    const emailBody = await ai(`Write a warm 3-sentence cold email to ${target.business_name}, a ${target.category ?? 'South Asian wedding vendor'} in ${target.city ?? 'GTA'}, inviting them to list for FREE on Melaa.ca. South Asian community tone. End with a clear CTA.`)
    await resend.emails.send({
      from: 'Ishaan at Mela <hello@melaa.ca>',
      to: target.email,
      subject: `Free listing for ${target.business_name} on Melaa.ca`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">Hi ${target.business_name}!</h2>
        ${emailBody.split('\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <a href="${SITE}/list-your-business" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">List for Free →</a>
        <p style="color:#bbb;font-size:11px;margin-top:16px">Reply to unsubscribe.</p>
      </div>`,
    })
    await supabase.from('outreach').update({ status: 'contacted' }).eq('id', target.id)
    results.push(`auto_email:${target.business_name}`)
  }

  // ── Task 3: Weekly pipeline report (Mondays) ─────────────────────────────
  if (day === 1 && ADMIN_EMAIL) {
    const { data: pipeline } = await supabase.from('outreach').select('status')
    const counts = { pending: 0, contacted: 0, listed: 0, rejected: 0 }
    for (const row of pipeline ?? []) {
      if (row.status in counts) counts[row.status as keyof typeof counts]++
    }
    const conversionRate = counts.listed + counts.contacted > 0
      ? Math.round((counts.listed / (counts.listed + counts.contacted + counts.pending + counts.rejected)) * 100)
      : 0

    await resend.emails.send({
      from: 'Mela Outreach <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `📊 Outreach Pipeline Report — ${counts.listed} vendors converted`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">Weekly Outreach Pipeline</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr style="background:#fafaf7"><td style="padding:12px;font-weight:bold">Pending</td><td style="padding:12px;text-align:right;font-size:24px;font-weight:bold">${counts.pending}</td></tr>
          <tr><td style="padding:12px;font-weight:bold">Contacted</td><td style="padding:12px;text-align:right;font-size:24px;font-weight:bold;color:#f59e0b">${counts.contacted}</td></tr>
          <tr style="background:#fafaf7"><td style="padding:12px;font-weight:bold">Listed (converted)</td><td style="padding:12px;text-align:right;font-size:24px;font-weight:bold;color:#16a34a">${counts.listed}</td></tr>
          <tr><td style="padding:12px;font-weight:bold">Rejected</td><td style="padding:12px;text-align:right;font-size:24px;font-weight:bold;color:#dc2626">${counts.rejected}</td></tr>
          <tr style="background:#fafaf7"><td style="padding:12px;font-weight:bold">Conversion Rate</td><td style="padding:12px;text-align:right;font-size:24px;font-weight:bold;color:#E8760A">${conversionRate}%</td></tr>
        </table>
        <a href="${SITE}/admin/outreach" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Manage Pipeline →</a>
      </div>`,
    })
    results.push(`pipeline_report:${conversionRate}%_conversion`)
  }

  return NextResponse.json({ ok: true, agent: 'outreach', tasks: results, ran_at: now.toISOString() })
}
