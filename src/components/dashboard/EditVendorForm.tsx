'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import type { Vendor, Category, City } from '@/types'

interface Props {
  vendor: Vendor
  categories: Category[]
  cities: City[]
}

export default function EditVendorForm({ vendor, categories, cities }: Props) {
  const [form, setForm] = useState({
    description: vendor.description ?? '',
    phone: vendor.phone ?? '',
    website: vendor.website ?? '',
    instagram: vendor.instagram ?? '',
    category_id: vendor.category_id ?? '',
    city_id: vendor.city_id ?? '',
  })
  const [images, setImages] = useState<string[]>(vendor.portfolio_images ?? [])
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 6) { alert('Maximum 6 photos allowed.'); return }
    setUploading(true)
    const supabase = createClient()
    const uploaded: string[] = []
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} is too large. Max 5MB.`); continue }
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('vendor-images').upload(fileName, file, { upsert: false })
      if (error) { console.error('Upload error:', error.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('vendor-images').getPublicUrl(data.path)
      uploaded.push(publicUrl)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/dashboard/update-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, portfolio_images: images }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? 'Failed to save.'); setStatus('error'); return }
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setErrorMsg('An unexpected error occurred.')
      setStatus('error')
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] bg-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
        <textarea
          rows={5}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe your services, experience, and what makes you special..."
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="+1 (416) 000-0000" className={inputClass} />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          placeholder="https://yourwebsite.com" className={inputClass} />
      </div>

      {/* Instagram */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
        <input type="text" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
          placeholder="@yourhandle" className={inputClass} />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputClass}>
          <option value="">Select a category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} className={inputClass}>
          <option value="">Select a city</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Portfolio Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Portfolio Photos <span className="text-gray-400 font-normal">(up to 6, max 5MB each)</span>
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((url) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Portfolio" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter(u => u !== url))}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 6 && (
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={handleImageUpload} disabled={uploading} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#C8A96A] rounded-xl py-4 text-sm text-gray-500 hover:text-[#C8A96A] transition-colors disabled:opacity-50">
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /><ImageIcon className="w-4 h-4" /> Add Photos</>}
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">{images.length}/6 photos</p>
          </div>
        )}
      </div>

      {/* Error */}
      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}

      {/* Submit */}
      <button type="submit" disabled={status === 'saving' || uploading}
        className="w-full bg-[#C8A96A] text-white font-semibold py-3 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60">
        {status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}
