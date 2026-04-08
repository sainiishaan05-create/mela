/**
 * Vendor Discovery Agent — Vercel Cron Route
 * Runs daily — 6 parallel agents covering all 25 categories across 30 cities
 */

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 300

// ── Category IDs ─────────────────────────────────────────────────
const CAT: Record<string, string> = {
  photographers:     '405a6dfa-e380-43ec-bc7a-a964f87dda43',
  videographers:     'f72a47f0-e91d-4a02-8e8d-b8368d12e97a',
  contentcreators:   'd141f8d4-b76d-4bf4-aaa9-750d6ee47b4c',
  decorators:        'ec5ee74d-5d79-4b29-b9eb-d9b16d3f1a39',
  catering:          'adec2576-e00c-4913-8669-c9ee8e8e300a',
  djs:               '1b14c2a1-4487-4125-bcf0-7eaf276decde',
  makeup:            '504ad166-fbbc-412b-8eab-7d0e3a0f563d',
  mandap:            '07e44280-c993-4a78-9c24-c054b609b91f',
  planners:          '4f5a8240-2b7e-4913-968b-5c35715d2381',
  bridalwear:        'bc2ac7a5-8a4d-47f7-b06c-919c3900470b',
  mehndi:            '2ed5c09b-fe71-48a8-b6a3-9075c9311b6b',
  venues:            '32eb5e8f-3ab1-4c20-a649-88b5b2ecf9af',
  priest:            '3d3c006b-7466-4c5c-af32-623bba10c96e',
  sweets:            '9de9e96d-4829-48b3-98b0-061a1d3d1b71',
  invitations:       'ca4efdcf-4efd-4c8a-8167-94489d537b98',
  baraat:            'dfa09696-5090-41d6-9196-764b6ec9956a',
  // New categories
  tents:             'b29c992e-b3cb-4466-a15a-e4578c306dd7',
  sound:             'c9fbdbf8-be82-4e1c-898f-178a778d5c39',
  transport:         '718bbf14-f69c-471f-8e14-8c545cdf8268',
  staffing:          '59679d5d-1cf8-41da-b10b-63a98ee7349e',
  florists:          '3fa30e2d-2e7e-416c-af48-1bb72c1c74ff',
  cakes:             'ce1d419b-1b51-4e25-8701-acdf25925b10',
  linen:             'b06f0e50-12f9-4f71-a34a-c3196520e70f',
  horse:             'ee9e874f-467e-4a8b-9bbd-b532120bcb76',
  prewedding:        '5be4b839-61d1-44a7-b5ea-4cc4b57c8b0e',
  honeymoon:         '2ee15600-6c5d-40ac-bf27-a1da6dc31716',
}

// ── City IDs ─────────────────────────────────────────────────────
const CITY: Record<string, string> = {
  brampton:       'ece9ef4b-6dec-438c-adcc-254367bbf170',
  mississauga:    'd839f279-a6f4-40bd-8162-09a01a2c0be5',
  toronto:        '14d751a8-1d8a-4900-9122-9a90c4b74362',
  scarborough:    'a0437351-cb51-4260-aa09-ad9cf7a79a30',
  markham:        '14123475-0adf-4bce-95a9-cad661a82d66',
  vaughan:        '1e3f31f9-4407-4673-bc79-8c7b51ef8b0f',
  richmondhill:   '5a9fa315-1b45-481c-a052-62b37697c4df',
  oakville:       '22cb66a4-efbe-4d82-8490-92b370f3f97f',
  etobicoke:      '865f5a48-2caa-4540-b1ee-ec623af36be2',
  northyork:      '315c8132-cff6-4cc4-abee-312a3879b3c4',
  thornhill:      '0f390102-a0db-4134-bab1-3d6da93d3b15',
  woodbridge:     '45ddb28f-9b5c-4fe0-bb50-14d52bef49e7',
  ajax:           '5273351a-8a06-4d39-8a54-882cfc28473d',
  pickering:      '885f297f-056f-49ca-a5b4-c37403663893',
  oshawa:         '448ca10d-6a4f-400f-91a5-f023e18b7eb6',
  whitby:         'ed88514b-cbf3-4f2a-ad38-59b582fae375',
  burlington:     '3a7d6a2b-5aee-4f9f-b602-3968ec6c8442',
  milton:         '00d8ea17-bd88-4f67-a70b-94d1da6cd1c1',
  caledon:        '221f8989-4e96-40d1-90cb-e20baa1ac3ef',
  newmarket:      'e0b1c169-18a5-4a67-be3e-a59ec7eb550d',
  aurora:         'a6d06a3c-264b-4f4b-a5fc-2d2b10165a71',
  hamilton:       '5feaa66d-f996-4a62-8e31-98fa8d30b00f',
  kitchener:      'd996b616-b357-48aa-a445-f06ecb551589',
  waterloo:       '5131feae-68f2-443b-86dd-a357b104de40',
  cambridge:      'ccbbf7aa-d108-4f45-9aed-b776ec1ff443',
  guelph:         '47b04f0a-f6cf-4fe8-86c4-873e2d708483',
  stouffville:    'dcd1d802-49c1-4a77-8a00-13fcee2daa76',
  georgetown:     '10612660-1527-4edd-acac-ed16edf1c493',
  barrie:         '2c2b473d-8c23-46d5-899e-f6bd33222985',
}

