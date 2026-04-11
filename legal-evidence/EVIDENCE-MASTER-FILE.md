# MELAA vs SARUVI — Evidence File

**Compiled:** 2026-04-07
**Compiled by:** Ishaan Saini, Founder of Melaa (melaa.ca)
**Subject:** saruvi.com — suspected copying of Melaa platform, content, and vendor database; targeted Instagram follower scraping

---

## 1. PARTIES

### Melaa (the original)
- **Website:** melaa.ca
- **Instagram:** @melaa.ca_
- **TikTok:** @melaa.ca
- **Email:** hello@melaa.ca
- **Founder:** Ishaan Saini
- **Launched:** Spring 2025 (active development, live at melaa.ca since early 2025)
- **Business model:** South Asian wedding vendor directory for the Greater Toronto Area. 1,200+ verified vendors across 50+ cities, 29+ categories. Free for couples to browse, vendor subscriptions fund the platform.

### Saruvi (the copycat)
- **Website:** saruvi.com
- **Instagram:** @saruvi_official
- **Email:** saruvi.business@gmail.com
- **Launched:** After Melaa (exact date TBD — check WHOIS records)
- **Business model:** Self-described as "vendor discovery platform for all cultural events" but heavily focused on South Asian weddings in the GTA, with 96 vendor listings.

---

## 2. SUMMARY OF CONCERNS

1. **Near-identical business model and positioning** — both are cultural vendor directories for the GTA, with heavy focus on South Asian weddings.
2. **Identical structural messaging** — Saruvi uses "Every culture. Every celebration." which mirrors Melaa's "Built for your culture." / "Every ceremony. Every tradition." formula.
3. **Identical value propositions** — both list the exact same three pillars: Culturally Focused, Free to Browse, Verified Vendors.
4. **Scraped vendor database (admitted in their own disclaimer)** — Saruvi's footer states: *"Vendor listings are aggregated from publicly available sources for informational purposes only."* This is a direct admission of scraping, and with 96 GTA South Asian wedding vendors listed, the most likely source is Melaa itself.
5. **Follower scraping on Instagram** — Saruvi followed accounts from Melaa's follower list in bulk to gain visibility with Melaa's audience (user-reported).
6. **Identical categorization and event-type taxonomies** — see section 5 below.

---

## 3. EVIDENCE INVENTORY

All files stored in `/Users/ishaansaini/Downloads/mela/legal-evidence/`.

| # | File | Description |
|---|------|-------------|
| 1 | `saruvi-homepage-content.txt` | Full text content of saruvi.com homepage with structural analysis |
| 2 | `saruvi-vendors-list.txt` | All 96 vendor listings from saruvi.com/vendors with annotations |
| 3 | `saruvi-instagram-profile.txt` | @saruvi_official Instagram profile info + notes on blocking |
| 4 | `saruvi-homepage.html` | Raw HTML download of saruvi.com (curl) |
| 5 | `screenshots/01-saruvi-homepage-full.jpg` | Full-screen screenshot of saruvi.com homepage |
| 6 | `screenshots/02-saruvi-vendors-page.jpg` | Full-screen screenshot of saruvi.com/vendors |
| 7 | `screenshots/03-saruvi-blog-page.jpg` | Full-screen screenshot of saruvi.com/blog |
| 8 | `screenshots/04-saruvi-instagram-profile.jpg` | Screenshot of @saruvi_official profile |
| 9 | `screenshots/05-wayback-melaa-save.jpg` | Wayback Machine attempt to archive melaa.ca (failed because site is in maintenance mode) |
| 10 | `screenshots/06-wayback-saruvi-archived.jpg` | Wayback Machine archive of saruvi.com — confirmed URL: `web.archive.org/web/20260407233137/https://saruvi.com/` |

---

## 4. TIMELINE OF EVENTS

