/**
 * Template-driven SEO content for /category/[category]/[city] pages.
 *
 * Pure string interpolation — no DB queries, no AI. Returns editorial intro
 * paragraphs, FAQ items, and cross-link data that make these thin listing
 * pages rank on Google.
 */

// Category group mapping for varied intro templates
const PHOTO_VIDEO = new Set(['photographers', 'videographers', 'content-creators', 'photo-booths'])
const FOOD = new Set(['catering', 'sweets-mithai', 'cakes-desserts', 'favours-live-stations'])
const BEAUTY = new Set(['makeup-artists', 'mehndi-artists', 'hair-stylists', 'nail-artists', 'bridal-wear', 'jewellery', 'bridal-fitness'])
const ENTERTAINMENT = new Set(['djs-entertainment', 'dhol-players', 'sangeet-entertainment', 'baraat-entertainment'])

export function getIntroText(catSlug: string, catName: string, cityName: string): string {
  const lower = catName.toLowerCase()

  if (PHOTO_VIDEO.has(catSlug)) {
    return `Need a ${lower} who actually gets South Asian weddings in ${cityName}? Someone who knows the baraat, the pheras, the reception dances? Melaa has ${lower} across ${cityName} that families in the GTA already trust. Browse their work, compare a few, and message them for free.`
  }
  if (FOOD.has(catSlug)) {
    return `Good food makes or breaks a South Asian wedding. Whether it's biryani for 500 or a live pani puri counter, find ${lower} in ${cityName} who cook the dishes your guests actually want. Check menus, read what other families said, and reach out directly on Melaa.`
  }
  if (BEAUTY.has(catSlug)) {
    return `Find ${lower} in ${cityName} who know South Asian bridal styling inside and out. Heavy jewellery, dupatta draping, traditional or fusion looks. Browse portfolios from real weddings they've done and book with confidence.`
  }
  if (ENTERTAINMENT.has(catSlug)) {
    return `Good entertainment is what turns a wedding into a night people talk about for years. Find ${lower} in ${cityName} who know how to keep a Desi crowd on the dance floor from mehndi night to the last reception song.`
  }

  // Default (venues, planners, decor, florists, etc.)
  return `Planning a South Asian wedding in ${cityName}? Find ${lower} here who actually understand the culture and know what families in the GTA need. Browse profiles, compare a few, and reach out for free.`
}

export function getFaqs(catSlug: string, catName: string, cityName: string): { question: string; answer: string }[] {
  const lower = catName.toLowerCase()
  const faqs = [
    {
      question: `How much do ${lower} in ${cityName} charge for South Asian weddings?`,
      answer: `It depends on how many functions you're doing (mehndi, sangeet, ceremony, reception) and how experienced the vendor is. Most ${lower} in ${cityName} will put together a custom quote based on your event. Best bet is to message 2-3 on Melaa and compare.`,
    },
    {
      question: `How far in advance should I book a ${lower} in ${cityName}?`,
      answer: `If you're getting married between May and October, try to book 6 to 12 months out. The good ${lower} in ${cityName} fill up fast, especially for Saturday dates. Start reaching out early so you have options.`,
    },
    {
      question: `What should I look for when hiring a ${lower} for a South Asian wedding?`,
      answer: `Experience with Desi weddings is the big one. These events are multi-day with specific cultural traditions (baraat, pheras, mehndi, etc.) and not every vendor knows how to handle them. Ask if they've done weddings for your specific background (Punjabi, Gujarati, Tamil, Pakistani) and look at photos from those events.`,
    },
  ]

  if (PHOTO_VIDEO.has(catSlug)) {
    faqs.push({
      question: `Do ${lower} in ${cityName} offer multi-day wedding packages?`,
      answer: `Most do. A typical package covers the mehndi, sangeet, ceremony, and reception. Some also offer same-day edits, highlight reels, or drone coverage. Just ask when you message them on Melaa.`,
    })
  } else if (FOOD.has(catSlug)) {
    faqs.push({
      question: `Can ${lower} in ${cityName} handle dietary restrictions?`,
      answer: `Usually yes. Most South Asian wedding ${lower} here are used to vegetarian, vegan, Jain, halal, and gluten-free requirements. Bring it up during the tasting and they'll work with you.`,
    })
  } else {
    faqs.push({
      question: `Are ${lower} on Melaa verified?`,
      answer: `We review every vendor for quality. Verified vendors have confirmed their identity and business details. You can also filter by Featured or Premium vendors when browsing ${lower} in ${cityName}.`,
    })
  }

  return faqs
}

/** Build cross-link arrays from lists of all cities and categories. */
export function getCrossLinks(
  currentCatSlug: string,
  currentCitySlug: string,
  allCities: { slug: string; name: string }[],
  allCategories: { slug: string; name: string }[]
) {
  // Up to 6 other cities with the same category
  const sameCategoryOtherCities = allCities
    .filter(c => c.slug !== currentCitySlug)
    .slice(0, 6)

  // Up to 6 other categories in the same city
  const sameCityOtherCategories = allCategories
    .filter(c => c.slug !== currentCatSlug)
    .slice(0, 6)

  return { sameCategoryOtherCities, sameCityOtherCategories }
}
