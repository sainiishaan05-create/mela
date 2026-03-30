# MELA — Full Company Context for Claude Code
> Load this file at the start of any Claude Code session to have complete knowledge of the Mela platform, codebase, business strategy, and current state.
> Last updated: March 2025

---

## 1. WHO WE ARE

**Company:** Mela (melaa.ca)
**Founder:** Ishaan Saini
**Mission:** The #1 South Asian wedding vendor marketplace for the Greater Toronto Area (GTA). We connect couples planning South Asian (Indian, Pakistani, Sri Lankan, Punjabi, etc.) weddings with local vendors — photographers, caterers, DJs, MUA artists, venues, priests, jewellers, florists, decorators, and more.
**Stage:** Early-stage, actively building. Live at melaa.ca.
**Revenue model:** Vendor subscriptions — Free tier (listed), Basic ($49/mo Founding rate, normally $99/mo), Premium (TBD higher tier with top placement + badges).

---

## 2. TECH STACK

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe (subscriptions) |
| Email | Resend (transactional emails) |
| AI | Anthropic Claude Haiku (all agent tasks) |
| Hosting | Vercel |
| Cron Jobs | Vercel Cron + local Node.js daemon via launchd on Mac |
| Local daemon | Node.js running 24/7 on Ishaan's Mac |

**Repo location:** `/Users/ishaansaini/Downloads/mela/`

---

## 3. ENVIRONMENT VARIABLES

Stored in `.env.local` at `/Users/ishaansaini/Downloads/mela/.env.local`

Key variables (names — ask Ishaan for values):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        ← use this for all server-side DB writes
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=            ← whsec_... from Stripe Dashboard → Developers → Webhooks
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://melaa.ca
```

**To load env vars in a Node.js inline script:**
```javascript
import { readFileSync } from 'fs';
const env = Object.fromEntries(
  readFileSync('/Users/ishaansaini/Downloads/mela/.env.local', 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i), l.slice(i+1)]; })
);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
```

---

## 4. DATABASE SCHEMA (Supabase / PostgreSQL)

### Table: `vendors`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| name | text | Vendor business name |
| slug | text | URL-safe unique identifier |
| email | text | Contact email |
| phone | text | Contact phone (nullable) |
| category_id | uuid | FK → categories.id |
| city_id | uuid | FK → cities.id |
| description | text | Business description |
| website | text | Website URL (nullable) |
| instagram | text | Instagram handle (nullable) |
| tier | text | 'free' \| 'basic' \| 'premium' |
| is_verified | boolean | Default false |
| is_featured | boolean | Default false |
| is_active | boolean | Default true |
| portfolio_images | jsonb | Array [] default |
| created_at | timestamp | Auto |
| stripe_customer_id | text | Set on subscription |
| stripe_subscription_id | text | Set on subscription |

### Table: `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Display name |
| slug | text | URL slug (used as lookup key) |
| description | text | |
| icon | text | Emoji or icon name |
| is_active | boolean | |

**Current categories (slugs):**
- `photographers`
- `videographers`
- `catering`
- `dj-entertainment`
- `makeup-hair`
- `mehndi-artists`
- `decor-florals`
- `bridal-wear`
- `jewellery`
- `wedding-venues`
- `priest-services`
- `sweets-mithai`
- `invitations`
- `baraat-entertainment`

### Table: `cities`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Display name |
| slug | text | URL slug |
| province | text | 'ON' |
| is_active | boolean | |

**Current cities (slugs):**
- `toronto`
- `mississauga`
- `brampton`
- `markham`
- `vaughan`
- `scarborough`
- `richmond-hill` ← NOTE: hyphen, not `richmondhill`
- `kitchener-waterloo`

**IMPORTANT:** When inserting vendors for Richmond Hill, use slug `richmond-hill` (with hyphen).

---

## 5. HOW TO INSERT VENDORS VIA SCRIPT

Use this pattern to bulk-insert vendors. Always run as ES module with `node --input-type=module`:

