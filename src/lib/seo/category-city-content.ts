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
    return `Looking for a ${lower} who truly understands South Asian weddings in ${cityName}? From the baraat entrance to the final reception dance, Melaa connects you with experienced ${lower} who know every ritual, every emotion, and every angle. Browse portfolios, compare styles, and send free inquiries — no signup required.`
  }
  if (FOOD.has(catSlug)) {
    return `Food is the heart of every South Asian celebration. Whether you need a full biryani spread, a pani puri live station, or a custom mithai display, Melaa helps you find trusted ${lower} in ${cityName} who specialise in the flavours your family loves. Browse menus, read reviews, and reach out directly.`
  }
  if (BEAUTY.has(catSlug)) {
    return `Your look sets the tone for the entire celebration. Find experienced ${lower} in ${cityName} who specialise in South Asian bridal and wedding styling — from traditional looks with heavy jewellery and dupatta draping to modern fusion aesthetics. Compare portfolios and book with confidence through Melaa.`
  }
  if (ENTERTAINMENT.has(catSlug)) {
    return `The right entertainment transforms a wedding from a gathering into a celebration your guests will talk about for years. Melaa connects you with the best ${lower} in ${cityName} who know how to keep a South Asian crowd on the dance floor from the mehndi night to the reception.`
  }

  // Default (venues, planners, decor, florists, etc.)
  return `Planning a South Asian wedding in ${cityName}? Melaa connects you with trusted, culturally experienced ${lower} serving ${cityName} and the Greater Toronto Area. Browse verified vendors, compare options, and send free inquiries — all in one place.`
}

export function getFaqs(catSlug: string, catName: string, cityName: string): { question: string; answer: string }[] {
  const lower = catName.toLowerCase()
  const faqs = [
    {
      question: `How much does a South Asian wedding ${lower} in ${cityName} cost?`,
      answer: `Pricing varies based on the vendor's experience, the scope of your event, and the number of functions (mehndi, sangeet, ceremony, reception). Most ${lower} in ${cityName} offer customisable packages. We recommend reaching out to 2-3 vendors on Melaa to compare quotes — it's free.`,
    },
    {
      question: `How far in advance should I book a ${lower} in ${cityName}?`,
      answer: `For peak wedding season (May-October), we recommend booking your ${lower} at least 6-12 months in advance. Popular vendors in ${cityName} fill up quickly, especially for Saturday dates. Send your inquiries early through Melaa to secure your preferred vendor.`,
    },
    {
      question: `What should I look for when hiring a ${lower} for a South Asian wedding?`,
      answer: `Look for experience with South Asian weddings specifically — the events are multi-day, have unique cultural elements, and require a vendor who understands traditions like the baraat, mehndi, and various ceremony rituals. Check their portfolio for past South Asian weddings, read reviews, and ask about their experience with your specific cultural background (Punjabi, Gujarati, Tamil, Pakistani, etc.).`,
    },
  ]

  // Add a category-specific FAQ
  if (PHOTO_VIDEO.has(catSlug)) {
    faqs.push({
      question: `Do ${lower} in ${cityName} offer packages for multi-day South Asian weddings?`,
      answer: `Yes, most experienced South Asian wedding ${lower} in ${cityName} offer multi-day packages covering the mehndi, sangeet, ceremony, and reception. Some include same-day edits, highlight reels, or drone coverage as add-ons. Ask vendors on Melaa about their multi-event pricing.`,
    })
  } else if (FOOD.has(catSlug)) {
    faqs.push({
      question: `Can ${lower} in ${cityName} accommodate dietary restrictions?`,
      answer: `Most South Asian wedding ${lower} in ${cityName} are experienced with vegetarian, vegan, Jain, halal, and gluten-free requirements. Discuss your specific needs during the tasting consultation. On Melaa, you can message vendors directly to confirm dietary accommodations.`,
    })
  } else {
    faqs.push({
      question: `Are ${lower} on Melaa verified?`,
      answer: `All vendors on Melaa are reviewed for quality. Verified vendors have confirmed their identity and business details. Featured and Premium vendors have additional trust signals. You can filter by verification status when browsing ${lower} in ${cityName}.`,
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
