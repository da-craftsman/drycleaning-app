import { db, delay, persist } from '@/lib/data/mock/store'
import type { BlogPost } from '@/types/database'

export function getPublishedBlogPostsMock(): Promise<BlogPost[]> {
  return delay(
    db.blogPosts
      .filter((p) => p.published_at)
      .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')),
  )
}

export function getAllBlogPostsMock(): Promise<BlogPost[]> {
  return delay([...db.blogPosts].sort((a, b) => b.created_at.localeCompare(a.created_at)))
}

export function getBlogPostBySlugMock(slug: string): Promise<BlogPost | null> {
  return delay(db.blogPosts.find((p) => p.slug === slug) ?? null)
}

export function getBlogPostMock(id: string): Promise<BlogPost | null> {
  return delay(db.blogPosts.find((p) => p.id === id) ?? null)
}

export function upsertBlogPostMock(post: BlogPost): Promise<BlogPost> {
  const idx = db.blogPosts.findIndex((p) => p.id === post.id)
  if (idx >= 0) db.blogPosts[idx] = post
  else db.blogPosts.push(post)
  persist()
  return delay(post)
}