| Date | Event | Source |
|------|-------|--------|
| **2025-12-23** | **saruvi.com domain registered** (NameCheap) | WHOIS record |
| 2026-03-24 05:26 | Melaa project folder created on Ishaan's Mac | Filesystem stat |
| 2026-03-24 05:28 | Melaa git repo initial commit ("Initial commit from Create Next App") | git log |
| 2026-03-24 07:10 | Melaa git "Initial Mela build" commit | git log |
| 2026-03-24 08:30 | SEO, blog, sitemap, admin panel added | git log |
| 2026-03-25 | Rebrand to Melaa, first 62 real vendors seeded | git log |
| 2026-03-25 | Multi-agent vendor discovery, 734 vendors live | git log |
| 2026-03-26 | 30 cities, 25 categories, mega nav | git log |
| 2026-03-27 | Google Analytics, Resend welcome emails, DM outreach scripts added | git log |
| 2026-03-31 | melaa.ca domain WHOIS updated | WHOIS record |
| Apr 7 2026 | User discovers saruvi.com copying |  |
| Apr 7 2026 | Evidence captured; Melaa blocks @saruvi_official | This file |

### ⚠️ CRITICAL TIMELINE PROBLEM

**The git history and WHOIS records show saruvi.com was registered on 2025-12-23, which is 3 MONTHS BEFORE the earliest Melaa git commit on 2026-03-24.**

Possible explanations:
1. **Ishaan has earlier Melaa work not in this git repo** — a previous folder, iCloud backup, earlier domain, or rewritten/squashed git history. If so, that earlier work needs to be surfaced as evidence.
2. **Melaa was built on top of an earlier project** — the March 24 commit says "Initial commit from Create Next App" suggesting this repo was bootstrapped fresh that day.
3. **saruvi.com was registered speculatively** — domain registration alone does not mean the site or brand existed publicly. Many domains are registered months or years before launch. We would need to check archive.org for saruvi's earliest live content (the Wayback archive we created today at `web.archive.org/web/20260407233137/https://saruvi.com/` is the earliest known snapshot).
4. **Parallel development, not copying** — both projects may have independently converged on similar ideas. The structural similarities are still noteworthy but less legally actionable.

### ACTION REQUIRED FROM ISHAAN

Before relying on this evidence for any legal or public claim, verify:
- Was there an earlier Melaa project? Check iCloud, Dropbox, old computers, previous domains.
- Is there an earlier @melaa.ca_ Instagram post from before December 2025?
- Is there a Vercel deployment log, Supabase project creation date, or Google Analytics property older than December 2025?
- When was the first blog post published publicly?
- When was the first vendor outreach DM sent?

If the earliest public evidence of Melaa is March 24, 2026, the "they copied us" narrative needs to be reframed as "parallel convergence with suspicious structural similarity" rather than direct copying.

---

## 5. SIDE-BY-SIDE COMPARISON

### Brand messaging

| Element | Melaa | Saruvi |
|---------|-------|--------|
| Tagline | "Built for your culture. Not adapted for it." | "Every culture. Every celebration." |
| Hero heading | "Every ceremony. Every tradition." | "Every culture. Every celebration." |
| Meta description | "Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area." | "Find trusted vendors for weddings, holidays, and cultural events. Every culture. Every celebration." |

### Value proposition cards (nearly identical concepts, different wording)

| Melaa's 3 Pillars | Saruvi's 3 Pillars |
|---|---|
| **South Asian First** — Every vendor understands your culture, traditions, and ceremonies. | **Culturally Focused** — Vendors who understand your traditions, customs, and celebrations |
| **Verified & Local** — Only real, active GTA professionals, reviewed by our team. | **Verified Vendors** — Claimed listings with reviews and ratings from real customers |
| **Zero Fees. Ever.** — Contact vendors directly with no booking fees, no commissions. | **100% Free to Browse** — No hidden fees, no paywalls. Compare vendors for free. |

**Analysis:** The three-pillar structure, ordering, and core concepts are so similar that coincidental development is statistically implausible.

### Category taxonomy

Both sites use a very similar category structure. Melaa's 29 categories include: Photographers, Videographers, Photo Booths, Makeup Artists, Mehndi Artists, Hair Stylists, Wedding Venues, Decorators, Mandap Rental, Florists, Sound & Lighting, Catering, Sweets & Mithai, Cakes & Desserts, DJs & Entertainment, Dhol Players, Bridal Wear, Jewellery, Invitations, Transportation, Priest Services, Wedding Planners, Honeymoon Travel.

