'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import FormSelect from '@/components/ui/FormSelect'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'photographers', label: 'Photographers' },
  { value: 'videographers', label: 'Videographers' },
  { value: 'content-creators', label: 'Content Creators' },
  { value: 'decorators', label: 'Decorators' },
  { value: 'catering', label: 'Catering' },
  { value: 'djs-entertainment', label: 'DJs & Entertainment' },
  { value: 'makeup-artists', label: 'Makeup Artists' },
  { value: 'mandap-rental', label: 'Mandap Rental' },
  { value: 'wedding-planners', label: 'Wedding Planners' },
  { value: 'bridal-wear', label: 'Bridal Wear' },
  { value: 'mehndi-artists', label: 'Mehndi Artists' },
] as const

const CITIES = [
  { value: 'brampton', label: 'Brampton' },
  { value: 'mississauga', label: 'Mississauga' },
  { value: 'toronto', label: 'Toronto' },
  { value: 'scarborough', label: 'Scarborough' },
  { value: 'markham', label: 'Markham' },
  { value: 'vaughan', label: 'Vaughan' },
  { value: 'richmond-hill', label: 'Richmond Hill' },
  { value: 'kitchener-waterloo', label: 'Kitchener-Waterloo' },
] as const

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const

type Platform = 'instagram' | 'whatsapp' | 'email'
type OutreachStatus = 'pending' | 'contacted' | 'listed' | 'rejected'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutreachRecord {
  id: string
  business_name: string
  instagram: string | null
  whatsapp: string | null
  email: string | null
  category: string | null
  city: string | null
  status: OutreachStatus
  message_sent: string | null
  notes: string | null
  created_at: string
}

// ─── Supabase client (browser) ────────────────────────────────────────────────

