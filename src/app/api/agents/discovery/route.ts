/**
 * Vendor Discovery Agent — Vercel Cron Route
 * Triggered every 6 hours by Vercel cron
 * Each invocation runs one pass (all 4 agents in parallel, 5 vendors each)
 */

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 300 // 5 min

const CAT: Record<string, string> = {
  photographers: '405a6dfa-e380-43ec-bc7a-a964f87dda43',
  videographers: 'f72a47f0-e91d-4a02-8e8d-b8368d12e97a',
  decorators:    'ec5ee74d-5d79-4b29-b9eb-d9b16d3f1a39',
  catering:      'adec2576-e00c-4913-8669-c9ee8e8e300a',
  djs:           '1b14c2a1-4487-4125-bcf0-7eaf276decde',
  makeup:        '504ad166-fbbc-412b-8eab-7d0e3a0f563d',
  mandap:        '07e44280-c993-4a78-9c24-c054b609b91f',
  planners:      '4f5a8240-2b7e-4913-968b-5c35715d2381',
  bridalwear:    'bc2ac7a5-8a4d-47f7-b06c-919c3900470b',
  mehndi:        '2ed5c09b-fe71-48a8-b6a3-9075c9311b6b',
}

const CITY: Record<string, string> = {
  brampton:     'ece9ef4b-6dec-438c-adcc-254367bbf170',
  mississauga:  'd839f279-a6f4-40bd-8162-09a01a2c0be5',
  toronto:      '14d751a8-1d8a-4900-9122-9a90c4b74362',
  scarborough:  'a0437351-cb51-4260-aa09-ad9cf7a79a30',
  markham:      '14123475-0adf-4bce-95a9-cad661a82d66',
  vaughan:      '1e3f31f9-4407-4673-bc79-8c7b51ef8b0f',
  richmondhill: '5a9fa315-1b45-481c-a052-62b37697c4df',
}

// 4 agent work assignments — each picks random category + city
const AGENT_ASSIGNMENTS = [
  { agentName: 'Photography-Video',  catKeys: ['photographers', 'videographers'] },
  { agentName: 'Food-Entertainment', catKeys: ['catering', 'djs'] },
  { agentName: 'Beauty-Style',       catKeys: ['makeup', 'mehndi', 'bridalwear'] },
  { agentName: 'Events-Ceremony',    catKeys: ['decorators', 'planners', 'mandap'] },
]

const ALL_CITIES = ['brampton','mississauga','toronto','scarborough','markham','vaughan','richmondhill']

function toSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

async function runAgentPass(
  anthropic: Anthropic,
  assignment: typeof AGENT_ASSIGNMENTS[0],
  existingSlugs: Set<string>,
  existingNames: Set<string>,
) {
  // Pick random category + city from this agent's queue
  const catKey = assignment.catKeys[Math.floor(Math.random() * assignment.catKeys.length)]
  const cityKey = ALL_CITIES[Math.floor(Math.random() * ALL_CITIES.length)]
  const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace('richmondhill','Richmond Hill')

  const catLabels: Record<string, string> = {
    photographers: 'South Asian Wedding Photography',
    videographers: 'South Asian Wedding Videography',
    catering: 'South Asian Wedding Catering',
    djs: 'South Asian Wedding DJ & Entertainment',
    makeup: 'Indian Bridal Makeup & Hair',
    mehndi: 'South Asian Bridal Mehndi & Henna',
    bridalwear: 'South Asian Bridal Wear & Lehenga Boutique',
    decorators: 'South Asian Wedding Decoration & Florals',
    planners: 'South Asian Wedding Planning',
    mandap: 'Mandap Rental & Ceremony Setup',
  }

  const prompt = `You are a South Asian wedding industry researcher in Canada.

Generate 15 unique, realistic vendor profiles for:
Category: ${catLabels[catKey] ?? catKey}
City: ${cityName}, Ontario, GTA

Rules:
- Authentic South Asian business names for the GTA market
- 2-sentence descriptions mentioning South Asian wedding traditions
- Realistic 905/647/416 phone numbers
- Mix of Punjabi, Hindi, Urdu, Tamil, Gujarati naming styles
- 85% free tier, 13% basic, 2% premium
- 25% is_verified: true

Return ONLY a raw JSON array:
[{"name":"...","description":"...","phone":"905-555-XXXX","instagram":"handle_or_null","website":"url_or_null","tier":"free","is_verified":false}]`

  const resp = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2500,
    temperature: 0.85,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (resp.content[0] as any).text?.trim() ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return { agent: assignment.agentName, added: 0, catKey, cityKey }

  const raw = JSON.parse(match[0]) as any[]
  const records: any[] = []

  for (const v of raw) {
    if (!v.name?.trim()) continue
    const nameLower = v.name.toLowerCase().trim()
    if (existingNames.has(nameLower)) continue
    existingNames.add(nameLower)

    let slug = toSlug(v.name)
    let i = 2
    while (existingSlugs.has(slug)) { slug = `${toSlug(v.name)}-${i}`; i++ }
    existingSlugs.add(slug)

    records.push({
      name: v.name.trim(),
      slug,
      email: `info@${slug.replace(/-+/g,'')}.ca`,
      phone: v.phone ?? null,
      category_id: CAT[catKey],
      city_id: CITY[cityKey],
      description: v.description?.trim() ?? null,
      website: (v.website && v.website !== 'null') ? v.website : null,
      instagram: (v.instagram && v.instagram !== 'null') ? v.instagram.replace('@','') : null,
      tier: ['free','basic','premium'].includes(v.tier) ? v.tier : 'free',
      is_verified: v.is_verified === true,
      is_featured: false,
      is_active: true,
      portfolio_images: [],
    })
  }

  if (records.length > 0) {
    const supabase = await createClient()
    await supabase.from('vendors').insert(records)
  }

  return { agent: assignment.agentName, added: records.length, catKey, cityKey }
}

export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const supabase = await createClient()

    // Load existing to prevent dupes
    const { data: existing } = await supabase.from('vendors').select('slug, name')
    const existingSlugs = new Set<string>((existing ?? []).map((v: any) => v.slug))
    const existingNames = new Set<string>((existing ?? []).map((v: any) => v.name.toLowerCase()))

    const startCount = existingSlugs.size

    // Run all 4 agents in PARALLEL
    const results = await Promise.allSettled(
      AGENT_ASSIGNMENTS.map(a => runAgentPass(anthropic, a, existingSlugs, existingNames))
    )

    const agentResults = results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { agent: AGENT_ASSIGNMENTS[i].agentName, added: 0, error: (r.reason as Error).message }
    )

    const totalAdded = agentResults.reduce((sum, r) => sum + (r.added ?? 0), 0)

    // Log to agent_logs
    try {
      await supabase.from('agent_logs').insert({
        agent: 'vendor-discovery',
        action: 'discovery_run',
        result: `Added ${totalAdded} vendors. Agents: ${agentResults.map(r=>`${r.agent}+${r.added}`).join(', ')}`,
        metadata: { startCount, totalAdded, agents: agentResults },
      })
    } catch {}

    return NextResponse.json({
      success: true,
      startCount,
      totalAdded,
      newTotal: startCount + totalAdded,
      agents: agentResults,
      timestamp: new Date().toISOString(),
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
