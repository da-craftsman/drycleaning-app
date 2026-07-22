import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
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

      {/* Posts written with the rich text editor are stored as HTML; older posts written before it
          existed are plain text with blank-line-separated paragraphs — detected and rendered accordingly. */}
      {/<[a-z][\s\S]*>/i.test(post.content) ? (
        <div
          className={[
            'mt-stack-md flex flex-col gap-stack-md text-body-lg text-on-surface',
            '[&_h2]:font-display [&_h2]:text-headline-md [&_h2]:text-on-surface',
            '[&_h3]:font-display [&_h3]:text-body-lg [&_h3]:font-bold [&_h3]:text-on-surface',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-outline-variant [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-on-surface-variant',
            '[&_hr]:my-2 [&_hr]:border-outline-variant',
            '[&_code]:rounded [&_code]:bg-surface-container-low [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-body-md',
            '[&_img]:rounded-lg [&_img]:w-full',
            '[&_a]:text-primary [&_a]:underline [&_strong]:font-bold',
          ].join(' ')}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      ) : (
        <div className="mt-stack-md flex flex-col gap-stack-md text-body-lg text-on-surface">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

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
