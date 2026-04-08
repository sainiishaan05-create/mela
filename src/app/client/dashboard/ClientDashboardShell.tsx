'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Star, User, Trash2, ExternalLink, Search } from 'lucide-react'
import type { Review, SavedVendor } from '@/types'
import LogoutButton from '@/components/ui/LogoutButton'

type Tab = 'saved' | 'reviews' | 'account'

interface Props {
  userEmail: string
  initialSaved: SavedVendor[]
  initialReviews: Review[]
  hasVendorListing?: boolean
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className="w-3.5 h-3.5" fill={i <= rating ? '#C8A96A' : 'none'} color={i <= rating ? '#C8A96A' : '#d1d5db'} />
      ))}
    </div>
  )
}

export default function ClientDashboardShell({ userEmail, initialSaved, initialReviews, hasVendorListing }: Props) {
  const [tab, setTab] = useState<Tab>('saved')
  const [saved, setSaved] = useState<SavedVendor[]>(initialSaved)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  async function unsave(vendorId: string) {
    setSaved(prev => prev.filter(s => s.vendor_id !== vendorId))
    await fetch('/api/client/saved-vendors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    })
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'saved',   label: 'Saved Vendors', icon: Heart,   count: saved.length },
    { id: 'reviews', label: 'My Reviews',     icon: Star,    count: reviews.length },
    { id: 'account', label: 'Account',        icon: User },
  ]

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex gap-8">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-3">
          {/* Identity */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/15 flex items-center justify-center text-xl font-bold text-[#C8A96A] mb-3 font-[family-name:var(--font-playfair)]">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-sm text-[#2B2623] truncate">{userEmail}</p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F5ECD7] text-[#C8A96A]">
              Client Account
            </span>
            {hasVendorListing ? (
              <Link href="/dashboard" className="mt-3 block text-[11px] font-semibold text-[#C8A96A] hover:underline">
                → Switch to vendor dashboard
              </Link>
            ) : (
              <Link href="/list-your-business" className="mt-3 block text-[11px] font-semibold text-[#C8A96A] hover:underline">
                Run a business? List free →
              </Link>
            )}
          </div>

          {/* Nav */}
          <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col gap-0.5">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  tab === id ? 'bg-[#C8A96A]/12 text-[#2B2623]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${tab === id ? 'text-[#C8A96A]' : ''}`} />
                <span className="flex-1 text-left">{label}</span>
                {count !== undefined && count > 0 && (
                  <span className="bg-[#C8A96A]/15 text-[#C8A96A] text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {count}
                  </span>
                )}
              </button>
            ))}
            <div className="h-px bg-gray-100 my-1" />
            <Link href="/vendors" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all">
              <Search className="w-4 h-4 shrink-0" />
              Browse Vendors
            </Link>
            <LogoutButton
              label="Log Out"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
            />
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === id ? 'bg-[#C8A96A] text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count !== undefined && count > 0 && <span className="ml-0.5">({count})</span>}
              </button>
            ))}
          </div>

          {/* ── SAVED VENDORS ── */}
          {tab === 'saved' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Saved Vendors</h1>
                <p className="text-gray-500 text-sm mt-0.5">Your private shortlist of vendors you love.</p>
              </div>

              {saved.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">🤍</div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-gray-800 mb-2">No saved vendors yet</h2>
                  <p className="text-gray-500 text-sm mb-6">Browse vendors and tap the heart button to save your favourites here.</p>
                  <Link href="/vendors" className="inline-flex items-center gap-2 bg-[#C8A96A] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#B8945A] transition-colors">
                    <Search className="w-4 h-4" />
                    Browse Vendors
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {saved.map(sv => {
                    const v = sv.vendor
                    if (!v) return null
                    const cover = v.portfolio_images?.[0]
                    return (
                      <div key={sv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        {/* Cover */}
                        <div className="relative h-36 bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt={v.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">{v.category?.icon ?? '🏪'}</div>
                          )}
                          <button
                            onClick={() => unsave(sv.vendor_id)}
                            title="Remove from saved"
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow transition-colors group"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                          {v.category && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-1">{v.category.name}</p>
                          )}
                          <h3 className="font-[family-name:var(--font-playfair)] font-bold text-base text-[#2B2623] leading-snug mb-1">{v.name}</h3>
                          {v.city && <p className="text-xs text-gray-400 mb-3">{v.city.name}, ON</p>}
                          <Link
                            href={`/vendors/${v.slug}`}
                            className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#C8A96A] hover:text-[#B8945A] transition-colors"
                          >
                            View Profile <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── MY REVIEWS ── */}
          {tab === 'reviews' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">My Reviews</h1>
                <p className="text-gray-500 text-sm mt-0.5">Reviews you&apos;ve left for vendors.</p>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">✍️</div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-gray-800 mb-2">No reviews yet</h2>
                  <p className="text-gray-500 text-sm mb-6">Visit a vendor&apos;s profile and share your experience to help other clients.</p>
                  <Link href="/vendors" className="inline-flex items-center gap-2 bg-[#C8A96A] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#B8945A] transition-colors">
                    Browse Vendors
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          {r.vendor && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{r.vendor.category?.icon ?? '🏪'}</span>
                              <Link href={`/vendors/${r.vendor.slug}`} className="font-semibold text-[#2B2623] hover:text-[#C8A96A] transition-colors text-sm">
                                {r.vendor.name}
                              </Link>
                            </div>
                          )}
                          <StarRow rating={r.rating} />
                        </div>
                        <p className="text-xs text-gray-400 shrink-0">
                          {new Date(r.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {r.body && <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{r.body}&rdquo;</p>}
                      {r.vendor && (
                        <Link href={`/vendors/${r.vendor.slug}`} className="inline-flex items-center gap-1 text-xs text-[#C8A96A] font-medium mt-3 hover:underline">
                          Edit review on vendor page <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {tab === 'account' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Account</h1>
                <p className="text-gray-500 text-sm mt-0.5">Your Melaa account details.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email address</p>
                  <p className="text-sm font-medium text-[#2B2623]">{userEmail}</p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Account type</p>
                  <p className="text-sm font-medium text-[#2B2623]">Client / Client</p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</p>
                  <Link href="/forgot-password" className="text-sm text-[#C8A96A] font-medium hover:underline">
                    Reset password →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F7F5F2] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#C8A96A] font-[family-name:var(--font-playfair)]">{saved.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Saved vendors</p>
                  </div>
                  <div className="bg-[#F7F5F2] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#C8A96A] font-[family-name:var(--font-playfair)]">{reviews.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Reviews written</p>
                  </div>
                </div>
              </div>

              <LogoutButton
                label="Sign out"
                className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors px-1"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
