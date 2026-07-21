import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublishedBlogPosts } from '@/lib/queries/useBlogPosts'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

const ads = [
  { headline: 'Got Dirty Clothes at Home?', body: "Let us handle the wash while you focus on what matters." },
  { headline: 'Need an Express Wash?', body: 'We wash and return your items in as fast as 24 hours.' },
  { headline: 'Suit Looking Tired?', body: 'Professional pressing and cleaning that keeps it sharp for work.' },
  { headline: 'Native Wear Needs Care?', body: 'Agbada, Isiagu, and George wrappers cleaned the right way.' },
  { headline: 'Free Self Drop-off & Pickup', body: 'No hidden fees, just bring it in and collect it when ready.' },
]

/** Rotates through short promo lines every few seconds with a fade transition, always ending on the same CTA into checkout. */
function RotatingAdCard() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ads.length)
        setVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const ad = ads[index]

  return (
    <Card className="overflow-hidden border-none bg-linear-to-br from-primary to-laundry-blue-deep shadow-soft-lift lg:sticky lg:top-24 lg:self-start">
      <CardContent className="flex flex-col items-center gap-stack-sm px-stack-md pb-5 pt-5 text-center">
        <div
          className={cn(
            'flex min-h-28 flex-col justify-center transition-all duration-700 ease-in-out',
            visible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
          )}
        >
          <p className="text-headline-md font-display text-clean-white">{ad.headline}</p>
          <p className="mt-1 text-body-md text-clean-white/80">{ad.body}</p>
        </div>
        <Button size="lg" variant="express" asChild className="mt-1 w-full">
          <Link to={paths.order}>Book Your Order</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function BlogListPage() {
  const { data: posts, isLoading } = usePublishedBlogPosts()

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">The Shalah Rex Blog</h1>
        <p className="mt-stack-sm text-body-md text-on-surface-variant">Fabric care guides, service tips, and news.</p>
      </div>

      <div className="mt-stack-lg grid grid-cols-1 gap-stack-lg lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-stack-lg">
          <div>
            <h2 className="mb-stack-md text-headline-md font-display text-on-surface">Recent Posts</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : !posts || posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-stack-lg text-center">
                  <Newspaper className="h-8 w-8 text-outline" strokeWidth={1.5} />
                  <p className="text-body-md text-on-surface-variant">
                    Nothing published yet, check back soon for fabric care guides and service tips.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
                {posts.map((post) => (
                  <Link key={post.id} to={paths.blogPost(post.slug)}>
                    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-soft-lift">
                      {post.feature_image ? (
                        <img src={post.feature_image} alt="" className="aspect-video w-full object-cover" />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-surface-container-low">
                          <Newspaper className="h-8 w-8 text-outline" strokeWidth={1.5} />
                        </div>
                      )}
                      <CardContent className="flex flex-1 flex-col gap-1 pt-stack-md">
                        <p className="text-label-sm uppercase text-on-surface-variant">{post.category}</p>
                        <p className="text-label-md font-bold normal-case text-on-surface">{post.title}</p>
                        <p className="text-body-md text-on-surface-variant">{post.excerpt}</p>
                        <p className="mt-auto pt-2 text-label-sm text-on-surface-variant">
                          {post.published_at &&
                            new Date(post.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Card className="bg-surface-container-low">
            <CardContent className="flex flex-col items-center gap-stack-sm py-stack-lg text-center">
              <p className="text-headline-md font-display text-on-surface">Want More News & Tips?</p>
              <p className="max-w-md text-body-md text-on-surface-variant">
                We're always adding new guides on fabric care and service updates, check back soon, or explore what we offer in the meantime.
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <Button variant="outline" asChild>
                  <Link to={paths.services}>See Our Services</Link>
                </Button>
                <Button asChild>
                  <Link to={paths.order}>Book Your Order</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <RotatingAdCard />
      </div>
    </div>
  )
}
