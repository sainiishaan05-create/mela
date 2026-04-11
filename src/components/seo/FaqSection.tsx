'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

export default function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <section className="mt-14 mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border transition-colors"
              style={{ borderColor: isOpen ? 'rgba(200,169,106,0.3)' : 'var(--color-taupe)' }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-3 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--color-gold-dark)' }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{ maxHeight: isOpen ? '300px' : '0' }}
              >
                <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#8A7B74' }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
