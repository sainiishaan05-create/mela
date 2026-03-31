'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import type { Category, City } from '@/types'

interface Props {
  categories: Category[]
  cities: City[]
}

export default function VendorSignupForm({ categories, cities }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', category_id: '', city_id: '',
    description: '', website: '', instagram: '', password: '', confirmPassword: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 6) {
      setUploadError('Maximum 6 photos allowed.')
      return
    }
    setUploading(true)
    setUploadError('')
    const supabase = createClient()
    const uploaded: string[] = []
    let failed = 0
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`${file.name} is too large. Max 5MB per photo.`)
        failed++
        continue
      }
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('vendor-images')
        .upload(fileName, file, { upsert: false })
      if (error) {
        console.error('Upload error:', error.message)
        failed++
        if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
          setUploadError('Photo storage is being set up — your listing will still go live without photos.')
        } else {
          setUploadError(`Failed to upload ${file.name}. Please try again.`)
        }
        continue
      }
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-images')
        .getPublicUrl(data.path)
      uploaded.push(publicUrl)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (failed > 0 && uploaded.length > 0) {
      setUploadError(`${uploaded.length} photo(s) uploaded. ${failed} failed — you can continue without them.`)
    }
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(u => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { alert('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirmPassword) { alert('Passwords do not match.'); return }
    setStatus('loading')
    try {
      const { confirmPassword, ...payload } = form
      void confirmPassword
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, portfolio_images: images }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Something went wrong.'); setStatus('error'); return }

      // Auto-login the vendor so they land directly in their dashboard
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) {
        // Login failed but signup succeeded — just show success screen
        console.warn('Auto-login failed after signup:', signInError.message)
        setStatus('success')
        return
      }

      // Redirect to dashboard with success banner
      router.push('/dashboard?claimed=1')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">You&apos;re listed!</h2>
        <p className="text-gray-500 mb-6">Your business is now live on Melaa. Couples can start finding you right away.</p>
        <a
          href="/login"
          className="inline-block bg-[#C8A96A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#B8945A] transition-colors"
        >
          Log in to your dashboard →
        </a>
      </div>
    )
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Business Name *', 'name', 'text', 'e.g. Royal Photography')}
      {field('Email Address *', 'email', 'email', 'you@example.com')}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password * <span className="text-gray-400 font-normal">(min. 8 characters — used to manage your listing)</span></label>
        <input
          type="password"
          placeholder="Create a password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
        <input
          type="password"
          placeholder="Repeat your password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        />
      </div>

      {field('Phone Number', 'phone', 'tel', '+1 (416) 000-0000')}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          required
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        >
          <option value="">Select a category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <select
          required
          value={form.city_id}
          onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        >
          <option value="">Select a city</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About Your Business</label>
        <textarea
          rows={4}
          placeholder="Describe your services, experience, and what makes you special..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] resize-none"
        />
      </div>

      {field('Website', 'website', 'url', 'https://yourwebsite.com')}
      {field('Instagram', 'instagram', 'text', '@yourhandle')}

      {/* ── Photo Upload ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Portfolio Photos <span className="text-gray-400 font-normal">(up to 6 photos, max 5MB each)</span>
        </label>

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Portfolio" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {images.length < 6 && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#C8A96A] rounded-lg py-4 text-sm text-gray-500 hover:text-[#C8A96A] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> <ImageIcon className="w-4 h-4" /> Add Photos</>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">{images.length}/6 photos added</p>
          </div>
        )}
        {uploadError && (
          <p className="text-xs text-amber-600 mt-2">{uploadError}</p>
        )}
      </div>

      {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}

      <button
        type="submit"
        disabled={status === 'loading' || uploading}
        className="w-full bg-[#C8A96A] text-white font-semibold py-3 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60 text-base"
      >
        {status === 'loading' ? 'Submitting...' : 'List My Business Free →'}
      </button>
      <p className="text-xs text-center text-gray-400">No credit card required. Your listing goes live immediately.</p>
    </form>
  )
}
