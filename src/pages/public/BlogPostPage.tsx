import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Newspaper, Shirt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useBlogPostBySlug } from '@/lib/queries/useBlogPosts'
import { paths } from '@/routes/paths'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPostBySlug(slug)

  if (isLoading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg text-center">
        <p className="text-body-lg text-on-surface-variant">We couldn't find that article.</p>
        <Link to={paths.blog} className="mt-stack-sm inline-block font-semibold text-primary">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.blog} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Blog
      </Link>

      {post.feature_image ? (
        <img src={post.feature_image} alt="" className="mt-stack-md aspect-video w-full rounded-lg object-cover" />
      ) : (
        <div className="mt-stack-md flex aspect-video items-center justify-center rounded-lg bg-surface-container-low">
          <Newspaper className="h-10 w-10 text-outline" strokeWidth={1.5} />
        </div>
      )}

      <p className="mt-stack-md text-label-sm uppercase text-on-surface-variant">{post.category}</p>
      <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">{post.title}</h1>
      <p className="mt-1 text-label-sm text-on-surface-variant">
        {post.published_at && new Date(post.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="mt-stack-md flex flex-col gap-stack-md text-body-lg text-on-surface">
        {post.content.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <Card className="mt-stack-lg bg-primary/5">
        <CardContent className="flex flex-col items-center gap-stack-sm py-stack-lg text-center">
          <Shirt className="h-8 w-8 text-primary" strokeWidth={1.5} />
          <p className="text-headline-md font-display text-on-surface">Ready to get your items looking their best?</p>
          <p className="max-w-sm text-body-md text-on-surface-variant">
            Book a pickup or drop off yourself: either way, we'll have it cleaned, pressed, and back to you fast.
          </p>
          <Button size="lg" asChild className="mt-1">
            <Link to={paths.order}>Book Your Order</Link>
          </Button>
        </CardContent>
      </Card>
    </article>
  )
}
