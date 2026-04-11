import Link from 'next/link'

interface CrossLinksProps {
  categorySlug: string
  categoryName: string
  citySlug: string
  cityName: string
  sameCategoryOtherCities: { slug: string; name: string }[]
  sameCityOtherCategories: { slug: string; name: string }[]
}

export default function CrossLinks({
  categorySlug,
  categoryName,
  citySlug,
  cityName,
  sameCategoryOtherCities,
  sameCityOtherCategories,
}: CrossLinksProps) {
  if (!sameCategoryOtherCities.length && !sameCityOtherCategories.length) return null

  return (
    <section className="mt-12 space-y-6">
      {sameCategoryOtherCities.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>
            {categoryName} in other cities
          </p>
          <div className="flex flex-wrap gap-2">
            {sameCategoryOtherCities.map(c => (
              <Link
                key={c.slug}
                href={`/category/${categorySlug}/${c.slug}`}
                className="px-3.5 py-2 rounded-full text-xs font-medium border transition-colors hover:border-[#C8A96A]/50 hover:text-[#C8A96A]"
                style={{ borderColor: 'var(--color-taupe)', color: 'var(--color-text-muted)' }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {sameCityOtherCategories.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>
            Other vendors in {cityName}
          </p>
          <div className="flex flex-wrap gap-2">
            {sameCityOtherCategories.map(c => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}/${citySlug}`}
                className="px-3.5 py-2 rounded-full text-xs font-medium border transition-colors hover:border-[#C8A96A]/50 hover:text-[#C8A96A]"
                style={{ borderColor: 'var(--color-taupe)', color: 'var(--color-text-muted)' }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