```javascript
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load env
const env = Object.fromEntries(
  readFileSync('/Users/ishaansaini/Downloads/mela/.env.local', 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i), l.slice(i+1)]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Get category and city IDs
const { data: cats } = await supabase.from('categories').select('id,slug');
const { data: cities } = await supabase.from('cities').select('id,slug');
const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
const cityMap = Object.fromEntries(cities.map(c => [c.slug, c.id]));

// Slug generator
function makeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Load existing slugs to avoid duplicates
const { data: existing } = await supabase.from('vendors').select('slug,name');
const existingSlugs = new Set(existing.map(v => v.slug));
const existingNames = new Set(existing.map(v => v.name.toLowerCase().trim()));

function uniqSlug(base) {
  let s = base, n = 2;
  while (existingSlugs.has(s)) s = `${base}-${n++}`;
  existingSlugs.add(s);
  return s;
}

// Your vendor data
const vendors = [
  {
    name: 'Vendor Name',
    category: 'photographers',   // use category slug
    city: 'toronto',             // use city slug
    email: 'info@vendor.com',
    phone: '416-555-0000',
    website: 'https://vendor.com',
    instagram: '@vendor',
    description: 'Description here.',
  },
  // ... more vendors
];

// Build insert rows
const rows = [];
for (const v of vendors) {
  if (existingNames.has(v.name.toLowerCase().trim())) continue; // skip duplicates
  const cat_id = catMap[v.category];
  const city_id = cityMap[v.city];
  if (!cat_id || !city_id) { console.log('SKIP (bad cat/city):', v.name); continue; }
  const slug = uniqSlug(makeSlug(v.name));
  existingNames.add(v.name.toLowerCase().trim());
  rows.push({
    name: v.name, slug,
    email: v.email || 'info@melaa.ca',
    phone: v.phone || null,
    category_id: cat_id, city_id: city_id,
    description: v.description || '',
    website: v.website || null,
    instagram: v.instagram || null,
    tier: 'free', is_verified: false, is_featured: false, is_active: true,
    portfolio_images: [],
  });
}

// Insert in batches of 20
let inserted = 0;
for (let i = 0; i < rows.length; i += 20) {
  const { error } = await supabase.from('vendors').insert(rows.slice(i, i+20));
  if (error) console.error('Batch error:', error.message);
  else inserted += Math.min(20, rows.length - i);
}
console.log(`Inserted: ${inserted}/${rows.length}`);
```

---

## 6. CURRENT STATE (as of March 2025)

- **Total vendors:** ~1,268 active vendors
- **Categories:** 14 (see list above)
- **Cities:** 8 GTA cities
- **Vendor tiers:** Free (most), Basic (Founding $49/mo), Premium (TBD)
- **Website:** Live at melaa.ca
- **Stripe:** Live mode configured. Webhook endpoint set up at melaa.ca/api/webhooks/stripe
- **Revenue:** Early stage — first vendor subscriptions being closed via Instagram DMs

---

## 7. AI AGENT ARCHITECTURE

### Local Daemon
- Runs 24/7 on Ishaan's Mac via launchd
- Node.js process at `/Users/ishaansaini/Downloads/mela/daemon/`
- Orchestrates multi-agent tasks using Claude Haiku

### Agent Departments (9 total)
1. **CEO Agent** — orchestration, planning, priority decisions
2. **Growth Agent** — vendor outreach, Instagram DMs, email campaigns
3. **SEO Agent** — content generation, meta tags, blog posts, directory pages
4. **Data Agent** — vendor discovery, web scraping, database population
5. **Finance Agent** — Stripe subscription tracking, revenue reporting
6. **Email Agent** — Resend transactional emails, follow-up sequences
7. **Community Agent** — social media monitoring, Reddit, Facebook groups
8. **Analytics Agent** — traffic, conversion, vendor signup tracking
9. **Support Agent** — vendor onboarding assistance, FAQ responses

### Vendor Discovery Flow
1. Data Agent searches Google, Yelp, WeddingWire, Instagram for South Asian wedding vendors in GTA
2. Extracts: name, phone, email, website, Instagram, description, category, city
3. Deduplicates against existing DB records
4. Bulk inserts via Supabase service role key
5. Growth Agent then begins outreach to newly added vendors

---

## 8. BUSINESS STRATEGY

### Revenue Model
| Tier | Price | Features |
|---|---|---|
| Free | $0 | Listed in directory, basic profile |
| Basic (Founding) | $49/mo | Featured badge, priority placement, inquiry leads |
| Premium | TBD | Top of category, verified badge, analytics dashboard |

### Target Vendors
South Asian wedding vendors in Greater Toronto Area:
- Photographers & videographers
- Caterers (Indian, Pakistani, Sri Lankan cuisine)
- DJs & entertainment
- Makeup artists & hair stylists
- Mehndi artists
- Decorators & florists
- Bridal wear boutiques
- Jewellers
- Wedding venues
- Priests (Pandit ji, Maulvi)
- Sweets & mithai shops
- Invitation designers
- Baraat horses & entertainment

### Target Cities
Toronto, Mississauga, Brampton, Markham, Vaughan, Scarborough, Richmond Hill, Kitchener-Waterloo

### Go-To-Market
1. List all vendors for free → build directory value
2. Instagram DM outreach to vendors → pitch Basic plan
3. Community building — Facebook groups, WhatsApp networks
4. SEO — rank for "South Asian wedding photographer Toronto" etc.
5. Couple-side traffic → vendors see leads → upgrade to paid

---

## 9. INSTAGRAM DM OUTREACH SCRIPTS

**Initial DM (cold outreach to vendor):**
```
Hey [Name]! 👋 I'm Ishaan, founder of Mela — we're building the #1 South Asian wedding directory for the GTA. I'd love to feature [Business Name] on melaa.ca for free so couples can discover you. Takes 2 mins — want me to send you the link? 🙏
```

**Follow-up DM (after 3 days no reply):**
```
Hey [Name]! Just following up — we're adding South Asian wedding vendors to Mela this week and would love to include [Business Name]. Free listing, no catch. melaa.ca — want to check it out? 🌸
```

