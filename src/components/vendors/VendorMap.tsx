'use client'

import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

interface Props {
  latitude: number | null
  longitude: number | null
  vendorName: string
  address?: string | null
  cityName?: string | null
}

// Inner map component, dynamically imported (Leaflet requires window)
const LeafletMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-gray-300" />
    </div>
  ),
})

export default function VendorMap({ latitude, longitude, vendorName, address, cityName }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // No coordinates - show fallback
  if (!latitude || !longitude) {
    return (
      <div className="h-[180px] w-full rounded-2xl bg-gradient-to-br from-[#FAFAF7] to-[#F5ECD7]/30 border border-gray-100 flex flex-col items-center justify-center text-center px-4">
        <MapPin className="w-8 h-8 text-[#C8A96A] mb-2" />
        <p className="text-sm font-semibold text-gray-700">{cityName || 'Greater Toronto Area'}</p>
        {address && <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{address}</p>}
        <p className="text-xs text-gray-400 mt-2">Exact location available on request</p>
      </div>
    )
  }

  if (!mounted) {
    return <div className="h-[260px] w-full rounded-2xl bg-gray-100 animate-pulse" />
  }

  return (
    <div className="h-[260px] w-full rounded-2xl overflow-hidden border border-gray-200">
      <LeafletMap latitude={latitude} longitude={longitude} vendorName={vendorName} address={address} />
    </div>
  )
}