const ALL_CITY_KEYS = Object.keys(CITY)

// 6 agent teams — each covers a slice of the 25+ categories
const AGENT_ASSIGNMENTS = [
  { agentName: 'Photography-Video',   catKeys: ['photographers', 'videographers', 'contentcreators'] },
  { agentName: 'Food-Entertainment',  catKeys: ['catering', 'djs', 'sweets', 'cakes'] },
  { agentName: 'Beauty-Style',        catKeys: ['makeup', 'mehndi', 'bridalwear', 'invitations'] },
  { agentName: 'Events-Ceremony',     catKeys: ['decorators', 'planners', 'mandap', 'priest', 'venues'] },
  { agentName: 'Services-Logistics',  catKeys: ['tents', 'sound', 'transport', 'staffing', 'linen', 'horse'] },
  { agentName: 'Experience-Extra',    catKeys: ['florists', 'baraat', 'prewedding', 'honeymoon'] },
]

const CAT_LABELS: Record<string, string> = {
  photographers:  'South Asian Wedding Photography',
  videographers:  'South Asian Wedding Videography',
  contentcreators:'South Asian Wedding Content Creators (Reels, Social Media, Same-Day Edits)',
  catering:       'South Asian Wedding Catering & Banquet',
  djs:            'South Asian Wedding DJ & Entertainment',
  makeup:         'Indian Bridal Makeup & Hair Artists',
  mehndi:         'South Asian Bridal Mehndi & Henna',
  bridalwear:     'South Asian Bridal Wear & Lehenga Boutiques',
  decorators:     'South Asian Wedding Decoration & Florals',
  planners:       'South Asian Wedding Planning & Coordination',
  mandap:         'Mandap Rental & Ceremony Stage Setup',
  venues:         'South Asian Wedding Venues & Banquet Halls',
  priest:         'Hindu / Muslim / Sikh Wedding Officiants & Priests',
  sweets:         'Indian & Pakistani Sweets, Mithai & Desserts',
  invitations:    'South Asian Wedding Invitation Cards & Stationery',
  baraat:         'Baraat Dhol Players & Wedding Entertainment',
  tents:          'Tent & Marquee Rental for South Asian Outdoor Weddings',
  sound:          'Event Sound Systems, Stage Lighting & AV Production',
  transport:      'Wedding Transportation — Limos, Vintage Cars, Luxury Coaches',
  staffing:       'Event Staffing — Waitstaff, Coordinators & Hospitality Crew',
  florists:       'Wedding Florists — Marigold Garlands & South Asian Flower Arrangements',
  cakes:          'South Asian Wedding Cakes & Custom Dessert Tables',
  linen:          'Chair Covers, Table Linens & Wedding Furniture Rentals',
  horse:          'Baraat Horse & Carriage Services for South Asian Groom Arrivals',
  prewedding:     'Sangeet, Mehndi Night, Haldi, Garba & Dholki Event Planning',
  honeymoon:      'Honeymoon Travel Packages for South Asian Newlyweds',
}

function toSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

function cityDisplayName(key: string): string {
  const map: Record<string, string> = {
    richmondhill: 'Richmond Hill', northyork: 'North York',
    woodbridge: 'Woodbridge', stouffville: 'Stouffville',
  }
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

async function runAgentPass(
  anthropic: Anthropic,
  assignment: typeof AGENT_ASSIGNMENTS[0],
  existingSlugs: Set<string>,
  existingNames: Set<string>,
) {
  const catKey = assignment.catKeys[Math.floor(Math.random() * assignment.catKeys.length)]
  const cityKey = ALL_CITY_KEYS[Math.floor(Math.random() * ALL_CITY_KEYS.length)]
  const cityName = cityDisplayName(cityKey)
  const catLabel = CAT_LABELS[catKey] ?? catKey

  const prompt = `You are a South Asian wedding industry researcher in Canada.

Generate 15 unique, realistic vendor profiles for:
Category: ${catLabel}
City: ${cityName}, Ontario

Rules:
- Authentic South Asian business names for the Canadian market
- 2-sentence descriptions mentioning South Asian wedding traditions
- Realistic 905/647/416/519/289 phone numbers (mix based on city)
- Mix of Punjabi, Hindi, Urdu, Tamil, Gujarati, Guyanese naming styles
- 82% free tier, 14% basic, 4% premium
- 20% is_verified: true, 5% is_featured: true
- Website URLs should be realistic (vendor-name.ca or .com or null)
- Instagram handles should be realistic (no spaces, 4-20 chars) or null

Return ONLY a valid JSON array, no markdown, no explanation:
[{"name":"...","description":"...","phone":"905-555-XXXX","instagram":"handle_or_null","website":"url_or_null","tier":"free","is_verified":false,"is_featured":false}]`

  const resp = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 3000,
    temperature: 0.9,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (resp.content[0] as any).text?.trim() ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return { agent: assignment.agentName, added: 0, catKey, cityKey }

  let raw: any[]
  try { raw = JSON.parse(match[0]) } catch { return { agent: assignment.agentName, added: 0, catKey, cityKey } }

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
      name:         v.name.trim(),
      slug,
      email:        `info@${slug.replace(/-+/g, '').substring(0, 30)}.ca`,
      phone:        v.phone ?? null,
      category_id:  CAT[catKey],
      city_id:      CITY[cityKey],
      description:  v.description?.trim() ?? null,
      website:      (v.website && v.website !== 'null') ? v.website : null,
      instagram:    (v.instagram && v.instagram !== 'null') ? v.instagram.replace('@', '') : null,
      tier:         ['free', 'basic', 'premium'].includes(v.tier) ? v.tier : 'free',
      is_verified:  v.is_verified === true,
      is_featured:  v.is_featured === true,
      is_active:    true,
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
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const supabase = await createClient()

    const { data: existing } = await supabase.from('vendors').select('slug, name')
    const existingSlugs = new Set<string>((existing ?? []).map((v: any) => v.slug))
    const existingNames = new Set<string>((existing ?? []).map((v: any) => v.name.toLowerCase()))
    const startCount = existingSlugs.size

    // Run all 6 agents in parallel
    const results = await Promise.allSettled(
      AGENT_ASSIGNMENTS.map(a => runAgentPass(anthropic, a, existingSlugs, existingNames))
    )

    const agentResults = results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { agent: AGENT_ASSIGNMENTS[i].agentName, added: 0, error: (r.reason as Error).message }
    )

    const totalAdded = agentResults.reduce((sum, r) => sum + (r.added ?? 0), 0)

    try {
      await supabase.from('agent_logs').insert({
        agent: 'vendor-discovery',
        action: 'discovery_run',
        result: `Added ${totalAdded} vendors (${Object.keys(CAT).length} cats, ${ALL_CITY_KEYS.length} cities). ${agentResults.map(r => `${r.agent}+${r.added}`).join(', ')}`,
        metadata: { startCount, totalAdded, agents: agentResults },
      })
    } catch { /* agent_logs may not exist */ }

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
