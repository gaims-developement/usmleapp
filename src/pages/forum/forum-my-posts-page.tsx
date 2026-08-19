import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { ForumPostCard } from '@/components/forum/forum-post-card'
import { ForumPagination } from '@/components/forum/forum-pagination'
import { useMyPosts, useTogglePostUpvote, useToggleBookmark } from '@/lib/forumQueries'

export function ForumMyPostsPage() {
  const [page, setPage] = useState(1)
  const myPosts = useMyPosts(page)
  const upvoteMutation = useTogglePostUpvote()
  const bookmarkMutation = useToggleBookmark()

  const posts = myPosts.data?.posts ?? []
  const pagination = myPosts.data?.pagination

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Discussions"
        subtitle="Posts you've created in the forum."
      />

      {myPosts.isPending ? (
        <PageLoader label="Loading your posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="size-7" />}
          title="No posts yet"
          description="Start a discussion to share your experiences or ask questions."
          actionLabel="Create Post"
          actionTo="/forum/new"
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <ForumPostCard
              key={post.id}
              post={post}
              onUpvote={(e) => { e.preventDefault(); upvoteMutation.mutate(post.id) }}
              onBookmark={(e) => { e.preventDefault(); bookmarkMutation.mutate(post.id) }}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <ForumPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
