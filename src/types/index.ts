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
  tier: VendorTier
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  stripe_customer_id: string | null
  created_at: string
  // Joined fields
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
