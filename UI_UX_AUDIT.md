# Mela (melaa.ca) — UI/UX Design Audit
**Date:** March 2026
**Auditor:** UI/UX Design Agent
**Methodology:** Heuristic evaluation (Nielsen Norman Group 10 Usability Heuristics), conversion rate optimization best practices, WCAG 2.1 accessibility review.

---

## Executive Summary

Mela has a solid foundation: clean dark hero, consistent orange brand color (#E8760A), Playfair Display for headings, and a clear value proposition. The biggest gaps are: **no mobile navigation** (critical), **fake/placeholder ratings** that damage trust, **no search-in-header** on interior pages, **missing core directory flows** (no reviews system, no favorites, no comparison), and **VendorCard image areas** that communicate "placeholder" rather than "premium product."

---

## 1. Critical UX Issues

### 1.1 — No Mobile Navigation (CRITICAL — Severity: 5/5)

**File:** `/src/components/layout/Header.tsx`, lines 12–31
**Issue:** The `<nav>` block uses `hidden md:flex`, meaning on mobile there is zero navigation. The only mobile element is the "List Free" CTA button. Users on phones (the majority of wedding vendor searchers) have no way to navigate between Find Vendors, categories, or Pricing.

Per NNG heuristic #6 (Recognition rather than recall): users should not need to remember the URL structure to navigate.

**Current code (lines 12–31):**
```tsx
<nav className="hidden md:flex items-center gap-1 text-sm text-gray-600">
  ...nav links...
</nav>
```

**Fix:** Implement a hamburger menu. Full code change in Section 8 (Implementations).

---

### 1.2 — Fake Ratings Are a Trust Destroyer (CRITICAL — Severity: 5/5)

**File:** `/src/components/vendors/VendorCard.tsx`, lines 9–19
**File:** `/src/app/vendors/[slug]/page.tsx`, lines 13–22

Both `getRating()` and `getReviewCount()` generate deterministic-but-fake numbers from a hash of the vendor name. A vendor named "Patel Photography" always gets the same fake 4.7 rating and 83 fake reviews.

This is a dark pattern. When real users see "4.7 (83 reviews)" and click through to find "Reviews coming soon" (vendor profile page, line 173), it damages trust in the entire platform.

**Per NNG Heuristic #1 (Visibility of system status) and #4 (Consistency and standards):** Platforms like Google Maps and Yelp have trained users to treat review counts as real. Fake counts with no actual reviews is a conversion killer when discovered.

**Fix:**
- Remove the fake hash-based rating generation entirely.
- When `vendor.rating` is null, show "New" badge instead of fake stars.
- When `vendor.review_count` is 0 or null, show "Be the first to review" rather than a fabricated number.

```tsx
// VendorCard.tsx — replace getRating/getReviewCount with:
function hasRealRating(vendor: Vendor): boolean {
  return !!(vendor as any).rating && !!(vendor as any).review_count
}

// In the render, conditionally show:
{hasRealRating(vendor) ? (
  <div className="flex items-center gap-1.5 mb-2">
    {/* real stars */}
    <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
    <span className="text-xs text-gray-400">({reviews})</span>
  </div>
) : (
  <div className="mb-2">
    <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      New Vendor
    </span>
  </div>
)}
```

---

### 1.3 — Search Is Only on Homepage (Severity: 4/5)

**File:** `/src/components/layout/Header.tsx`, lines 33–36
**Issue:** The Search icon in the header is a `<Link href="/vendors">` — clicking it navigates to the vendor listing page but doesn't focus a search box. There is no inline search in the header on any page other than the homepage hero.

Users who arrive on a category page or vendor profile and want to search a different category have no path other than clicking the logo to go back to the homepage.

**Fix:** Add a compact search input to the Header, visible on all pages (collapsed on mobile, expanded inline on desktop):

```tsx
// In Header.tsx, replace the Search icon link with:
<form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 gap-2 focus-within:ring-2 focus-within:ring-[#E8760A] focus-within:border-transparent">
  <Search className="w-4 h-4 text-gray-400" />
  <input
    type="text"
    placeholder="Search vendors..."
    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-40"
  />
</form>
```

---

### 1.4 — Mobile Select for City Filter Is Not Touch-Friendly (Severity: 3/5)

**File:** `/src/app/vendors/page.tsx`, lines 155–171
**Issue:** The mobile city filter uses a raw `<select>` element with `onChange={() => window.location.href = url}`. Native selects are inconsistent across Android/iOS, render differently, and don't match the brand aesthetic. The `window.location.href` assignment also causes a full page reload.

**Fix:** Replace with a scrollable pill row (same pattern as the category pills above it, which already work well):

```tsx
// Wrap in a horizontally-scrollable div below the category pills on mobile:
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden border-t border-gray-50 pt-2 mt-2">
  <Link href={category ? `/vendors?category=${category}` : '/vendors'}
    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${!city ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600'}`}>
    All Cities
  </Link>
  {cities.map(c => (
    <Link key={c.slug}
      href={`/vendors?city=${c.slug}${category ? `&category=${category}` : ''}`}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${city === c.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
      {c.name}
    </Link>
  ))}
</div>
```

---

### 1.5 — The "Related Vendors" Query Is Not Actually Related (Severity: 3/5)

**File:** `/src/app/vendors/[slug]/page.tsx`, lines 53–58
**Issue:** The related vendors query fetches any 3 active vendors that aren't the current vendor:
```tsx
supabase.from('vendors').select(...).eq('is_active', true).neq('slug', slug).limit(3)
```
This means a user viewing a mehndi artist will see a caterer and a DJ as "More Vendors to Explore." It misses a significant cross-sell opportunity.

**Fix:** Filter related by `category_id` first, then fall back to same city:
```tsx
supabase
  .from('vendors')
  .select('*, category:categories(*), city:cities(*)')
  .eq('is_active', true)
  .eq('category_id', vendor.category_id)  // same category
  .neq('slug', slug)
  .limit(3)
```

---

### 1.6 — No "Back to Top" or Pagination on Vendors Page (Severity: 3/5)

**File:** `/src/app/vendors/page.tsx`
**Issue:** If there are 60+ vendors, users scroll a very long page with no pagination, infinite scroll, or back-to-top affordance. The sticky filter bar helps navigation but the page can get extremely long.

**Fix (short-term):** Add a fixed "Back to top" button that appears after 400px scroll:
```tsx
'use client'
// FloatingBackToTop.tsx
export function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
  if (!visible) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-[#E8760A] transition-colors">
      ↑
    </button>
  )
}
```

---

## 2. Mobile UX

### 2.1 — Hamburger Menu (CRITICAL)

Currently there is zero mobile navigation. The `<nav>` is `hidden md:flex`. On a 390px wide iPhone, the only visible header items are the Melaa logo and the "List Free" CTA. No way to navigate to Find Vendors, categories, or Pricing.

**Touch target assessment:**
- "List Free" button: `px-4 py-2` = ~36px tall. Slightly below Apple's 44pt minimum and Google's 48dp minimum. Should be `py-3` for proper touch targets.
- Trending search pills: `px-3 py-1.5` = ~30px tall. Too small for touch. Should be `py-2` minimum.

**Category pills on /vendors:** `px-4 py-2` = acceptable at ~36px. Fine.

**Implementation:** See Section 8.2 for the full hamburger menu code change applied to Header.tsx.

### 2.2 — Hero SearchBar Touch Target

**File:** `/src/components/ui/SearchBar.tsx`, line 29
The input is `py-3.5` (~46px) — good. The submit button is also `py-3.5` — good. SearchBar is mobile-friendly as-is.

### 2.3 — Trending Pill Touch Targets

**File:** `/src/app/page.tsx`, line 90
`px-3 py-1.5` renders at approximately 30px tall. Increase to `py-2` (32px) as a minimum. Ideally `py-2.5` (38px):

```tsx
// page.tsx line 90 — change py-1.5 to py-2.5
className="text-xs bg-white/10 hover:bg-[#E8760A]/20 border border-white/10 hover:border-[#E8760A]/40 text-gray-300 hover:text-[#E8760A] px-3 py-2.5 rounded-full transition-all"
```

---

## 3. VendorCard Improvements

**File:** `/src/components/vendors/VendorCard.tsx`

### Current Issues:
1. **Emoji placeholder** (line 38–40): A giant category emoji on an `orange-50 → amber-50 → rose-50` gradient communicates "no real photos here." Even Airbnb's early placeholder cards used a subtle pattern, not a centered emoji. It signals an MVP, not a premium marketplace.
2. **Fake ratings** (covered in §1.2 above): Must be removed.
3. **Typography hierarchy is flat**: Category label at 11px, vendor name at 15px with `font-bold`. The visual difference is too small. The name needs to be more dominant.
4. **"View Profile →" CTA is text-only**: The footer CTA (line 110) has no visual affordance. It's easy to miss.
5. **The `Website` indicator** (lines 113–117) is `text-[10px]` gray — nearly invisible and not useful to a browsing user.

### Recommended Fixes:

**3.1 — Replace emoji placeholder with structured image area:**
```tsx
// Replace the hero image div (lines 37-62) with:
<div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
  {vendor.cover_image ? (
    <img src={vendor.cover_image} alt={vendor.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm">
        {vendor.category?.icon ?? '🏪'}
      </div>
      <span className="text-[11px] font-medium text-orange-400/80 tracking-wide">No photos yet</span>
    </div>
  )}
  {/* badges stay the same */}
</div>
```

**3.2 — Improve typography hierarchy:**
```tsx
// Category label — add more color contrast
<p className="text-[10px] font-bold text-[#E8760A] uppercase tracking-widest mb-1">
  {vendor.category.name}
</p>

// Vendor name — bump to text-base (16px) with tighter line-height
<h3 className="font-[family-name:var(--font-playfair)] font-bold text-base text-gray-900 group-hover:text-[#E8760A] transition-colors leading-tight mb-2 line-clamp-1">
  {vendor.name}
</h3>
```

**3.3 — Improve footer CTA:**
```tsx
// Replace the "View Profile →" span (lines 109-118) with:
<div className="mt-auto pt-3 border-t border-gray-50">
  <div className="flex items-center justify-between">
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8760A] group-hover:gap-2.5 transition-all">
      View Profile <ChevronRight className="w-3.5 h-3.5" />
    </span>
    {vendor.website && (
      <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
        <Globe className="w-3 h-3" /> Website
      </span>
    )}
  </div>
