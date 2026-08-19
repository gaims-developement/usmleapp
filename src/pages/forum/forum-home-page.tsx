import { useState } from 'react'
import { AlertTriangle, Bookmark, Clock, Filter, MessageSquare, PenSquare, Search, TrendingUp } from 'lucide-react'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { ButtonLink } from '@/components/ui/button'
import { ForumPostCard } from '@/components/forum/forum-post-card'
import { ForumPagination } from '@/components/forum/forum-pagination'
import { useForumCategories, useForumPosts, useTogglePostUpvote, useToggleBookmark, useMyModerationStatus } from '@/lib/forumQueries'
import { ForumAppealModal } from '@/components/forum/forum-appeal-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'latest' | 'popular' | 'mine' | 'bookmarks'

export function ForumHomePage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false)

  const categories = useForumCategories()
  const upvoteMutation = useTogglePostUpvote()
  const bookmarkMutation = useToggleBookmark()
  const modStatus = useMyModerationStatus()

  const sort = activeTab === 'popular' ? 'popular' : activeTab === 'latest' ? 'latest' : undefined

  const posts = useForumPosts({
    page,
    limit: 20,
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    sort,
  })

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Filter className="size-3.5" /> },
    { key: 'latest', label: 'Latest', icon: <Clock className="size-3.5" /> },
    { key: 'popular', label: 'Popular', icon: <TrendingUp className="size-3.5" /> },
    { key: 'mine', label: 'My Posts', icon: <MessageSquare className="size-3.5" /> },
    { key: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="size-3.5" /> },
  ]

  const isLoading = categories.isPending || posts.isPending
  const isBanned = modStatus.data?.isBanned
  const strikes = modStatus.data?.strikes ?? 0

  return (
    <div className="space-y-6">
      {/* Ban Appeal Modal */}
      {modStatus.data && (
        <ForumAppealModal
          isOpen={isAppealModalOpen}
          onClose={() => setIsAppealModalOpen(false)}
          banReason={modStatus.data.reason}
          bannedAt={modStatus.data.bannedAt}
          banExpiresAt={modStatus.data.banExpiresAt}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink-900">Forum</h1>
            {strikes > 0 && !isBanned && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Community guideline warnings: {strikes}
              </span>
            )}
          </div>
          <p className="mt-1 max-w-xl text-sm text-ink-600">
            Connect, discuss, and learn with the IMG Prep community.
          </p>
        </div>
        {!isBanned ? (
          <ButtonLink to="/forum/new" size="sm">
            <PenSquare className="size-4" aria-hidden />
            Create Post
          </ButtonLink>
        ) : (
          <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
            <PenSquare className="size-4 mr-1" />
            Posting Suspended
          </Button>
        )}
      </div>

      {/* Temporary Ban Banner */}
      {isBanned && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 shadow-soft space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" />
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-rose-900">Forum access temporarily suspended</h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                Your forum access has been temporarily suspended after repeated violations of our community guidelines.
              </p>
              {(modStatus.data?.bannedAt || modStatus.data?.banExpiresAt) && (
                <p className="text-xs font-medium text-rose-800 pt-1">
                  Ban started on: {new Date(modStatus.data.bannedAt || modStatus.data.banExpiresAt!).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-rose-200/80 pt-3">
            <span className="text-xs text-rose-600">
              {modStatus.data?.activeAppeal
                ? `Appeal Status: ${modStatus.data.activeAppeal.status}`
                : 'You can request a review from moderators.'}
            </span>
            {!modStatus.data?.activeAppeal ? (
              <Button size="sm" variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100" onClick={() => setIsAppealModalOpen(true)}>
                Request Review
              </Button>
            ) : (
              <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-bold text-rose-900">
                Appeal Under Review
              </span>
            )}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Forum discussions are for educational purposes only and should not be considered a substitute for professional medical advice.
          </p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-ink-100/70 p-1 text-xs font-semibold text-ink-600">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setPage(1) }}
                className={cn(
                  'flex items-center gap-1.5 cursor-pointer rounded-lg px-3.5 py-2 transition-colors',
                  activeTab === tab.key
                    ? 'bg-white text-ink-900 shadow-sm font-bold'
                    : 'hover:text-ink-900',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search discussions..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Categories + Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <PageLoader label="Loading discussions..." />
          ) : (posts.data?.posts ?? []).length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-7" />}
              title="No discussions yet"
              description="Be the first to start a conversation in the community."
              actionLabel="Create Post"
              actionTo="/forum/new"
            />
          ) : (
            <div className="space-y-3">
              {(posts.data?.posts ?? []).map((post: any) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onUpvote={(e) => { e.preventDefault(); upvoteMutation.mutate(post.id) }}
                  onBookmark={(e) => { e.preventDefault(); bookmarkMutation.mutate(post.id) }}
                />
              ))}
            </div>
          )}

          {posts.data && posts.data.pagination.totalPages > 1 && (
            <div className="mt-6">
              <ForumPagination
                page={posts.data.pagination.page}
                totalPages={posts.data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        {/* Sidebar - Categories */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
              <h3 className="font-display text-sm font-bold text-ink-900">Categories</h3>
              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory(''); setPage(1) }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                    !selectedCategory
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-600 hover:bg-ink-50',
                  )}
                >
                  All Categories
                </button>
                {categories.data?.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.id); setPage(1) }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                      selectedCategory === cat.id
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-ink-600 hover:bg-ink-50',
                    )}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-2 text-xs text-ink-400">{cat.postCount}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