**Upgrade pitch (after they're listed):**
```
Hey [Name]! You're live on Mela 🎉 Couples are already finding you. We have a Founding Member plan — $49/mo to be featured at the top of your category and get direct inquiry leads from couples. Only a few spots left at this rate — interested?
```

---

## 10. KEY URLS & LINKS

- **Website:** https://melaa.ca
- **Supabase Dashboard:** https://app.supabase.com (ask Ishaan for project)
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Instagram:** @melaa.ca (in progress)
- **Email:** hello@melaa.ca

---

## 11. STRIPE WEBHOOK SETUP

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://melaa.ca/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
5. Save → Click the webhook → Click "Reveal" under Signing secret
6. Copy the `whsec_...` value → add to Vercel env as `STRIPE_WEBHOOK_SECRET`

---

## 12. SEO STRATEGY

Target keywords:
- "South Asian wedding photographer Toronto"
- "Indian wedding caterer Brampton"
- "Pakistani wedding DJ Mississauga"
- "mehndi artist GTA"
- "Indian wedding venue Toronto"
- "[category] + [city]" combinations

Each vendor page should have:
- Unique meta title: `[Vendor Name] — [Category] in [City] | Mela`
- Meta description with keywords
- Structured data (LocalBusiness schema)
- Category page: `/[city]/[category]` listing all vendors

---

## 13. NEXT PRIORITIES (as of March 2025)

1. **Scale vendors to 5,000+** — continue AI agent discovery for all 14 categories × 8 cities
2. **Fix Richmond Hill slug** — ensure all Richmond Hill vendors use `richmond-hill` (hyphenated)
3. **First 10 paying vendors** — close via Instagram DMs at $49/mo Founding rate
4. **SEO pages** — create `/toronto/photographers`, `/brampton/catering` etc. landing pages
5. **Website UX** — improve directory browsing: filters, search, map view
6. **Growth Co-Founder** — hand off Instagram + community work to co-founder using the Playbook doc
7. **Email sequences** — Resend automated follow-ups to all free-tier vendors → upgrade pitch
8. **Stripe live** — verify webhook, test subscription flow end-to-end
9. **Analytics** — set up vendor profile view tracking, lead tracking
10. **Vendor self-signup** — improve onboarding flow for vendors to claim/upgrade their listing

---

## 14. IMPORTANT NOTES FOR DEVELOPERS

- Always use `SUPABASE_SERVICE_ROLE_KEY` for server-side writes (not anon key)
- Always run inline scripts with: `node --input-type=module << 'EOF' ... EOF`
- Category IDs and City IDs are UUIDs — always look them up by slug
- When generating slugs: lowercase, replace spaces/specials with `-`, trim `-`
- Always deduplicate by slug AND name before inserting
- Insert in batches of 20 to avoid Supabase limits
- Richmond Hill city slug: `richmond-hill` (with hyphen)
- Kitchener-Waterloo city slug: `kitchener-waterloo`
- Free tier vendors make up the directory's SEO value — keep them listed even without payment

---

## 15. CO-FOUNDER DOCS

Two Word documents exist at `/Users/ishaansaini/Downloads/mela/`:

1. **`Mela_CoFounder_Playbook.docx`** — Growth & Community Co-Founder
   - Week 1 timeline, 90-day roadmap
   - Instagram setup + 30 copy-paste posts
   - TikTok strategy
   - Facebook groups outreach
   - WhatsApp scripts
   - Instagram DM scripts
   - Email outreach templates
   - Google Business Profile setup
   - Reddit posts
   - WeddingWire/The Knot listing
   - LinkedIn post
   - Partnership outreach
   - Weekly rhythm + KPIs

2. **`Mela_ThirdCoFounder_Playbook.docx`** — Operations & Vendor Success Co-Founder
   - Vendor onboarding workflow
   - Stripe subscription management
   - Vendor support scripts
   - Profile quality control
   - Partnership negotiations
   - Analytics & reporting rhythm

---

## 16. HOW TO CONTINUE SCALING THE DIRECTORY

To add more vendors via AI agent search, run this prompt with Claude:

> "Search Google, Yelp, WeddingWire, and Instagram for South Asian wedding [CATEGORY] in [CITY], Ontario, Canada. Find 20-30 real businesses with their name, phone, website, email, and Instagram. Return as a JavaScript array of objects with keys: name, category, city, email, phone, website, instagram, description."

Then use the bulk insert script from Section 5 above.

Repeat for each category × city combination. Priority:
- High: brampton, mississauga, toronto (largest South Asian populations)
- Medium: markham, vaughan, scarborough
- Lower: richmond-hill, kitchener-waterloo

---

## 17. HOW TO LOAD THIS CONTEXT IN A NEW CLAUDE CODE SESSION

At the start of any new session, run:
```
/read /Users/ishaansaini/Downloads/mela/CLAUDE.md
```
Or simply share this file and say: "Read this CLAUDE.md and use it as full context for the Mela project."

---

*This file is the single source of truth for the Mela platform. Keep it updated as the company grows.*
*Generated by Claude Code — Mela AI Ops System*
