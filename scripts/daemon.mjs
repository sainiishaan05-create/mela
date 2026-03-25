#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 *  MELA CORPORATE AI DAEMON  — runs 24/7 on your Mac
 *  Every department. Every 15-30 minutes. Never stops.
 * ═══════════════════════════════════════════════════════════════
 *
 *  START:   node scripts/daemon.mjs
 *  INSTALL: bash scripts/install-daemon.sh   (auto-starts on boot)
 *
 *  DEPARTMENTS (run in parallel, different cadences):
 *  ┌─────────────────┬──────────┬────────────────────────────────────┐
 *  │ Department      │ Cadence  │ What it does                       │
 *  ├─────────────────┼──────────┼────────────────────────────────────┤
 *  │ Sales           │ 20 min   │ Scores + pitches vendors to upgrade │
 *  │ Outreach        │ 15 min   │ Sends emails from outreach queue   │
 *  │ Revenue Monitor │ 30 min   │ Detects MRR changes, logs them     │
 *  │ Lead Response   │ 10 min   │ Nudges vendors with unread leads   │
 *  │ Marketing       │ 2 hours  │ Generates content, posts to queue  │
 *  │ Growth          │ 3 hours  │ Partnership pitches, SEO pages     │
 *  │ Community       │ 4 hours  │ Engagement emails, spotlights      │
 *  │ Intelligence    │ 6 hours  │ Market analysis, strategy memo     │
 *  │ Wealth          │ 24 hours │ Cap table snapshot, equity report  │
 *  └─────────────────┴──────────┴────────────────────────────────────┘
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Load env ──────────────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const ai = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
const mail = new Resend(env.RESEND_API_KEY)
const SITE = env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'
const ADMIN = env.ADMIN_EMAIL ?? ''
const BASIC = 49, PREMIUM = 297, MULTIPLE = 8, REGULAR = 197

