export type VendorTier = 'free' | 'basic' | 'premium'

export interface Category {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
  created_at: string
}

export interface City {
  id: string
  slug: string
  name: string
  province: string
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface Vendor {
  id: string
  slug: string
  name: string
  email: string
  phone: string | null
  category_id: string | null
  city_id: string | null
  description: string | null
  website: string | null
  instagram: string | null
  portfolio_images: string[]
  latitude: number | null
  longitude: number | null
  address: string | null
  tier: VendorTier
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  stripe_customer_id: string | null
  claim_status: 'unclaimed' | 'pending' | 'claimed'
  claim_email: string | null
  claimed_by_user_id: string | null
  claim_token: string | null
  claim_token_expires_at: string | null
  created_at: string
  // Joined fields
  distance_km?: number
  category?: Category
  city?: City
}

export interface Lead {
  id: string
  vendor_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  event_date: string | null
  event_type: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  vendor_id: string
  rating: number
  body: string | null
  reviewer_name: string
  created_at: string
  vendor?: { id: string; name: string; slug: string; category?: { name: string; icon: string | null } | null }
}

export interface SavedVendor {
  id: string
  user_id: string
  vendor_id: string
  created_at: string
  vendor?: Vendor & { category?: Category | null; city?: City | null }
}