</div>
```

---

## 4. Homepage Conversion

### 4.1 — CTA Placement Assessment

The hero follows a standard pattern: headline → subheadline → search bar → trending → two CTAs → social proof stats. This is sound. The primary CTA ("Browse X+ Vendors") is below the fold on some mobile devices due to the trending searches taking up vertical space.

**Issue:** The two CTA buttons (lines 96–105) appear AFTER 6 trending search pills. On a 390px device, the search input + 6 wrapping pill rows can push the CTA buttons below the fold entirely.

**Fix:** Swap the order — put CTA buttons immediately after the SearchBar, then trending searches below:
```tsx
{/* SearchBar */}
<div className="w-full max-w-2xl mx-auto mb-6">
  <SearchBar />
</div>

{/* PRIMARY CTA — now directly after search */}
<div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
  <Link href="/vendors" className="bg-[#E8760A] text-white font-bold px-8 py-4 rounded-full ...">
    Browse {vendorCount ?? 62}+ Vendors
  </Link>
  <Link href="/list-your-business" className="border border-white/40 ...">
    List Your Business Free →
  </Link>
</div>

{/* Trending — now secondary, below CTA */}
<div className="flex flex-wrap justify-center gap-2 mb-10">
  ...
</div>
```

### 4.2 — Stats Section

The stats at the bottom of the hero (lines 107–119) use `text-2xl font-bold` for the number. This is undersized for a stats block meant to convey credibility. Knot.com and WeddingWire use much larger numbers with subtle animations.

**Fix:** See Section 8.3 for implemented change.

### 4.3 — Hero Badge Copy

The "X Founding Vendor spots left" badge (line 63) is doing double duty — it's both scarcity for vendors AND visible to couples searching for vendors. Couples don't care about vendor spots. Consider conditionally showing different content based on user intent signals, or replace with a couple-facing trust signal:

```tsx
// Alternative badge for couples (show always):
<div className="inline-flex items-center gap-2 mb-6 bg-[#E8760A]/20 border border-[#E8760A]/40 text-[#E8760A] text-sm font-semibold px-4 py-2 rounded-full">
  <BadgeCheck className="w-4 h-4" /> GTA's #1 South Asian Wedding Directory
