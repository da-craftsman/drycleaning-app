import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  getAllBlogPostsMock,
  getBlogPostBySlugMock,
  getBlogPostMock,
  getPublishedBlogPostsMock,
  upsertBlogPostMock,
} from '@/lib/data/mock/blog.mock'
import type { BlogPost } from '@/types/database'

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return getPublishedBlogPostsMock()
  const { data, error } = await supabase!
    .from('blog_posts')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data as BlogPost[]
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return getAllBlogPostsMock()
  const { data, error } = await supabase!.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return getBlogPostBySlugMock(slug)
  const { data, error } = await supabase!.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return getBlogPostMock(id)
  const { data, error } = await supabase!.from('blog_posts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertBlogPost(post: BlogPost): Promise<BlogPost> {
  if (!isSupabaseConfigured) return upsertBlogPostMock(post)
  const { data, error } = await supabase!.from('blog_posts').upsert(post).select().single()
  if (error) throw error
  return data
}