// ── Utilities ─────────────────────────────────────────────────────────────────
const log = (dept, msg) => console.log(`[${new Date().toISOString()}] [${dept.toUpperCase()}] ${msg}`)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const $ = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${Math.round(n)}`

async function claude(prompt, maxTokens = 200) {
  try {
    const r = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })
    return r.content[0].text
  } catch (e) { return '' }
}

async function send(to, subject, html, from = `Melaa <hello@melaa.ca>`) {
  try {
    await mail.emails.send({ from, to, subject, html })
    return true
  } catch { return false }
}

async function dbLog(dept, action, meta = {}) {
  try {
    await supabase.from('agent_logs').insert({ agent: dept, action, metadata: JSON.stringify(meta) })
  } catch { /* non-blocking */ }
}

// ── DEPARTMENT: LEAD RESPONSE (every 10 min) ─────────────────────────────────
// Fastest loop. Every unread lead after 1h gets vendor nudged. After 4h, escalate.
async function deptLeadResponse() {
  const dept = 'lead_response'
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(id, name, email)')
      .eq('is_read', false)
      .lte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (!leads?.length) return

    // Group by vendor
    const byVendor = {}
    for (const l of leads) {
      const vid = l.vendor?.id
      if (!vid) continue
      if (!byVendor[vid]) byVendor[vid] = { vendor: l.vendor, leads: [] }
      byVendor[vid].leads.push(l)
    }

    let sent = 0
    for (const { vendor, leads: vLeads } of Object.values(byVendor)) {
      if (!vendor?.email) continue
      const age = Math.round((Date.now() - new Date(vLeads[0].created_at).getTime()) / (60 * 60 * 1000))
      const urgency = age >= 4 ? '🚨 URGENT' : '⏰ Reminder'
      const ok = await send(
        vendor.email,
        `${urgency}: ${vLeads.length} buyer${vLeads.length > 1 ? 's' : ''} waiting for your reply`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">${vLeads.length} unanswered inquiry${vLeads.length > 1 ? 's' : ''}</h2>
          <p>${vendor.name}, a buyer contacted you ${age} hour${age > 1 ? 's' : ''} ago on Melaa.ca and hasn't heard back.
          Vendors who reply within 2 hours get <strong>3x more bookings</strong>.</p>
          <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;font-weight:bold">Reply Now →</a>
        </div>`
      )
      if (ok) { sent++; log(dept, `nudged ${vendor.name} (${age}h old, ${vLeads.length} leads)`) }
    }
    if (sent > 0) await dbLog(dept, 'nudges_sent', { count: sent })
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: SALES (every 20 min) ─────────────────────────────────────────
// Proactively identifies and converts free vendors. Never waits.
async function deptSales() {
  const dept = 'sales'
  try {
    // Find free vendors who got a lead in the last 2 hours (HOT WINDOW)
    const { data: hotLeads } = await supabase
      .from('leads')
      .select('vendor_id, created_at')
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())

    const hotIds = [...new Set((hotLeads ?? []).map(l => l.vendor_id).filter(Boolean))]

    if (hotIds.length > 0) {
      const { data: hotVendors } = await supabase
        .from('vendors')
        .select('id, name, email, category:categories(name), city:cities(name)')
        .eq('tier', 'free')
        .in('id', hotIds)

      for (const v of hotVendors ?? []) {
        if (!v.email) continue
        const cat = v.category?.name ?? 'wedding vendor'
        const city = v.city?.name ?? 'GTA'
        const pitch = await claude(
          `Write a 2-paragraph urgent upgrade email to ${v.name}, a ${cat} in ${city}.
          They JUST got an inquiry on Melaa.ca's free plan — this is their hot window.
          Push Founding Member rate: $49/mo (regular $197/mo), locked forever, free for 90 days. FOMO: this lead could book a competitor. Sign as Ishaan.`, 250
        )
        await send(
          v.email,
          `${v.name} — you just got an inquiry. Here's how to get 3x more`,
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            ${pitch.split('\n\n').map(p => `<p style="line-height:1.7;color:#333">${p}</p>`).join('')}
            <div style="text-align:center;margin:20px 0;padding:20px;background:#1A1A1A;border-radius:12px">
              <p style="font-size:12px;color:#E8760A;margin:0;text-transform:uppercase;letter-spacing:1px">Founding Vendor Rate</p>
              <p style="font-size:36px;font-weight:bold;color:white;margin:4px 0">$49<span style="font-size:16px;color:#999">/mo</span></p>
              <p style="color:#666;margin:0;font-size:12px"><s style="color:#999">$197/mo</s> · Free 90 days · Locked forever · Cancel anytime</p>
            </div>
            <a href="${SITE}/pricing" style="display:block;text-align:center;background:#E8760A;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">Upgrade Now →</a>
          </div>`
        )
        log(dept, `hot window pitch → ${v.name}`)
        await dbLog(dept, 'hot_window_pitch', { vendor: v.name })
        await sleep(2000) // rate limit
      }
    }

    // Also: find sleeping free vendors (14+ days, no leads) → reactivation
    const { data: sleeping } = await supabase
      .from('vendors')
      .select('id, name, email, category:categories(name)')
      .eq('tier', 'free')
      .eq('is_active', true)
      .lte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(3) // small batch, runs every 20 min

    const { data: vendorsWithLeads } = await supabase.from('leads').select('vendor_id')
    const withLeadSet = new Set((vendorsWithLeads ?? []).map(l => l.vendor_id))

    for (const v of (sleeping ?? []).filter(v => !withLeadSet.has(v.id))) {
      if (!v.email) continue
      const tip = await claude(`One specific tip for ${v.name} (${v.category?.name ?? 'wedding vendor'}) to get their first lead on Melaa.ca. 1 sentence, actionable.`, 80)
      await send(
        v.email,
        `Quick tip to get your first inquiry on Melaa`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">Hi ${v.name.split(' ')[0]}!</h2>
          <p>We noticed you haven't gotten any leads yet. Here's what top vendors do differently:</p>
          <div style="background:#fafaf7;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:0;font-style:italic;color:#333">💡 ${tip}</p>
          </div>
          <a href="${SITE}/dashboard" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Update My Profile →</a>
        </div>`
      )
      log(dept, `reactivation → ${v.name}`)
      await sleep(2000)
    }
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: OUTREACH (every 15 min) ──────────────────────────────────────
// Processes the outreach table continuously. Sends cold emails to vendor targets.
async function deptOutreach() {
  const dept = 'outreach'
  try {
    // Pick up to 5 pending outreach targets with emails each cycle
    const { data: targets } = await supabase
      .from('outreach')
      .select('*')
      .eq('status', 'pending')
      .not('email', 'is', null)
      .limit(5)

    for (const t of targets ?? []) {
      const body = await claude(
        `Write a 3-sentence cold email to ${t.business_name}, a ${t.category ?? 'South Asian wedding vendor'} in ${t.city ?? 'GTA'}.
        Invite them to list FREE on Melaa.ca. Community tone. Clear CTA. No fluff.`, 150
      )
      const ok = await send(
        t.email,
        `Free listing for ${t.business_name} on Melaa.ca`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          ${body.split('\n').map(p => `<p style="line-height:1.7;color:#333">${p}</p>`).join('')}
          <a href="${SITE}/list-your-business" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">List for Free →</a>
          <p style="color:#bbb;font-size:11px;margin-top:16px">Reply to unsubscribe.</p>
        </div>`
      )
      if (ok) {
        await supabase.from('outreach').update({ status: 'contacted', message_sent: body }).eq('id', t.id)
        log(dept, `emailed ${t.business_name}`)
        await dbLog(dept, 'cold_email_sent', { business: t.business_name })
      }
      await sleep(3000)
    }

    // Follow up on contacts 3+ days old
    const { data: stale } = await supabase
      .from('outreach')
      .select('*')
      .eq('status', 'contacted')
      .not('email', 'is', null)
      .lte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .limit(3)

    for (const t of stale ?? []) {
      const followUp = await claude(
        `One-sentence friendly follow-up to ${t.business_name} about listing free on Melaa.ca. Conversational.`, 60
      )
      await send(
        t.email,
        `Following up — free listing on Melaa.ca`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <p style="color:#333">${followUp}</p>
          <a href="${SITE}/list-your-business" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">List for Free →</a>
        </div>`
      )
      await supabase.from('outreach').update({ status: 'contacted', notes: `Followed up ${new Date().toDateString()}` }).eq('id', t.id)
      log(dept, `follow-up → ${t.business_name}`)
      await sleep(3000)
    }
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: REVENUE MONITOR (every 30 min) ───────────────────────────────
// Watches MRR in real time. Logs snapshots. Alerts on drops or milestones crossed.
async function deptRevenueMonitor() {
  const dept = 'revenue_monitor'
  try {
    const [{ count: basic }, { count: premium }, { count: vendors }, { count: leads }] = await Promise.all([
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic'),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
    ])

    const mrr = (basic ?? 0) * BASIC + (premium ?? 0) * PREMIUM
    const valuation = mrr * 12 * MULTIPLE

    // Check last snapshot to detect milestones
    const { data: last } = await supabase
      .from('valuation_snapshots')
      .select('mrr, valuation')
      .order('snapped_at', { ascending: false })
      .limit(1)
      .single()

    const milestones = [1000, 5000, 10000, 25000, 50000, 100000]
    const crossedMilestone = last && milestones.find(m => last.mrr < m && mrr >= m)

    if (crossedMilestone && ADMIN) {
      const celebration = await claude(`Write a 2-sentence celebration message for crossing $${crossedMilestone} MRR at Melaa.ca. Energetic, founder-to-founder tone.`, 100)
      await send(
        ADMIN,
        `🎉 MILESTONE: Melaa just crossed $${crossedMilestone.toLocaleString()} MRR!`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#E8760A;border-radius:16px;padding:32px;text-align:center;margin-bottom:20px">
            <p style="font-size:48px;margin:0">🎉</p>
            <h1 style="color:white;margin:8px 0">${$(mrr)} MRR</h1>
            <p style="color:rgba(255,255,255,0.9);margin:0">${$(valuation)} implied valuation</p>
          </div>
          <p style="color:#333;line-height:1.7">${celebration}</p>
        </div>`,
        'Melaa Revenue Monitor <agent@melaa.ca>'
      )
      log(dept, `MILESTONE CROSSED: $${crossedMilestone} MRR`)
    }

    await supabase.from('valuation_snapshots').insert({ mrr, arr: mrr * 12, valuation, vendor_count: vendors ?? 0, lead_count: leads ?? 0 })
    log(dept, `snapshot: MRR=${$(mrr)} Valuation=${$(valuation)} Vendors=${vendors}`)
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: MARKETING (every 2 hours) ────────────────────────────────────
// Generates fresh content. Ad copy. Social posts. Queues everything.
async function deptMarketing() {
  const dept = 'marketing'
  try {
    const month = new Date().getMonth() + 1
    const season = month >= 4 && month <= 7 ? 'Spring' : month >= 9 && month <= 11 ? 'Fall' : 'Winter'

    // Generate 3 Instagram captions and queue them
    const topics = [
      `Why South Asian families trust Melaa.ca to find wedding vendors in GTA`,
      `${season} wedding season is here — are you ready? Tips for South Asian couples`,
      `Behind the scenes: how verified vendors on Melaa get 3x more leads`,
    ]

    for (const topic of topics) {
      const caption = await claude(
        `Instagram caption for Melaa.ca. Topic: "${topic}".
        Include a CTA to visit melaa.ca. Add 6 relevant hashtags.
        Warm South Asian community tone. Under 150 words.`, 200
      )
      await supabase.from('content_queue').insert({
        type: 'instagram_caption', content: caption, topic, status: 'ready',
        scheduled_for: new Date().toISOString(),
      })
    }
    log(dept, `queued 3 Instagram captions`)

    // Generate 1 email subject A/B test pair
    const subjectA = await claude(`Write a 7-word email subject line for a South Asian wedding vendor upgrade email. Curiosity-driven.`, 30)
    const subjectB = await claude(`Write a 7-word email subject line for the same email. Benefit-focused, different angle.`, 30)
    await supabase.from('content_queue').insert({
      type: 'ab_subject_test',
      content: JSON.stringify({ a: subjectA, b: subjectB }),
      topic: 'upgrade email subject test',
      status: 'ready',
    })
    log(dept, `A/B subject test generated`)

    await dbLog(dept, 'content_batch_generated', { captions: 3, ab_tests: 1 })
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: GROWTH (every 3 hours) ───────────────────────────────────────
// SEO content, partnership pitches, referral pushes
async function deptGrowth() {
  const dept = 'growth'
  try {
    // Generate 1 SEO blog draft per run
    const categories = ['photographers', 'decorators', 'catering', 'makeup-artists', 'mehndi', 'djs', 'florists', 'videographers']
    const cities = ['Brampton', 'Mississauga', 'Toronto', 'Markham', 'Vaughan', 'Oakville', 'Richmond Hill', 'Scarborough']
    const cat = categories[Math.floor(Math.random() * categories.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const title = `Best South Asian Wedding ${cat} in ${city} (${new Date().getFullYear()})`

    const content = await claude(
      `Write a 400-word SEO blog post titled "${title}".
      Include keyword 4-5 times. Cover: what to look for, price range, why use Melaa.ca.
      South Asian community tone. Short paragraphs.`, 700
    )

    if (content) {
      await supabase.from('blog_drafts').insert({
        title, slug: `${cat}-${city.toLowerCase().replace(/\s/g,'-')}-${Date.now()}`,
        content, category: cat, city, status: 'draft',
      })
      log(dept, `SEO blog draft: ${title}`)
    }

    // Push referral nudge to 5 random vendors
    const { data: vendors } = await supabase
      .from('vendors').select('id, name, email, slug').eq('is_active', true).limit(5)

    for (const v of vendors ?? []) {
      if (!v.email) continue
      await send(
        v.email,
        `Know another wedding vendor? Earn a free month`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">Refer a vendor, get 1 month free</h2>
          <p>Share your referral link with any wedding vendor in GTA. When they list on Melaa, you get a free month.</p>
          <div style="background:#fafaf7;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:0;font-size:12px;color:#666">Your link:</p>
            <p style="margin:4px 0 0;font-family:monospace;color:#E8760A">${SITE}/list-your-business?ref=${v.id.slice(0,8)}</p>
          </div>
          <a href="${SITE}/vendors/${v.slug}" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">View My Profile →</a>
        </div>`
      )
      await sleep(1000)
    }
    log(dept, `referral nudges sent to ${vendors?.length ?? 0} vendors`)
    await dbLog(dept, 'growth_cycle', { seo_draft: title, referrals: vendors?.length ?? 0 })
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: COMMUNITY (every 4 hours) ────────────────────────────────────
// Buyer engagement, vendor milestones, community warmth
async function deptCommunity() {
  const dept = 'community'
  try {
    // Check for fresh milestones (10, 25, 50, 100 leads)
    const { data: allLeads } = await supabase.from('leads').select('vendor_id')
    const countByVendor = {}
    for (const l of allLeads ?? []) {
      if (l.vendor_id) countByVendor[l.vendor_id] = (countByVendor[l.vendor_id] ?? 0) + 1
    }

    for (const [vid, count] of Object.entries(countByVendor)) {
      if (![10, 25, 50, 100, 200].includes(count)) continue
      const { data: v } = await supabase.from('vendors').select('name, email').eq('id', vid).single()
      if (!v?.email) continue

      const msg = await claude(`2-sentence congratulations to ${v.name} who just hit ${count} leads on Melaa.ca. Warm, celebratory.`, 80)
      await send(
        v.email,
        `🎉 ${v.name} — you just hit ${count} leads!`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#E8760A,#f59e0b);padding:32px;border-radius:16px;text-align:center">
            <p style="font-size:48px;margin:0">🎉</p>
            <h2 style="color:white;margin:8px 0">${count} Leads!</h2>
          </div>
          <p style="color:#333;line-height:1.7;margin-top:16px">${msg}</p>
        </div>`
      )
      log(dept, `milestone: ${v.name} → ${count} leads`)
    }

    await dbLog(dept, 'community_cycle_complete')
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: INTELLIGENCE (every 6 hours) ─────────────────────────────────
// Market analysis, strategic memo, supply/demand gaps
async function deptIntelligence() {
  const dept = 'intelligence'
  if (!ADMIN) return

  try {
    const [{ count: vendors }, { count: leads }, { count: paid }] = await Promise.all([
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).neq('tier', 'free'),
    ])

    // Find supply/demand gaps
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('vendor:vendors(category:categories(name), city:cities(name))')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const demand = {}
    for (const l of recentLeads ?? []) {
      const cat = l.vendor?.category?.name, city = l.vendor?.city?.name
      if (cat && city) { const k = `${cat} in ${city}`; demand[k] = (demand[k] ?? 0) + 1 }
    }

    const { data: activeVendors } = await supabase.from('vendors').select('category:categories(name), city:cities(name)').eq('is_active', true)
    const supply = {}
    for (const v of activeVendors ?? []) {
      const cat = v.category?.name, city = v.city?.name
      if (cat && city) { const k = `${cat} in ${city}`; supply[k] = (supply[k] ?? 0) + 1 }
    }

    const gaps = Object.entries(demand)
      .filter(([k, d]) => d >= 2 && (supply[k] ?? 0) < 3)
      .sort(([, a], [, b]) => b - a).slice(0, 5)

    const insight = await claude(
      `Quick strategic insight for Melaa.ca: ${vendors} vendors, ${leads} total leads, ${paid} paid.
      Top gaps: ${gaps.map(([k, d]) => `${k}(${d} leads, ${supply[k] ?? 0} vendors)`).join(', ')}.
      What is the single most important action this week? 2 sentences.`, 150
    )

    await send(
      ADMIN,
      `🔍 Intelligence Update — ${gaps.length} supply gaps detected`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">Intelligence Update</h2>
        <p style="color:#333;font-style:italic">${insight}</p>
        <h3>Supply/Demand Gaps (act now)</h3>
        ${gaps.map(([k, d]) => `<p>• <strong>${k}</strong> — ${d} leads, only ${supply[k] ?? 0} vendors</p>`).join('')}
        <a href="${SITE}/admin/outreach" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">Start Outreach →</a>
      </div>`,
      'Melaa Intelligence <agent@melaa.ca>'
    )
    log(dept, `report sent: ${gaps.length} gaps, insight generated`)
    await dbLog(dept, 'intelligence_report', { gaps: gaps.length, vendors, leads, paid })
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ── DEPARTMENT: WEALTH (every 24 hours) ──────────────────────────────────────
async function deptWealth() {
  const dept = 'wealth'
  if (!ADMIN) return

  try {
    const [{ count: basic }, { count: premium }, { count: vendors }] = await Promise.all([
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic'),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    const mrr = (basic ?? 0) * BASIC + (premium ?? 0) * PREMIUM
    const valuation = mrr * 12 * MULTIPLE

    const { data: team } = await supabase.from('team').select('*').eq('is_active', true)

    await send(
      ADMIN,
      `📊 Daily Wealth Snapshot — ${$(valuation)} valuation`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">Daily Wealth Snapshot</h2>
        <div style="background:#1A1A1A;padding:24px;border-radius:12px;text-align:center;margin:16px 0">
          <p style="color:#E8760A;margin:0;font-size:12px;text-transform:uppercase">Company Valuation</p>
          <p style="color:white;font-size:36px;font-weight:bold;margin:4px 0">${$(valuation)}</p>
          <p style="color:#999;margin:0;font-size:13px">${$(mrr)} MRR · ${vendors} vendors</p>
        </div>
        ${(team ?? []).map(m => {
          const val = Math.round((m.equity_pct / 100) * valuation)
          return `<p style="color:#333"><strong>${m.name}</strong> (${m.equity_pct}%) → <span style="color:#E8760A;font-weight:bold">${$(val)}</span></p>`
        }).join('')}
        <a href="${SITE}/admin/team" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">Team Dashboard →</a>
      </div>`,
      'Melaa Wealth Agent <agent@melaa.ca>'
    )
    log(dept, `daily snapshot: MRR=${$(mrr)} Valuation=${$(valuation)}`)
  } catch (e) { log(dept, `error: ${e.message}`) }
}

// ═══════════════════════════════════════════════════════════════
//  MASTER SCHEDULER — runs everything forever
// ═══════════════════════════════════════════════════════════════

const SCHEDULES = [
  { name: 'Lead Response',    fn: deptLeadResponse,    interval: 10 * 60 * 1000 },
  { name: 'Outreach',         fn: deptOutreach,        interval: 15 * 60 * 1000 },
  { name: 'Sales',            fn: deptSales,           interval: 20 * 60 * 1000 },
  { name: 'Revenue Monitor',  fn: deptRevenueMonitor,  interval: 30 * 60 * 1000 },
  { name: 'Marketing',        fn: deptMarketing,       interval: 2 * 60 * 60 * 1000 },
  { name: 'Growth',           fn: deptGrowth,          interval: 3 * 60 * 60 * 1000 },
  { name: 'Community',        fn: deptCommunity,       interval: 4 * 60 * 60 * 1000 },
  { name: 'Intelligence',     fn: deptIntelligence,    interval: 6 * 60 * 60 * 1000 },
  { name: 'Wealth',           fn: deptWealth,          interval: 24 * 60 * 60 * 1000 },
]

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║          MELA CORPORATE DAEMON — ONLINE          ║
║  ${new Date().toISOString()}   ║
╚══════════════════════════════════════════════════╝
`)

  // Run all departments immediately on startup
  console.log('Running all departments on startup...\n')
  for (const s of SCHEDULES) {
    log('startup', `Running ${s.name}...`)
    await s.fn().catch(e => log('startup', `${s.name} failed: ${e.message}`))
    await sleep(2000)
  }

  // Then schedule each on its own interval
  for (const s of SCHEDULES) {
    setInterval(async () => {
      log(s.name.toLowerCase().replace(/\s/g, '_'), 'Starting cycle...')
      await s.fn().catch(e => log(s.name, `error: ${e.message}`))
    }, s.interval)
    log('scheduler', `${s.name} scheduled every ${s.interval / 60000} min`)
  }

  console.log('\n✅ All departments running. Daemon is live 24/7.\n')

  // Keep process alive
  process.on('SIGINT', () => { console.log('\nDaemon stopped.'); process.exit(0) })
  process.on('uncaughtException', e => log('daemon', `uncaught: ${e.message}`))
  setInterval(() => {}, 60 * 60 * 1000) // heartbeat
}

main()
