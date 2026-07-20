import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllBlogPosts } from '@/lib/queries/useBlogPosts'
import { paths } from '@/routes/paths'

export default function AdminBlogPage() {
  const { data: posts, isLoading } = useAllBlogPosts()

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md flex items-center justify-between">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Blog</h1>
        <Button size="sm" asChild>
          <Link to={paths.adminBlogPost('new')}>
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts?.map((post) => (
            <Link key={post.id} to={paths.adminBlogPost(post.id)}>
              <Card className="transition-shadow hover:shadow-soft-lift">
                <CardContent className="flex items-center justify-between gap-3 pt-stack-md">
                  <div className="flex min-w-0 items-center gap-3">
                    {post.feature_image && (
                      <img src={post.feature_image} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-label-md font-bold normal-case text-on-surface">{post.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{post.category}</p>
                    </div>
                  </div>
                  <Badge variant={post.published_at ? 'success' : 'neutral'}>
                    {post.published_at ? 'Published' : 'Draft'}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
