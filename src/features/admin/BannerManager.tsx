import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { usePromoBanner, useUpdatePromoBanner } from '@/lib/queries/usePromoBanner'
import { readImageAsDataUrl } from '@/lib/readImageAsDataUrl'
import { getErrorMessage } from '@/lib/utils'
import type { PromoBanner } from '@/types/database'

const MAX_BANNER_IMAGE_BYTES = 2 * 1024 * 1024

function BannerManager() {
  const { data: banner, isLoading } = usePromoBanner()
  const updateBanner = useUpdatePromoBanner()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Omit<PromoBanner, 'id'> | null>(null)

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image_url,
        link_url: banner.link_url,
        is_active: banner.is_active,
      })
    }
  }, [banner])

  if (isLoading || !form) {
    return <Skeleton className="h-64 w-full" />
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_BANNER_IMAGE_BYTES) {
      toast({ title: 'Image too large', description: 'Please choose a file under 2MB.', variant: 'error' })
      return
    }
    const dataUrl = await readImageAsDataUrl(file)
    setForm((f) => (f ? { ...f, image_url: dataUrl } : f))
  }

  const save = () => {
    updateBanner.mutate(form, {
      onSuccess: () => toast({ title: 'Banner updated', variant: 'success' }),
      onError: (err) => toast({ title: 'Failed to update banner', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-stack-md pt-stack-md">
        <div>
          <Label htmlFor="banner-image">Advertisement image or GIF</Label>
          <div className="mt-1 flex items-center gap-3">
            {form.image_url ? (
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded border border-outline-variant/40 bg-surface-container-low">
                <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => (f ? { ...f, image_url: null } : f))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-clean-white"
                  aria-label="Remove image"
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
              <p className="text-label-sm text-on-surface-variant">
                PNG, JPG or GIF. Use a wide landscape photo, around 1600×700px, with the main subject centered — it fills the
                banner edge-to-edge and crops in slightly on very narrow or very wide screens. Max 2MB. Falls back to a text
                banner if empty.
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="banner-image"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="banner-title">Title</Label>
          <Input
            id="banner-title"
            className="mt-1"
            value={form.title}
            onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
          />
        </div>

        <div>
          <Label htmlFor="banner-subtitle">Subtitle</Label>
          <Input
            id="banner-subtitle"
            className="mt-1"
            value={form.subtitle}
            onChange={(e) => setForm((f) => (f ? { ...f, subtitle: e.target.value } : f))}
          />
        </div>

        <div>
          <Label htmlFor="banner-link">Link (where the banner sends customers when tapped)</Label>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Use a page on this site (e.g. <code>/order</code>) or a full external link (e.g. <code>https://wa.me/...</code>) to send customers off-site.
          </p>
          <Input
            id="banner-link"
            className="mt-1"
            value={form.link_url}
            onChange={(e) => setForm((f) => (f ? { ...f, link_url: e.target.value } : f))}
            placeholder="/order or https://example.com"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={form.is_active ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setForm((f) => (f ? { ...f, is_active: !f.is_active } : f))}
          >
            {form.is_active ? 'Active' : 'Hidden'}
          </Button>
          <span className="text-label-sm text-on-surface-variant">Toggle to {form.is_active ? 'hide' : 'show'} the banner on the home page</span>
        </div>

        <Button onClick={save} disabled={updateBanner.isPending} className="self-start">
          Save Banner
        </Button>
      </CardContent>
    </Card>
  )
}

export { BannerManager }