function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OutreachStatus }) {
  const styles: Record<OutreachStatus, string> = {
    pending: 'bg-[#F3F3EF] text-[#6B6B6B]',
    contacted: 'bg-blue-50 text-blue-700',
    listed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  }
  const labels: Record<OutreachStatus, string> = {
    pending: 'Pending',
    contacted: 'Contacted',
    listed: 'Listed',
    rejected: 'Rejected',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

// ─── Platform Badge ───────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    instagram: 'bg-pink-50 text-pink-700',
    whatsapp: 'bg-green-50 text-green-700',
    email: 'bg-amber-50 text-amber-700',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[platform] ?? 'bg-[#F3F3EF] text-[#6B6B6B]'}`}
    >
      {platform}
    </span>
  )
}

// ─── Derive platform from record ─────────────────────────────────────────────

function derivePlatform(record: OutreachRecord): string {
  if (record.instagram) return 'instagram'
  if (record.whatsapp) return 'whatsapp'
  if (record.email) return 'email'
  return 'unknown'
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OutreachPage() {
  // Form state
  const [businessName, setBusinessName] = useState('')
  const [instagram, setInstagram] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0].value)
  const [city, setCity] = useState<string>(CITIES[0].value)
  const [platform, setPlatform] = useState<Platform>('instagram')

  // Message state
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [copied, setCopied] = useState(false)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Table state
  const [records, setRecords] = useState<OutreachRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [tableError, setTableError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ── Fetch records ──────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true)
    setTableError('')
    const supabase = getBrowserClient()
    const { data, error } = await supabase
      .from('outreach')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setTableError('Failed to load outreach records.')
    } else {
      setRecords((data ?? []) as OutreachRecord[])
    }
    setLoadingRecords(false)
  }, [])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  // ── Generate message ───────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!businessName.trim()) {
      setGenerateError('Please enter a business name.')
      return
    }
    setGenerating(true)
    setGenerateError('')
    setGeneratedMessage('')

    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessName.trim(), category, city, platform }),
      })
      const json = (await res.json()) as { message?: string; error?: string }
      if (!res.ok || json.error) {
        setGenerateError(json.error ?? 'Failed to generate message.')
      } else {
        setGeneratedMessage(json.message ?? '')
      }
    } catch {
      setGenerateError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Copy to clipboard ──────────────────────────────────────────────────────

  async function handleCopy() {
    if (!generatedMessage) return
    try {
      await navigator.clipboard.writeText(generatedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = generatedMessage
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Save record ────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!businessName.trim()) {
      setSaveError('Business name is required to save.')
      return
    }
    if (!generatedMessage.trim()) {
      setSaveError('Generate a message before saving.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const supabase = getBrowserClient()

    const payload: Partial<OutreachRecord> = {
      business_name: businessName.trim(),
      category,
      city,
      status: 'pending',
      message_sent: generatedMessage.trim(),
    }

    if (platform === 'instagram' && instagram.trim()) {
      payload.instagram = instagram.trim()
    } else if (platform === 'whatsapp' && instagram.trim()) {
      payload.whatsapp = instagram.trim()
    } else if (platform === 'email' && instagram.trim()) {
      payload.email = instagram.trim()
    }

    const { error } = await supabase.from('outreach').insert([payload])

    if (error) {
      setSaveError('Failed to save record.')
    } else {
      setSaveSuccess(true)
      setBusinessName('')
      setInstagram('')
      setGeneratedMessage('')
      void fetchRecords()
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setSaving(false)
  }

  // ── Update status ──────────────────────────────────────────────────────────

  async function handleStatusUpdate(id: string, newStatus: OutreachStatus) {
    setUpdatingId(id)
    const supabase = getBrowserClient()
    const { error } = await supabase
      .from('outreach')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
    }
    setUpdatingId(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const inputClass =
    'w-full rounded-lg border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder-[#ADADAD] focus:border-[#C8A96A] focus:outline-none focus:ring-1 focus:ring-[#C8A96A] transition-colors'

  const selectClass =
    'w-full min-h-[48px] appearance-none rounded-lg border border-[#E5E5E0] bg-white pl-3 pr-10 py-2 text-sm text-[#1A1A1A] bg-no-repeat bg-[right_12px_center] bg-[length:14px] focus:border-[#C8A96A] focus:outline-none focus:ring-1 focus:ring-[#C8A96A] transition-colors'

  const platformContactLabel: Record<Platform, string> = {
    instagram: 'Instagram Handle',
    whatsapp: 'WhatsApp Number',
    email: 'Email Address',
  }

  const platformContactPlaceholder: Record<Platform, string> = {
    instagram: '@vendorhandle',
    whatsapp: '+1 416 000 0000',
    email: 'vendor@example.com',
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-[#C8A96A]" />
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A]">
            Vendor Outreach
          </h1>
          <p className="mt-0.5 text-sm text-[#6B6B6B]">
            Generate AI outreach messages and track your vendor conversations.
          </p>
        </div>
      </div>

      {/* ── Outreach Form ── */}
      <section className="mb-10 rounded-xl border border-[#E5E5E0] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-[#1A1A1A]">
          New Outreach
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
              Business Name <span className="text-[#C8A96A]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Photo Studio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
              Platform
            </label>
            <FormSelect
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              variant="white"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Contact handle / number / email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
              {platformContactLabel[platform]}
            </label>
            <input
              type="text"
              placeholder={platformContactPlaceholder[platform]}
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
              Category
            </label>
            <FormSelect
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              variant="white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
              City
            </label>
            <FormSelect
              value={city}
              onChange={(e) => setCity(e.target.value)}
              variant="white"
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Generate button (vertically centered in its cell) */}
          <div className="flex items-end">
            <button
              onClick={() => void handleGenerate()}
              disabled={generating || !businessName.trim()}
              className="w-full rounded-lg bg-[#C8A96A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#cf6809] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C8A96A] focus:ring-offset-1"
            >
              {generating ? 'Generating…' : 'Generate Message'}
            </button>
          </div>
        </div>

        {generateError && (
          <p className="mt-3 text-sm text-red-600">{generateError}</p>
        )}

        {/* Generated Message */}
        {generatedMessage && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
                Generated Message (editable)
              </label>
              <button
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E0] bg-[#FAFAF7] px-3 py-1 text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] focus:ring-offset-1"
              >
                {copied ? 'Copied!' : 'Copy Message'}
              </button>
            </div>
            <textarea
              rows={5}
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              className={`${inputClass} resize-y leading-relaxed`}
            />

            {/* Save to Supabase */}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-1"
              >
                {saving ? 'Saving…' : 'Save Record'}
              </button>
              {saveSuccess && (
                <span className="text-sm font-medium text-green-600">
                  Record saved!
                </span>
              )}
              {saveError && (
                <span className="text-sm text-red-600">{saveError}</span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Outreach Records Table ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            Outreach Records
            {!loadingRecords && (
              <span className="ml-2 text-sm font-normal text-[#6B6B6B]">
                ({records.length})
              </span>
            )}
          </h2>
          <button
            onClick={() => void fetchRecords()}
            disabled={loadingRecords}
            className="rounded-md border border-[#E5E5E0] bg-[#FAFAF7] px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#E5E5E0] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C8A96A] focus:ring-offset-1"
          >
            {loadingRecords ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {tableError && (
          <p className="mb-4 text-sm text-red-600">{tableError}</p>
        )}

        <div className="overflow-x-auto rounded-xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#E5E5E0] text-sm">
            <thead className="bg-[#FAFAF7]">
              <tr>
                {['Business', 'Category', 'City', 'Platform', 'Status', 'Date', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {loadingRecords && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-[#6B6B6B]"
                  >
                    Loading records…
                  </td>
                </tr>
              )}
              {!loadingRecords && records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-[#6B6B6B]"
                  >
                    No outreach records yet. Generate a message and save a record to get started.
                  </td>
                </tr>
              )}
              {records.map((record) => {
                const recordPlatform = derivePlatform(record)
                const isUpdating = updatingId === record.id

                return (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-[#FAFAF7]"
                  >
                    {/* Business */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-[#1A1A1A]">
                        {record.business_name}
                      </div>
                      {record.instagram && (
                        <div className="text-xs text-[#6B6B6B]">
                          {record.instagram}
                        </div>
                      )}
                      {record.whatsapp && (
                        <div className="text-xs text-[#6B6B6B]">
                          {record.whatsapp}
                        </div>
                      )}
                      {record.email && (
                        <div className="text-xs text-[#6B6B6B]">
                          {record.email}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-[#1A1A1A]">
                      {record.category
                        ? record.category.replace(/-/g, ' ')
                        : <span className="text-[#6B6B6B]">—</span>}
                    </td>

                    {/* City */}
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-[#1A1A1A]">
                      {record.city
                        ? record.city.replace(/-/g, ' ')
                        : <span className="text-[#6B6B6B]">—</span>}
                    </td>

                    {/* Platform */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <PlatformBadge platform={recordPlatform} />
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-[#6B6B6B]">
                      {new Date(record.created_at).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {record.status === 'pending' && (
                          <button
                            onClick={() =>
                              void handleStatusUpdate(record.id, 'contacted')
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            {isUpdating ? '…' : 'Mark Contacted'}
                          </button>
                        )}
                        {record.status === 'contacted' && (
                          <button
                            onClick={() =>
                              void handleStatusUpdate(record.id, 'listed')
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                          >
                            {isUpdating ? '…' : 'Mark Listed'}
                          </button>
                        )}
                        {(record.status === 'pending' ||
                          record.status === 'contacted') && (
                          <button
                            onClick={() =>
                              void handleStatusUpdate(record.id, 'rejected')
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          >
                            {isUpdating ? '…' : 'Reject'}
                          </button>
                        )}
                        {record.status === 'listed' && (
                          <span className="text-xs text-[#6B6B6B]">Listed</span>
                        )}
                        {record.status === 'rejected' && (
                          <span className="text-xs text-[#6B6B6B]">Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
