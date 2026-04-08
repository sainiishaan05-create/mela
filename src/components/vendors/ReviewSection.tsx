'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'

interface Props {
  vendorId: string
  vendorName: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className="w-7 h-7 transition-colors duration-100"
            fill={(hover || value) >= i ? '#C8A96A' : 'none'}
            color={(hover || value) >= i ? '#C8A96A' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-[#FAFAF7] rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#F5ECD7] flex items-center justify-center text-sm font-bold text-[#C8A96A] shrink-0">
          {review.reviewer_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{review.reviewer_name}</p>
          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className="w-3.5 h-3.5" fill={i <= review.rating ? '#C8A96A' : 'none'} color={i <= review.rating ? '#C8A96A' : '#d1d5db'} />
          ))}
        </div>
      </div>
      {review.body && <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{review.body}&rdquo;</p>}
    </div>
  )
}

export default function ReviewSection({ vendorId, vendorName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [reviewsRes, supabase] = await Promise.all([
        fetch(`/api/client/reviews?vendorId=${vendorId}`),
        Promise.resolve(createClient()),
      ])
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) setName(u.email?.split('@')[0] ?? '')

      if (reviewsRes.ok) {
        const { reviews: list } = await reviewsRes.json()
        setReviews(list)
        if (u) setMyReview(list.find((r: Review) => r.user_id === u.id) ?? null)
      }
      setLoading(false)
    }
    load()
  }, [vendorId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/client/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, rating, body, reviewerName: name.trim() }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to submit review.')
      setSubmitting(false)
      return
    }

    const newReview: Review = {
      id: Date.now().toString(),
      user_id: user!.id,
      vendor_id: vendorId,
      rating,
      body: body || null,
      reviewer_name: name.trim(),
      created_at: new Date().toISOString(),
    }
    setReviews(prev => myReview
      ? prev.map(r => r.user_id === user!.id ? newReview : r)
      : [newReview, ...prev]
    )
    setMyReview(newReview)
    setShowForm(false)
    setSubmitted(true)
    setSubmitting(false)
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5" fill={i <= Math.round(avgRating) ? '#C8A96A' : 'none'} color={i <= Math.round(avgRating) ? '#C8A96A' : '#d1d5db'} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold px-4 py-2 rounded-full border border-[#C8A96A] text-[#C8A96A] hover:bg-[#F5ECD7] transition-colors"
          >
            {myReview ? 'Edit review' : '+ Write a review'}
          </button>
        )}
        {!user && (
          <a href="/login" className="text-sm font-semibold px-4 py-2 rounded-full border border-[#C8A96A] text-[#C8A96A] hover:bg-[#F5ECD7] transition-colors">
            Sign in to review
          </a>
        )}
      </div>

      {/* Success flash */}
      {submitted && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-xl mb-5 border border-green-100">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Your review has been posted. Thank you!
        </div>
      )}

      {/* Inline review form */}
      {showForm && (
        <form onSubmit={submit} className="bg-[#FAFAF7] rounded-2xl p-5 border border-gray-100 mb-6 space-y-4">
          <p className="font-semibold text-sm text-gray-700">
            {myReview ? `Update your review of ${vendorName}` : `Review ${vendorName}`}
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Your name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priya S."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Your experience <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Tell clients what it was like to work with this vendor..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-[#C8A96A] transition-colors resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#C8A96A] hover:bg-[#B8945A] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? 'Submitting…' : myReview ? 'Update review' : 'Post review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
          <div className="text-4xl mb-3">💬</div>
          <p className="font-semibold text-gray-700 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400">
            {user ? 'Be the first to share your experience!' : 'Sign in to leave the first review.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}
