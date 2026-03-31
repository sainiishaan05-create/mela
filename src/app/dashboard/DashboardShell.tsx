'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, format, subWeeks, startOfWeek } from 'date-fns'
import {
  LayoutDashboard, User, ImageIcon, Mail, BarChart2, CreditCard,
  ExternalLink, LogOut, BadgeCheck, Upload, X, Loader2, Check,
  ArrowRight, Phone, Globe, AtSign, MapPin, Tag, ChevronRight,
  AlertCircle, Eye, TrendingUp, Star, Pencil, CheckCircle,
} from 'lucide-react'
import type { Vendor, Category, City, Lead } from '@/types'

type Tab = 'overview' | 'profile' | 'photos' | 'inquiries' | 'analytics' | 'subscription'

interface Props {
  vendor: Vendor & { category: Category | null; city: City | null }
  leads: Lead[]
  categories: Category[]
  cities: City[]
  justClaimed?: boolean
  userId: string
}

// ── Profile completeness ─────────────────────────────────────────────────────
function completeness(v: Vendor): { score: number; missing: string[] } {
  const checks: { label: string; ok: boolean; weight: number }[] = [
    { label: 'Business name', ok: !!v.name, weight: 10 },
    { label: 'Email address', ok: !!v.email, weight: 10 },
    { label: 'Phone number', ok: !!v.phone, weight: 10 },
    { label: 'Description (50+ chars)', ok: (v.description?.length ?? 0) >= 50, weight: 20 },
    { label: 'Website', ok: !!v.website, weight: 15 },
    { label: 'Instagram', ok: !!v.instagram, weight: 10 },
    { label: 'Portfolio photos', ok: (v.portfolio_images?.length ?? 0) > 0, weight: 25 },
  ]
  const score = checks.filter(c => c.ok).reduce((s, c) => s + c.weight, 0)
  const missing = checks.filter(c => !c.ok).map(c => c.label)
  return { score, missing }
}

// ── Analytics helpers ────────────────────────────────────────────────────────
function weeklyLeads(leads: Lead[]) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 7 - i))
    const end = startOfWeek(subWeeks(new Date(), 6 - i))
    return {
      label: format(start, 'MMM d'),
      count: leads.filter(l => {
        const d = new Date(l.created_at)
        return d >= start && d < end
      }).length,
    }
  })
  return weeks
}

// ── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({
  id, label, icon: Icon, active, onClick, badge,
}: {
  id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean
  onClick: () => void; badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-[#C8A96A]/12 text-[#2B2623]'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C8A96A]' : ''}`} />
      <span className="flex-1 text-left">{label}</span>
      {badge && badge > 0 ? (
        <span className="bg-[#C8A96A] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ════════════════════════════════════════════════════════════════════════════
export default function DashboardShell({ vendor: initialVendor, leads: initialLeads, categories, cities, justClaimed, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [vendor, setVendor] = useState(initialVendor)
  const [leads, setLeads] = useState(initialLeads)
  const unread = leads.filter(l => !l.is_read).length
  const { score, missing } = completeness(vendor)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {justClaimed && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-green-800 font-medium text-sm">🎉 Your listing is now claimed! Welcome to Mela.</p>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-8">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-1">
          {/* Vendor identity */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/15 flex items-center justify-center text-xl font-bold text-[#C8A96A] mb-3 font-[family-name:var(--font-playfair)]">
              {vendor.name.charAt(0)}
            </div>
            <p className="font-semibold text-sm text-[#2B2623] leading-tight">{vendor.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{vendor.category?.name} · {vendor.city?.name}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              vendor.tier === 'free' ? 'bg-gray-100 text-gray-500'
              : vendor.tier === 'premium' ? 'bg-purple-100 text-purple-600'
              : 'bg-[#F5ECD7] text-[#C8A96A]'
            }`}>
              {vendor.tier} plan
            </span>
          </div>

          {/* Profile completeness */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Profile strength</p>
              <p className="text-xs font-bold" style={{ color: score >= 80 ? '#16a34a' : score >= 50 ? '#C8A96A' : '#dc2626' }}>{score}%</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%`, background: score >= 80 ? '#16a34a' : score >= 50 ? '#C8A96A' : '#dc2626' }}
              />
            </div>
          </div>

          {/* Nav */}
          <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col gap-0.5">
            <NavItem id="overview" label="Overview" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem id="profile" label="Edit Profile" icon={User} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem id="photos" label="Photos" icon={ImageIcon} active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
            <NavItem id="inquiries" label="Inquiries" icon={Mail} active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')} badge={unread} />
            <NavItem id="analytics" label="Analytics" icon={BarChart2} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <NavItem id="subscription" label="Subscription" icon={CreditCard} active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')} />
            <div className="h-px bg-gray-100 my-1" />
            <Link
              href={`/vendors/${vendor.slug}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              View Public Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Log Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {[
              { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
              { id: 'profile' as Tab, label: 'Profile', icon: User },
              { id: 'photos' as Tab, label: 'Photos', icon: ImageIcon },
              { id: 'inquiries' as Tab, label: 'Leads', icon: Mail },
              { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart2 },
              { id: 'subscription' as Tab, label: 'Plan', icon: CreditCard },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === id ? 'bg-[#C8A96A] text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === 'inquiries' && unread > 0 && (
                  <span className="bg-white text-[#C8A96A] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <OverviewTab vendor={vendor} leads={leads} score={score} missing={missing} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab vendor={vendor} categories={categories} cities={cities} onSave={setVendor} />
          )}
          {activeTab === 'photos' && (
            <PhotosTab vendor={vendor} onSave={setVendor} />
          )}
          {activeTab === 'inquiries' && (
            <InquiriesTab leads={leads} onMarkRead={(id) => setLeads(prev => prev.map(l => l.id === id ? { ...l, is_read: true } : l))} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab leads={leads} vendor={vendor} />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionTab vendor={vendor} userId={userId} />
          )}
        </main>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
function OverviewTab({ vendor, leads, score, missing, setActiveTab }: {
  vendor: Props['vendor']
  leads: Lead[]
  score: number
  missing: string[]
  setActiveTab: (t: Tab) => void
}) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthlyLeads = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length
  const weeklyLeads = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length
  const recentLeads = leads.slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">
          Welcome back 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here&apos;s how {vendor.name} is performing.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This month', value: monthlyLeads, sub: 'inquiries', icon: Mail, color: '#C8A96A' },
          { label: 'This week', value: weeklyLeads, sub: 'inquiries', icon: TrendingUp, color: '#7C9F7C' },
          { label: 'All time', value: leads.length, sub: 'total inquiries', icon: Star, color: '#9B8EC4' },
          { label: 'Profile', value: `${score}%`, sub: 'complete', icon: User, color: '#E07B5A' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-[#2B2623]">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label} · {sub}</p>
          </div>
        ))}
      </div>

      {/* Profile completeness warning */}
      {score < 80 && (
        <div className="bg-[#FFF8EE] border border-[#C8A96A]/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C8A96A] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#2B2623] text-sm mb-1">
                Your profile is {score}% complete — couples are less likely to contact incomplete profiles
              </p>
              <p className="text-xs text-gray-500 mb-3">Missing: {missing.join(', ')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                  style={{ background: '#C8A96A' }}
                >
                  Complete Profile
                </button>
                {missing.includes('Portfolio photos') && (
                  <button
                    onClick={() => setActiveTab('photos')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#C8A96A]/40 text-[#C8A96A]"
                  >
                    Add Photos
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-5 pt-5 pb-3">Quick Actions</p>
        {[
          { label: 'Edit your profile details', sub: 'Name, description, contact info', tab: 'profile' as Tab, icon: Pencil },
          { label: 'Add portfolio photos', sub: 'Photos make vendors 3x more likely to get inquiries', tab: 'photos' as Tab, icon: ImageIcon },
          { label: 'View all inquiries', sub: `${leads.filter(l => !l.is_read).length} unread`, tab: 'inquiries' as Tab, icon: Mail },
        ].map(({ label, sub, tab, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 hover:bg-gray-50/60 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5ECD7] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#C8A96A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2B2623]">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#C8A96A] transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-[#2B2623]">Recent Inquiries</p>
          <button onClick={() => setActiveTab('inquiries')} className="text-xs text-[#C8A96A] font-medium hover:underline">
            View all →
          </button>
        </div>
        {recentLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">No inquiries yet — share your profile to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLeads.map(lead => (
              <div key={lead.id} className={`flex items-start gap-3 p-3 rounded-xl ${!lead.is_read ? 'bg-[#FFF8EE]' : 'bg-gray-50/60'}`}>
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/15 flex items-center justify-center text-xs font-bold text-[#C8A96A] shrink-0">
                  {lead.buyer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2B2623] truncate">{lead.buyer_name}</p>
                  <p className="text-xs text-gray-400">{lead.event_type ?? 'Inquiry'} · {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
                </div>
                {!lead.is_read && <span className="w-2 h-2 rounded-full bg-[#C8A96A] shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: EDIT PROFILE
// ════════════════════════════════════════════════════════════════════════════
function ProfileTab({ vendor, categories, cities, onSave }: {
  vendor: Props['vendor']
  categories: Category[]
  cities: City[]
  onSave: (v: Props['vendor']) => void
}) {
  const [form, setForm] = useState({
    name: vendor.name ?? '',
    phone: vendor.phone ?? '',
    description: vendor.description ?? '',
    website: vendor.website ?? '',
    instagram: vendor.instagram ?? '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      onSave({ ...vendor, ...form })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/10 transition-all'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Edit Profile</h2>
        <p className="text-gray-500 text-sm mt-0.5">Changes go live on your public profile immediately.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Read-only info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</p>
            <p className="text-sm font-medium text-gray-700">{vendor.category?.icon} {vendor.category?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> City</p>
            <p className="text-sm font-medium text-gray-700">{vendor.city?.name}</p>
          </div>
          <p className="col-span-2 text-xs text-gray-400">To change category or city, contact <a href="mailto:hello@melaa.ca" className="text-[#C8A96A] hover:underline">hello@melaa.ca</a></p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2B2623] mb-1.5">Business Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2B2623] mb-1.5">
            About Your Business
            <span className="font-normal text-gray-400 ml-2">({form.description.length} chars — 50+ recommended)</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={5}
            placeholder="Describe your services, specialties, experience, and what makes you the right choice for South Asian weddings..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2623] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone
            </label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (416) 000-0000" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2623] mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-400" /> Website
            </label>
            <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourwebsite.com" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2B2623] mb-1.5 flex items-center gap-1.5">
            <AtSign className="w-3.5 h-3.5 text-gray-400" /> Instagram Handle
          </label>
          <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@yourhandle" className={inputCls} />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> Failed to save. Please try again.
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: '#C8A96A' }}
          >
            {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : status === 'saved' ? <Check className="w-4 h-4" /> : null}
            {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
          <Link href={`/vendors/${vendor.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C8A96A] transition-colors">
            <Eye className="w-4 h-4" /> Preview Profile
          </Link>
        </div>
      </form>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: PHOTOS
// ════════════════════════════════════════════════════════════════════════════
function PhotosTab({ vendor, onSave }: { vendor: Props['vendor']; onSave: (v: Props['vendor']) => void }) {
  const [photos, setPhotos] = useState<string[]>(vendor.portfolio_images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > 6) {
      setUploadError('Maximum 6 photos allowed.')
      return
    }
    setUploading(true)
    setUploadError('')
    const newUrls: string[] = []
    let failed = 0
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`${file.name} is too large (max 5MB). Skipped.`)
        failed++
        continue
      }
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vendorId', vendor.id)
      const res = await fetch('/api/vendors/upload-photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed. Please try again.')
        failed++
        continue
      }
      newUrls.push(data.url)
    }
    const updated = [...photos, ...newUrls]
    setPhotos(updated)
    if (newUrls.length > 0) await savePhotos(updated)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (failed > 0 && newUrls.length > 0) {
      setUploadError(`${newUrls.length} uploaded, ${failed} failed.`)
    }
  }

  async function removePhoto(url: string) {
    const updated = photos.filter(p => p !== url)
    setPhotos(updated)
    await savePhotos(updated)
  }

  async function savePhotos(list: string[]) {
    setSaving(true)
    await fetch(`/api/vendors/${vendor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_images: list }),
    })
    onSave({ ...vendor, portfolio_images: list })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Portfolio Photos</h2>
          <p className="text-gray-500 text-sm mt-0.5">{photos.length}/6 photos · Max 5MB each · JPG, PNG, WebP</p>
        </div>
        {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
        {saved && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {photos.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removePhoto(url)}
                    className="bg-white text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C8A96A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-4">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No photos yet</p>
            <p className="text-sm text-gray-400">Vendors with photos get 3× more inquiries</p>
          </div>
        )}

        {photos.length < 6 && (
          <>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={uploadPhotos} disabled={uploading} />
            <button
              onClick={() => { setUploadError(''); fileRef.current?.click() }}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#C8A96A] rounded-xl py-5 text-sm font-medium text-gray-400 hover:text-[#C8A96A] transition-all disabled:opacity-50"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload Photos</>}
            </button>
          </>
        )}
        {uploadError && (
          <div className="flex items-center gap-2 mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: INQUIRIES
// ════════════════════════════════════════════════════════════════════════════
function InquiriesTab({ leads, onMarkRead }: { leads: Lead[]; onMarkRead: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const filtered = leads.filter(l =>
    filter === 'all' ? true : filter === 'unread' ? !l.is_read : l.is_read
  )

  async function markRead(id: string) {
    setMarkingRead(id)
    await fetch(`/api/leads/${id}`, { method: 'PATCH' })
    onMarkRead(id)
    setMarkingRead(null)
  }

  const unreadCount = leads.filter(l => !l.is_read).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Inquiries</h2>
          <p className="text-gray-500 text-sm mt-0.5">{leads.length} total · {unreadCount} unread</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-white text-[#2B2623] shadow-sm' : 'text-gray-500'}`}>
              {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} inquiries yet.</p>
          </div>
        ) : filtered.map(lead => (
          <div key={lead.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!lead.is_read ? 'border-[#C8A96A]/30' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8A96A]/15 flex items-center justify-center text-sm font-bold text-[#C8A96A] shrink-0">
                  {lead.buyer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#2B2623]">{lead.buyer_name}</p>
                    {!lead.is_read && <span className="text-[10px] bg-[#F5ECD7] text-[#C8A96A] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>}
                  </div>
                  <p className="text-sm text-gray-500">{lead.buyer_email}</p>
                  {(lead.event_type || lead.event_date) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {lead.event_type && <span>{lead.event_type}</span>}
                      {lead.event_date && <span> · {lead.event_date}</span>}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
            </div>

            {lead.message && (
              <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-50 leading-relaxed">{lead.message}</p>
            )}

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
              <a
                href={`mailto:${lead.buyer_email}?subject=Re: Your inquiry on Melaa`}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#C8A96A] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> Reply
              </a>
              {!lead.is_read && (
                <button
                  onClick={() => markRead(lead.id)}
                  disabled={markingRead === lead.id}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                >
                  {markingRead === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: ANALYTICS
// ════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ leads, vendor }: { leads: Lead[]; vendor: Props['vendor'] }) {
  const weeks = weeklyLeads(leads)
  const maxVal = Math.max(...weeks.map(w => w.count), 1)
  const { score } = completeness(vendor)
  const now = new Date()
  const monthlyAvg = leads.length > 0
    ? (leads.length / Math.max(1, Math.ceil((now.getTime() - new Date(vendor.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)))).toFixed(1)
    : '0'

  const eventTypes = leads.reduce((acc, l) => {
    const k = l.event_type ?? 'General Inquiry'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topEvents = Object.entries(eventTypes).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Analytics</h2>
        <p className="text-gray-500 text-sm mt-0.5">How your profile is performing.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total inquiries', value: leads.length },
          { label: 'Monthly avg', value: monthlyAvg },
          { label: 'Profile strength', value: `${score}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-[#2B2623]">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="font-semibold text-[#2B2623] mb-5">Inquiries — last 8 weeks</p>
        <div className="flex items-end gap-2 h-32">
          {weeks.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">{count > 0 ? count : ''}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(4, (count / maxVal) * 100)}%`,
                  background: count > 0 ? '#C8A96A' : '#F0EDE8',
                  minHeight: 4,
                }}
              />
              <span className="text-[9px] text-gray-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
        {leads.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">No inquiries yet — data will appear here as you receive leads.</p>
        )}
      </div>

      {/* Event types */}
      {topEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="font-semibold text-[#2B2623] mb-4">Top inquiry types</p>
          <div className="space-y-3">
            {topEvents.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <p className="text-sm text-gray-600 w-36 shrink-0 truncate">{type}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C8A96A] rounded-full" style={{ width: `${(count / leads.length) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 w-6 text-right">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page views note */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
        <Eye className="w-5 h-5 text-gray-300 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-600">Profile view tracking</p>
          <p className="text-xs text-gray-400">Coming soon — we&apos;re building page view analytics. Inquiries are tracked now.</p>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: SUBSCRIPTION
// ════════════════════════════════════════════════════════════════════════════
function SubscriptionTab({ vendor, userId }: { vendor: Props['vendor']; userId: string }) {
  const isActive = vendor.tier !== 'free'
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  async function startCheckout(plan: 'basic' | 'premium') {
    setCheckoutLoading(plan)
    setCheckoutError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, vendorId: vendor.id, userId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? 'Could not start checkout. Please try again.')
        setCheckoutLoading(null)
        return
      }
      window.location.href = data.url
    } catch {
      setCheckoutError('An unexpected error occurred. Please try again.')
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623]">Subscription</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your plan and billing.</p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Current Plan</p>
            <p className="text-xl font-bold text-[#2B2623] capitalize">{vendor.tier}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {isActive ? 'Active' : 'Free tier'}
          </span>
        </div>

        {isActive ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-[#C8A96A]" /> Featured placement in search results
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-[#C8A96A]" /> Direct inquiry leads from couples
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-[#C8A96A]" /> Verified badge on your profile
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-[#C8A96A]" /> Priority listing in your category
            </div>
            <div className="pt-3 mt-3 border-t border-gray-100">
              <a href="mailto:hello@melaa.ca?subject=Subscription help" className="text-sm text-gray-400 hover:text-[#C8A96A] transition-colors">
                Questions about billing? Email us →
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-5">You&apos;re on the free tier. Upgrade to get featured placement and direct leads from couples searching for vendors like you.</p>

            {/* Basic plan card */}
            <div className="border-2 border-[#C8A96A] rounded-2xl p-5 mb-4 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-[#C8A96A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                Founding Rate
              </div>
              <p className="font-bold text-[#2B2623] text-lg">Basic Plan</p>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-bold text-[#2B2623]">$49</span>
                <span className="text-gray-400 text-sm">/month</span>
                <span className="text-xs text-gray-400 ml-1 line-through">$99/mo normally</span>
              </div>
              <div className="space-y-1.5 mb-5">
                {['Featured in search results', 'Verified badge on your profile', 'Priority placement in your category', 'AI reply drafts for every lead'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" /> {f}
                  </div>
                ))}
              </div>
              {checkoutError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {checkoutError}
                </div>
              )}
              <button
                onClick={() => startCheckout('basic')}
                disabled={checkoutLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: '#C8A96A' }}
              >
                {checkoutLoading === 'basic'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
                  : <>Upgrade to Basic — $49/mo <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </div>
            <p className="text-xs text-center text-gray-400">Secure checkout powered by Stripe. Cancel anytime.</p>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      {!isActive && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4">
            <p className="font-semibold text-[#2B2623]">What you unlock with a paid plan</p>
          </div>
          {[
            { feature: 'Listed in directory', free: true, paid: true },
            { feature: 'Direct inquiry leads', free: false, paid: true },
            { feature: 'Featured in search results', free: false, paid: true },
            { feature: 'Verified badge', free: false, paid: true },
            { feature: 'Priority category placement', free: false, paid: true },
            { feature: 'AI reply drafts for leads', free: false, paid: true },
          ].map(({ feature, free: f, paid }) => (
            <div key={feature} className="flex items-center gap-4 px-6 py-3 border-t border-gray-50">
              <p className="flex-1 text-sm text-gray-600">{feature}</p>
              <div className="w-14 text-center">{f ? <Check className="w-4 h-4 text-gray-400 mx-auto" /> : <X className="w-4 h-4 text-gray-200 mx-auto" />}</div>
              <div className="w-14 text-center">{paid ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-gray-200 mx-auto" />}</div>
            </div>
          ))}
          <div className="flex px-6 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-400">Plan</p>
            <p className="w-14 text-center text-xs font-semibold text-gray-400">Free</p>
            <p className="w-14 text-center text-xs font-semibold text-[#C8A96A]">Paid</p>
          </div>
        </div>
      )}
    </div>
  )
}
