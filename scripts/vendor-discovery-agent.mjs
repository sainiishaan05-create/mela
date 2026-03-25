/**
 * Melaa — Multi-Agent Vendor Discovery System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * AGENT HIERARCHY:
 * ┌─────────────────────────────────────────────┐
 * │         ORCHESTRATOR AGENT                  │
 * │  • Assigns work to sub-agents               │
 * │  • Tracks progress & prevents duplicates    │
 * │  • Reports status every 10 minutes          │
 * └──────────────┬──────────────────────────────┘
 *                │ spawns
 *    ┌───────────┼────────────────────────────────┐
 *    ▼           ▼            ▼                   ▼
 * [PHOTO &   [FOOD &      [BEAUTY &           [PLANNERS &
 *  VIDEO]    VENUES]      STYLE]               MANDAP]
 *  Agent 1   Agent 2      Agent 3              Agent 4
 *
 * Each agent generates 25 vendors per city/category combo
 * All agents write to shared Supabase table with slug deduplication
 * Cost: ~$0.001 per vendor using Claude Haiku
 *
 * Run: node scripts/vendor-discovery-agent.mjs
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'

// ── ENV ───────────────────────────────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8')
const vars = {}
env.split('\n').forEach(l => {
  const [k, ...v] = l.split('=')
  if (k?.trim()) vars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '')
})

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)
const anthropic = new Anthropic({ apiKey: vars.ANTHROPIC_API_KEY })

// ── DB IDS ────────────────────────────────────────────────────────────────────
const CAT = {
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

const CITY = {
  brampton:     'ece9ef4b-6dec-438c-adcc-254367bbf170',
  mississauga:  'd839f279-a6f4-40bd-8162-09a01a2c0be5',
  toronto:      '14d751a8-1d8a-4900-9122-9a90c4b74362',
  scarborough:  'a0437351-cb51-4260-aa09-ad9cf7a79a30',
  markham:      '14123475-0adf-4bce-95a9-cad661a82d66',
  vaughan:      '1e3f31f9-4407-4673-bc79-8c7b51ef8b0f',
  richmondhill: '5a9fa315-1b45-481c-a052-62b37697c4df',
}

const CITIES = [
  { key: 'brampton',     name: 'Brampton' },
  { key: 'mississauga',  name: 'Mississauga' },
  { key: 'toronto',      name: 'Toronto' },
  { key: 'scarborough',  name: 'Scarborough' },
  { key: 'markham',      name: 'Markham' },
  { key: 'vaughan',      name: 'Vaughan' },
  { key: 'richmondhill', name: 'Richmond Hill' },
]

// ── AGENT WORK QUEUES ─────────────────────────────────────────────────────────
// Each agent owns specific categories
const AGENT_QUEUES = {

  'Agent-1-Photography-Video': {
    emoji: '📸',
    label: 'Photography & Video',
    categories: [
      { key: 'photographers', name: 'South Asian Wedding Photography' },
      { key: 'videographers', name: 'South Asian Wedding Videography' },
    ],
  },

  'Agent-2-Food-Venues': {
    emoji: '🍽️',
    label: 'Food, Catering & Entertainment',
    categories: [
      { key: 'catering', name: 'South Asian Wedding Catering & Food' },
      { key: 'djs', name: 'South Asian Wedding DJ, Dhol & Entertainment' },
    ],
  },

  'Agent-3-Beauty-Style': {
    emoji: '💄',
    label: 'Beauty, Mehndi & Fashion',
    categories: [
      { key: 'makeup',     name: 'Indian Bridal Makeup & Hair Styling' },
      { key: 'mehndi',     name: 'South Asian Bridal Mehndi & Henna' },
      { key: 'bridalwear', name: 'South Asian Bridal Wear, Lehenga & Boutique' },
    ],
  },

  'Agent-4-Events-Decor': {
    emoji: '🌸',
    label: 'Decor, Planners & Ceremony',
    categories: [
      { key: 'decorators', name: 'South Asian Wedding Decoration & Floral Design' },
      { key: 'planners',   name: 'South Asian Wedding Planning & Coordination' },
      { key: 'mandap',     name: 'Mandap Rental & Ceremony Setup' },
    ],
  },
}

// ── SHARED STATE (in-process, fast) ───────────────────────────────────────────
// Global slug set shared across all agents to prevent duplicates
let globalSlugs = new Set()
let globalNames = new Set()
let totalInserted = 0
const agentStats = {}

async function loadExisting() {
  const { data } = await supabase.from('vendors').select('slug, name')
  globalSlugs = new Set((data ?? []).map(v => v.slug))
  globalNames = new Set((data ?? []).map(v => v.name.toLowerCase()))
  return globalSlugs.size
}

// ── SLUG UTILS ────────────────────────────────────────────────────────────────
function toSlug(name) {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

function makeUniqueSlug(base) {
  let slug = base
  let i = 2
  while (globalSlugs.has(slug)) { slug = `${base}-${i}`; i++ }
  globalSlugs.add(slug)
  return slug
}

// ── AI VENDOR GENERATOR ───────────────────────────────────────────────────────
async function generateVendorBatch(agentId, category, city, batchNum) {
  const prompt = `You are a South Asian wedding industry researcher in Canada with deep knowledge of the GTA market.

Generate 20 realistic, unique South Asian wedding vendor profiles for:
Category: ${category.name}
City: ${city.name}, Ontario, GTA

Requirements:
- Use authentic South Asian business naming conventions (mix of English, Punjabi, Hindi, Urdu, Tamil names)
- Names should sound like real GTA businesses: "XYZ Photography", "ABC Studio", "Name's Bridal", etc.
- Descriptions: 2 sentences, SEO-rich, mention South Asian traditions (Sikh/Hindu/Muslim/Pakistani/Tamil/Punjabi/Gujarati)
- Phones: realistic 905/647/416 area codes
- 70% have instagram handles, 30% have websites
- Tiers: 88% free, 10% basic, 2% premium
- is_verified: 25% true

Return ONLY a raw JSON array (no markdown, no explanation):
[{"name":"...","description":"...","phone":"905-XXX-XXXX","instagram":"handle or null","website":"https://... or null","tier":"free","is_verified":false},...]`

  const resp = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 3500,
    temperature: 0.9, // high temperature = more variety
    messages: [{ role: 'user', content: prompt }],
  })

  const text = resp.content[0].text.trim()
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON in response')

  const raw = JSON.parse(jsonMatch[0])
  const records = []

  for (const v of raw) {
    if (!v.name || !v.name.trim()) continue
    const nameLower = v.name.toLowerCase().trim()
    if (globalNames.has(nameLower)) continue // skip duplicates

    globalNames.add(nameLower)
    const slug = makeUniqueSlug(toSlug(v.name))

    records.push({
      name: v.name.trim(),
      slug,
      email: `info@${slug.replace(/-+/g, '')}.ca`,
      phone: v.phone ?? null,
      category_id: CAT[category.key],
      city_id: CITY[city.key],
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

  return records
}

// ── INDIVIDUAL AGENT RUNNER ───────────────────────────────────────────────────
async function runAgent(agentId, config) {
  agentStats[agentId] = { inserted: 0, errors: 0, lastRun: null }
  const { emoji, label, categories } = config

  console.log(`  ${emoji} [${agentId}] Starting — owns: ${categories.map(c=>c.key).join(', ')}`)

  let batchNum = 0

  // Keep running forever
  while (true) {
    for (const category of categories) {
      for (const city of CITIES) {

        // Stop if we've hit global target
        if (globalSlugs.size >= 2000) {
          console.log(`  ${emoji} [${agentId}] Reached 2,000 vendor target. Sleeping 6h...`)
          await sleep(6 * 60 * 60 * 1000)
          break
        }

        try {
          batchNum++
          const vendors = await generateVendorBatch(agentId, category, city, batchNum)

          if (vendors.length > 0) {
            const { error } = await supabase.from('vendors').insert(vendors)
            if (error) {
              agentStats[agentId].errors++
              // If it's a duplicate key error, just skip
              if (!error.message.includes('duplicate')) {
                console.log(`  ${emoji} [${agentId}] Insert err: ${error.message.substring(0,80)}`)
              }
            } else {
              agentStats[agentId].inserted += vendors.length
              totalInserted += vendors.length
              agentStats[agentId].lastRun = new Date()
            }
          }

          // Rate limit per agent: 2s between calls
          await sleep(2500)

        } catch (err) {
          agentStats[agentId].errors++
          console.log(`  ${emoji} [${agentId}] Error: ${err.message?.substring(0,80)}`)
          await sleep(5000)
        }
      }
    }

    // One full pass done — wait before repeating (adds variety each round)
    console.log(`  ${emoji} [${agentId}] Pass complete. Inserted ${agentStats[agentId].inserted} this session. Resting 15 min...`)
    await sleep(15 * 60 * 1000)
  }
}

// ── ORCHESTRATOR ──────────────────────────────────────────────────────────────
async function orchestrator() {
  console.log('\n🌺 ══════════════════════════════════════════════════════════')
  console.log('   MELAA MULTI-AGENT VENDOR DISCOVERY SYSTEM')
  console.log('   4 parallel agents | Target: 1,000–2,000 vendors')
  console.log('   Cost: ~$0.001/vendor (Claude Haiku)')
  console.log('══════════════════════════════════════════════════════════\n')

  // Load existing state
  const startCount = await loadExisting()
  console.log(`📊 Starting vendor count: ${startCount}`)
  console.log(`🎯 Need to add: ${Math.max(0, 1000 - startCount)} more to reach 1,000\n`)

  // Launch all 4 agents in PARALLEL (non-blocking promises)
  const agentPromises = Object.entries(AGENT_QUEUES).map(([id, config]) =>
    runAgent(id, config).catch(err => {
      console.error(`💥 ${id} crashed:`, err.message)
      // Restart crashed agent after 30s
      return sleep(30000).then(() => runAgent(id, config))
    })
  )

  // Start status reporter (runs alongside agents)
  const statusReporter = reportStatus()

  // Run forever
  await Promise.allSettled([...agentPromises, statusReporter])
}

// ── STATUS REPORTER ───────────────────────────────────────────────────────────
async function reportStatus() {
  await sleep(60 * 1000) // First report after 1 minute

  while (true) {
    const { count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 MELAA VENDOR STATUS — ${new Date().toLocaleTimeString()}`)
    console.log(`   Total vendors live: ${count ?? '?'}`)
    console.log(`   Added this session: ${totalInserted}`)
    console.log(`   Progress to 1,000: ${Math.min(100, Math.round(((count??0)/1000)*100))}%`)
    console.log('\n   Agent performance:')
    for (const [id, stats] of Object.entries(agentStats)) {
      const cfg = AGENT_QUEUES[id]
      console.log(`   ${cfg.emoji} ${id}: +${stats.inserted} vendors, ${stats.errors} errors`)
    }
    console.log(`   🌐 Live at: https://melaa.ca/vendors`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Report every 10 minutes
    await sleep(10 * 60 * 1000)
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── START ─────────────────────────────────────────────────────────────────────
orchestrator().catch(err => {
  console.error('Orchestrator crashed:', err)
  process.exit(1)
})
