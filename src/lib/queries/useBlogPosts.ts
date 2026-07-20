import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllBlogPosts, getBlogPost, getBlogPostBySlug, getPublishedBlogPosts, upsertBlogPost } from '@/lib/data/blog'
import { queryKeys } from '@/lib/queries/keys'

export function usePublishedBlogPosts() {
  return useQuery({ queryKey: queryKeys.publishedBlogPosts, queryFn: getPublishedBlogPosts })
}

export function useAllBlogPosts() {
  return useQuery({ queryKey: queryKeys.allBlogPosts, queryFn: getAllBlogPosts })
}

export function useBlogPostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blogPostBySlug(slug ?? ''),
    queryFn: () => getBlogPostBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blogPost(id ?? ''),
    queryFn: () => getBlogPost(id!),
    enabled: Boolean(id),
  })
}

export function useUpsertBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publishedBlogPosts })
      queryClient.invalidateQueries({ queryKey: queryKeys.allBlogPosts })
    },
  })
}