</div>
```

---

## 5. Search UX

**File:** `/src/components/ui/SearchBar.tsx`

### Current State:
The SearchBar is a single text input that routes to `/vendors?search=query`. It works, but it's a basic keyword search only.

### Issues:

**5.1 — No category/city disambiguation in the search bar**
Users searching "photographers in Brampton" get the keyword search. The search is a substring match on `name` and `description` (vendors/page.tsx lines 45–50). "photographers" might not appear in every photographer's description verbatim.

The search doesn't integrate with the category or city facets. A user who types "Brampton caterers" gets keyword results, not the same as `/vendors?category=catering&city=brampton`.

**Fix (ideal):** Add two dropdown selectors inline in the SearchBar for Category and City — transforming it from a text search to a structured search (like Zillow, Indeed):

```tsx
// Enhanced SearchBar with category + city dropdowns
export default function SearchBar({ categories, cities }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    router.push(`/vendors?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full shadow-lg overflow-hidden border border-white/20 focus-within:ring-2 focus-within:ring-[#E8760A]">
      <input type="text" value={query} onChange={e => setQuery(e.target.value)}
        placeholder="What are you looking for?"
        className="flex-1 px-5 py-4 text-gray-800 placeholder-gray-400 outline-none text-sm sm:border-r border-gray-100" />
      <select value={category} onChange={e => setCategory(e.target.value)}
        className="px-4 py-4 text-gray-600 bg-transparent outline-none text-sm border-b sm:border-b-0 sm:border-r border-gray-100">
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <select value={city} onChange={e => setCity(e.target.value)}
        className="px-4 py-4 text-gray-600 bg-transparent outline-none text-sm">
        <option value="">All Cities</option>
        {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <button type="submit"
        className="flex items-center justify-center gap-2 bg-[#E8760A] hover:bg-[#d06a09] text-white px-6 py-4 font-semibold text-sm transition-colors">
        <Search className="w-4 h-4" /> Search
      </button>
    </form>
  )
}
```

This requires passing `categories` and `cities` props from the homepage (they're already fetched there).

**5.2 — No search suggestions / autocomplete**
The input has no `aria-autocomplete`, no suggestions dropdown. For wedding vendors, users often don't know exact category names (is it "Mehndi Artists" or "Henna"?). Autocomplete with category + vendor name suggestions would dramatically improve discovery.

**5.3 — Empty search submits to /vendors without query param**
Lines 14–16: `if (trimmed)` blocks empty submissions, but there's no visible feedback when submitting empty. Add a shake animation or placeholder prompt.

---

## 6. Header Improvements

**File:** `/src/components/layout/Header.tsx`

### Current Issues:

**6.1 — No mobile navigation** (see §1.1 and §2.1 — CRITICAL)

**6.2 — Hard-coded category links will break when categories change**
Lines 16–26 hard-code `/category/photographers`, `/category/catering`, `/category/decorators`, `/category/mehndi-artists`. If a category slug changes in the database, these silently 404.

**Fix:** Fetch categories in the Header (it's a server component) and render dynamically — OR use a shared categories constant in `/lib/constants.ts`.

**6.3 — "List Free" CTA is the only visible mobile element**
It does double duty as the only navigable element on mobile. Its label "List Free" is targeted at vendors, not couples. Consider showing both a couple-facing action and a vendor CTA:

```tsx
// Mobile header could show:
<Link href="/vendors" className="md:hidden text-sm font-semibold text-gray-700 px-3 py-2">
  Find Vendors
</Link>
<Link href="/list-your-business" className="bg-[#E8760A] text-white text-sm font-semibold px-4 py-2 rounded-full">
  List Free
</Link>
```

**6.4 — No active state on nav links**
None of the nav links have an active state. Using `usePathname()` from `next/navigation` (or converting to a client component wrapper for nav), active links should be highlighted:

```tsx
// NavLink wrapper component:
'use client'
import { usePathname } from 'next/navigation'
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-[#E8760A]/10 text-[#E8760A]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#E8760A]'
      }`}>
      {children}
    </Link>
  )
}
```

**6.5 — Search icon in header navigates to /vendors, not a search**
Line 34: The `<Search>` icon is a link to `/vendors`. This violates NNG Heuristic #4 (Consistency and standards): a magnifying glass icon universally means "open search", not "navigate to a page." Users will expect a search overlay or inline search.

---

## 7. Missing Pages and Flows

These are the most significant gaps for a directory product:

### 7.1 — No Favorites / Shortlist Feature
Wedding planning involves comparing multiple vendors over weeks. There is no way for a couple to save vendors to a shortlist. Competitors like WeddingWire and Zola have this as a core feature.

**Minimum viable implementation:**
- `localStorage`-based favorites (no auth required)
- A `/my-list` page showing saved vendors
- Heart icon on each VendorCard

### 7.2 — No Comparison Feature
Users comparing 3 photographers can't see them side-by-side. A compare page at `/compare?ids=slug1,slug2,slug3` with a feature-grid table would directly increase conversion to inquiry.

### 7.3 — No Review/Testimonial Submission Flow
The vendor profile shows "Reviews coming soon" (slug/page.tsx line 173). There is no path for past clients to leave a review. This is the most critical missing flow — the fake hash-based ratings will remain an issue until real reviews exist.

**Minimum implementation:**
- `/vendors/[slug]/review` page with a form: stars, text, name, wedding date
- Admin approval queue before publishing
- Email notification to vendor on new review

### 7.4 — No "Contact Sent" Confirmation
The `LeadForm` component presumably submits an inquiry, but there is no visible success state on the vendor profile page after submission. Users have no confirmation their message was sent.

### 7.5 — No Category Pages (only redirects)
`/category/[slug]` likely redirects to `/vendors?category=slug`. A proper category landing page with:
- Category hero (e.g., "South Asian Wedding Photographers in GTA")
- Category-specific buying guide content
- SEO-optimized H1 and description
...would significantly improve organic search traffic for high-intent keywords like "South Asian wedding photographers Toronto."

### 7.6 — No City Pages
Same issue as above for `/city/[slug]`. City pages with unique H1s and content are one of the highest-ROI SEO moves for a local directory.

### 7.7 — No Vendor Dashboard (listed in Footer)
The footer links to `/dashboard` but this page may not exist yet. Vendors have no self-service way to update their profile, view lead stats, or upload portfolio photos. This is a retention risk.

### 7.8 — No 404 Page
There is no custom `not-found.tsx` in the app root. Next.js default 404 breaks the brand experience.

### 7.9 — No About / Blog Page
Trust-building content ("who built Mela", "our story", "South Asian wedding planning tips") is missing. First-time visitors who are skeptical of a new directory have no way to learn who is behind it.

---

## 8. Implementations: Top 3 Highest-Impact Changes

---

### 8.1 — VendorCard: Premium Placeholder & Typography

See implemented changes in `/src/components/vendors/VendorCard.tsx`:
- Structured placeholder with icon in white pill instead of raw emoji
- "No photos yet" subtext sets expectations honestly
- Playfair Display font on vendor name for premium feel
- Animated chevron on "View Profile" CTA
- `Globe` icon imported for Website indicator

---

### 8.2 — Header: Mobile Hamburger Menu

See implemented changes in `/src/components/layout/Header.tsx`:
- State-managed open/close toggle
- Full-screen slide-down menu on mobile with all nav links
- Touch targets minimum 48px tall (py-3)
- Close button (X) in menu header
- Backdrop overlay to close on outside tap
- Hamburger converts to X icon when open (standard pattern per NNG)
- `'use client'` directive added since state is needed
- The desktop nav remains unchanged

---

### 8.3 — Homepage Hero Stats: More Impactful

See implemented changes in `/src/app/page.tsx`:
- Stats section redesigned from flat flex row to a grid with vertical dividers
- Added descriptive micro-copy below each stat label
- Increased number size to `text-3xl` on mobile, `text-4xl` on md
- Added subtle background card treatment for each stat
- Stat items now have a top accent line in brand orange

---

## Appendix: Quick Wins (1–2 hour fixes each)

| Fix | File | Effort | Impact |
|-----|------|--------|--------|
| Increase CTA button `py-2` → `py-3` in Header | Header.tsx:39 | 5 min | Medium |
| Increase trending pill `py-1.5` → `py-2.5` | page.tsx:90 | 5 min | Medium |
| Add `rel="noopener noreferrer"` to all external links | Multiple | 15 min | Low (security) |
| Add `loading="lazy"` to portfolio images | [slug]/page.tsx:159 | 5 min | Low (perf) |
| Fix related vendors query to filter by category | [slug]/page.tsx:53 | 10 min | High |
| Add `scrollbar-hide` utility if not already in tailwind config | globals.css | 5 min | Low |
| Wrap fake rating logic behind feature flag | VendorCard.tsx | 30 min | High (trust) |
| Add `aria-label` to hamburger button | Header.tsx | 5 min | Low (a11y) |
| Add `lang="en"` to `<html>` in layout | layout.tsx | 2 min | Low (a11y) |
| Footer copyright: use static year or server value | Footer.tsx:39 | 5 min | Low |

---

*Audit complete. Implementations of items 8.1, 8.2, and 8.3 follow directly in the edited source files.*
