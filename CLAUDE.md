# MELA — AI Agent Context File

## What This Project Is
Mela (mela.ca) is a South Asian wedding and event vendor discovery platform for the GTA (Greater Toronto Area), Canada. Think Yelp + WeddingWire, built specifically for the South Asian community.

## Business Model
- Vendors list for free (founding period), then pay $99–$299/month for premium placement
- Pay-per-lead: $20–$80 per verified buyer inquiry
- Featured placements: $200–$800/month
- Target: 200 paying vendors at $100/month avg = $20K MRR by Month 12

## Target Users
- BUYERS: South Asian families in GTA planning weddings ($30K–$100K budgets)
- VENDORS: South Asian wedding service providers (photographers, decorators, caterers, DJs, mandap rental, makeup artists, wedding planners, mehndi artists, bridal wear, videographers)

## Tech Stack
- Framework: Next.js 14 with App Router and TypeScript
- Styling: Tailwind CSS
- Database + Auth: Supabase (PostgreSQL)
- Deployment: Vercel
- Payments: Stripe
- Email: Resend
- Icons: lucide-react

## Key Design Principles
- Mobile-first (most users will be on phones)
- SEO is the #1 growth channel — every page needs proper meta tags, schema markup, and structured data
- Warm, culturally authentic tone — not corporate
- Fast loading: target LCP < 2.5s, use next/image for all images
- Brand colours: saffron #E8760A, ivory #FAFAF7, charcoal #1A1A1A
- Fonts: Playfair Display (headings) + Inter (body)

## File Structure
src/
  app/                    → Next.js App Router pages
    page.tsx              → Homepage
    vendors/page.tsx      → All vendors directory
    vendors/[slug]/       → Individual vendor profile
    category/[category]/  → Category pages (SEO)
    city/[city]/          → City pages (SEO)
    category/[cat]/[city]/→ Category+City combo pages (SEO goldmine)
    blog/                 → Blog posts
    list-your-business/   → Vendor signup
    pricing/              → Pricing page
    dashboard/            → Vendor dashboard (auth protected)
    admin/                → Admin panel (auth protected)
  components/
    ui/                   → Reusable UI components
    vendors/              → Vendor-specific components
    layout/               → Header, footer, nav
  lib/
    supabase/             → Supabase client setup
    stripe/               → Stripe helpers
    utils.ts              → Shared utilities
  types/
    index.ts              → TypeScript types for Vendor, Lead, Category, City

## Database Tables
- vendors (id, slug, name, email, phone, category_id, city_id, description, website, instagram, portfolio_images[], tier, is_verified, is_featured, is_active, stripe_customer_id)
- leads (id, vendor_id, buyer_name, buyer_email, buyer_phone, event_date, event_type, message, is_read)
- categories (id, slug, name, icon, description)
- cities (id, slug, name, province)

## Vendor Tiers
- free: basic listing, no leads
- basic: $99/month, priority placement, 10 leads/month
- premium: $249/month, featured placement, unlimited leads, analytics

## Category Slugs
photographers, videographers, decorators, catering, djs-entertainment, makeup-artists, mandap-rental, wedding-planners, bridal-wear, mehndi-artists

## City Slugs
brampton, mississauga, toronto, scarborough, markham, vaughan, richmond-hill, kitchener-waterloo

## Current Status
- [x] Next.js project created
- [x] Dependencies installed
- [x] Supabase project created
- [x] .env.local configured
- [ ] Database schema created in Supabase
- [ ] Homepage built
- [ ] Vendor directory built
- [ ] Vendor profile page built

## Naming Conventions
- Components: PascalCase (VendorCard.tsx)
- Utilities: camelCase (formatPhone.ts)
- Pages: lowercase with hyphens matching URL structure
- Database: snake_case

## DO NOT
- Use any paid external services unless listed in tech stack
- Add unnecessary complexity — keep it lean
- Use CSS modules — Tailwind only
- Use class components — hooks only
