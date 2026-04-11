import {
  Camera, Video, Film, Palette, Leaf, UtensilsCrossed,
  Gift, Flower2, Music, Landmark, Church, Shirt,
  Gem, Cake, Drum, Mail, Sparkles, PhoneCall,
  Scissors, Star, Car, Tent, Volume2, Armchair,
  type LucideIcon,
} from 'lucide-react'

/**
 * Shared mapping: category slug → Lucide icon component.
 *
 * Used by BrowseExplorer, SearchBar, Header nav, homepage marquee,
 * and anywhere else categories appear. Single source of truth so
 * the icon language is consistent across the whole site.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'photographers':         Camera,
  'videographers':         Video,
  'content-creators':      Film,
  'makeup-artists':        Palette,
  'mehndi-artists':        Leaf,
  'catering':              UtensilsCrossed,
  'favours-live-stations': Gift,
  'decorators':            Flower2,
  'djs-entertainment':     Music,
  'wedding-venues':        Landmark,
  'priest-services':       Church,
  'bridal-wear':           Shirt,
  'jewellery':             Gem,
  'sweets-mithai':         Cake,
  'baraat-entertainment':  Drum,
  'invitations':           Mail,
  'photo-booths':          Sparkles,
  'dhol-players':          Drum,
  'sangeet-entertainment': Music,
  'hair-stylists':         Scissors,
  'nail-artists':          Star,
  'bridal-fitness':        Sparkles,
  'wedding-planners':      PhoneCall,
  'transportation':        Car,
  'tent-rentals':          Tent,
  'sound-lighting':        Volume2,
  'linen-furniture':       Armchair,
  'honeymoon-travel':      Sparkles,
  'cakes-desserts':        Cake,
  'florists':              Flower2,
  'horse-carriage':        Drum,
}

export function getCategoryIcon(slug: string): LucideIcon | null {
  return CATEGORY_ICONS[slug] ?? null
}
