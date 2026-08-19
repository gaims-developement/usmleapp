import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { ForumPostCard } from '@/components/forum/forum-post-card'
import { ForumPagination } from '@/components/forum/forum-pagination'
import { useBookmarks, useTogglePostUpvote, useToggleBookmark } from '@/lib/forumQueries'

export function ForumBookmarksPage() {
  const [page, setPage] = useState(1)
  const bookmarks = useBookmarks(page)
  const upvoteMutation = useTogglePostUpvote()
  const bookmarkMutation = useToggleBookmark()

  const posts = bookmarks.data?.posts ?? []
  const pagination = bookmarks.data?.pagination

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookmarked Discussions"
        subtitle="Posts you've saved for later."
      />

      {bookmarks.isPending ? (
        <PageLoader label="Loading bookmarks..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="size-7" />}
          title="No bookmarks yet"
          description="Save posts to find them easily later."
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
