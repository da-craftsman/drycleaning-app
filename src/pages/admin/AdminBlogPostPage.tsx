import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ImagePlus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input, Textarea } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useBlogPost, useUpsertBlogPost } from '@/lib/queries/useBlogPosts'
import { readImageAsDataUrl } from '@/lib/readImageAsDataUrl'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { BlogPost } from '@/types/database'

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const MAX_FEATURE_IMAGE_BYTES = 1 * 1024 * 1024

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'General',
  seo_description: '',
  feature_image: null,
}

export default function AdminBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const { data: existing, isLoading } = useBlogPost(isNew ? undefined : id)
  const upsert = useUpsertBlogPost()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState<Omit<BlogPost, 'id' | 'created_at' | 'published_at'>>(emptyPost)
  const [published, setPublished] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFeatureImage = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FEATURE_IMAGE_BYTES) {
      toast({ title: 'Image too large', description: 'Please choose a file under 1MB.', variant: 'error' })
      return
    }
    const dataUrl = await readImageAsDataUrl(file)
    setForm((f) => ({ ...f, feature_image: dataUrl }))
  }

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt,
        content: existing.content,
        category: existing.category,
        seo_description: existing.seo_description,
        feature_image: existing.feature_image,
      })
      setPublished(Boolean(existing.published_at))
    }
  }, [existing])

  if (!isNew && isLoading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const handleSave = async () => {
    const post: BlogPost = {
      id: isNew ? `post-${crypto.randomUUID()}` : id!,
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      seo_description: form.seo_description,
      feature_image: form.feature_image,
      published_at: published ? (existing?.published_at ?? new Date().toISOString()) : null,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }
    try {
      await upsert.mutateAsync(post)
      toast({ title: isNew ? 'Post created' : 'Post updated', variant: 'success' })
      navigate(paths.adminBlog)
    } catch (err) {
      toast({ title: 'Failed to save post', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.adminBlog} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Blog
      </Link>

      <h1 className="text-headline-md font-display text-on-surface">{isNew ? 'New Post' : 'Edit Post'}</h1>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          className="mt-1"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" className="mt-1" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
      </div>

      <div>
        <Label htmlFor="feature-image">Featured Image</Label>
        <div className="mt-1 flex items-center gap-3">
          {form.feature_image ? (
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded border border-outline-variant/40 bg-surface-container-low">
              <img src={form.feature_image} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, feature_image: null }))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-clean-white"
                aria-label="Remove featured image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Upload image
            </Button>
            <p className="text-label-sm text-on-surface-variant">Max 1MB.</p>
          </div>
          <input
            ref={fileInputRef}
            id="feature-image"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => handleFeatureImage(e.target.files?.[0])}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" className="mt-1" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" className="mt-1" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <div className="mt-1">
          <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
        </div>
      </div>

      <div>
        <Label htmlFor="seo">SEO description</Label>
        <Textarea
          id="seo"
          className="mt-1"
          value={form.seo_description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant={published ? 'primary' : 'outline'} size="sm" onClick={() => setPublished((p) => !p)}>
          {published ? 'Published' : 'Draft'}
        </Button>
        <span className="text-label-sm text-on-surface-variant">Toggle to {published ? 'unpublish' : 'publish'}</span>
      </div>

      <Button size="lg" onClick={handleSave} disabled={upsert.isPending || !form.title} className="self-start">
        {upsert.isPending ? 'Saving…' : 'Save Post'}
      </Button>
    </div>
  )
}
