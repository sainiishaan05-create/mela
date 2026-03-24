import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  return blogPosts.map((post) => ({
    url: `https://mela.ca/blog/${post.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
}