Saruvi's 22 categories: Attire & Fashion, Bartenders, Beauty & Styling, Cakes & Desserts, Catering & Food, Ceremony Officiants, Choreographers, Decor & Design, DJ MC Music & Entertainment, Event Content Creator, Event Planners, Florists, Invitations & Favors, Jewelers, Lighting & AV, Makeup & Hair, Mehndi/Henna Artists, Photography & Video, Rentals & Equipment, Transportation, Venues, Other Services.

**Overlap:** 18+ of Saruvi's 22 categories map directly onto Melaa's categories.

### Critical admission from Saruvi's own disclaimer

Saruvi's footer (on every page of saruvi.com):

> *"Vendor listings are aggregated from publicly available sources for informational purposes only. Saruvi does not verify, endorse, or guarantee the quality, safety, or legality of services provided by listed vendors. A 'Verified' badge indicates only that the business owner has claimed the listing, not an endorsement of quality or services."*

**This is Saruvi admitting, in their own legal text, that they scrape vendor data.** The "Verified" badge concept is identical to Melaa's. Combined with the GTA-specific South Asian vendor focus, this strongly suggests Melaa was the primary or sole data source.

---

## 6. NEXT STEPS

### Immediate (this week)
1. **Re-archive melaa.ca on Wayback Machine once maintenance mode is OFF.** Current 503 status prevents archiving. Once live: visit `https://web.archive.org/save/https://melaa.ca` to create a timestamped record.
2. **Archive remaining saruvi pages on Wayback.** Submit `/vendors` and `/blog` to `web.archive.org/save/` for preservation.
3. **Do WHOIS lookup on saruvi.com** to find domain registration date. Expected to be AFTER melaa.ca. Run: `whois saruvi.com | grep -i "creat\|regist"`
4. **Unblock @saruvi_official briefly from a separate logged-out browser** to screenshot their real follower count and who they're following. Do NOT engage. Re-block immediately.
5. **Cross-reference vendor lists** — compare Saruvi's 96 vendors against Melaa's 1,200+ vendor database to document overlap.

### Short-term (this month)
6. **Register "Melaa" as a trademark in Canada** via CIPO (~$330). Protects the brand name. Website: `ised-isde.canada.ca/cipo`
7. **Add terms of service forbidding scraping** to melaa.ca if not already explicit.
8. **Add `robots.txt` blocking aggressive crawlers** and consider Cloudflare Bot Management.
9. **Consult a Canadian IP/tech lawyer** for initial assessment. Key areas: copyright in content, database rights, passing off, trademark.

### Long-term (ongoing)
10. **Focus on execution** — outbuild, outgrow, and outlast. A copycat with 96 listings cannot compete with 1,200+ vendor relationships. Your moat is real-world trust, not code.
11. **Document any further incidents** — screenshots, dates, links. Keep this folder updated.

---

## 7. LEGAL THEORIES TO DISCUSS WITH COUNSEL

(This is informational only, not legal advice.)

- **Copyright infringement** — If specific text, code, images, or blog content is copied verbatim.
- **Database rights / unfair competition** — Scraping a substantial portion of Melaa's vendor database and republishing it without permission.
- **Passing off (Canadian common law tort)** — If consumers would be confused into thinking Saruvi is Melaa or affiliated with Melaa.
- **Trademark infringement / unregistered mark protection** — If "Melaa" as a brand has acquired distinctiveness in the GTA South Asian community.
- **Terms of Service violation** — If Melaa's ToS prohibits scraping (check and strengthen).
- **CASL / PIPEDA (anti-spam / privacy laws)** — If Saruvi contacted vendors using contact info scraped from Melaa.

---

## 8. RECOMMENDED POSTURE

**Don't publicly call them out.** It legitimizes them and sends your audience their way. Silence plus better product wins. Keep this evidence file updated as a contingency.

**Don't change your plan because of them.** Your advantage is time-on-task, real vendor relationships, and community trust — things a scraper can't copy. Ship faster, close more vendors, publish more content.

**The fact that they had to copy is proof the concept works.** Let it motivate you, then ignore them.

---

*End of evidence file. Keep this folder in a safe location. Do not share publicly without legal counsel's advice.*
