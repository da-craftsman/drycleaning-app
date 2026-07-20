import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublishedBlogPosts } from '@/lib/queries/useBlogPosts'
import { paths } from '@/routes/paths'

export default function BlogListPage() {
  const { data: posts, isLoading } = usePublishedBlogPosts()

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">The Shalah Rex Blog</h1>
        <p className="mt-stack-sm text-body-md text-on-surface-variant">Fabric care guides, service tips, and news.</p>
      </div>

      <div className="mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          : posts?.map((post) => (
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
                      {post.published_at && new Date(post.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
