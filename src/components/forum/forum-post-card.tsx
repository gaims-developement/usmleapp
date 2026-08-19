import { Link } from 'react-router-dom'
import { ArrowBigUp, Bookmark, Clock, MessageSquare } from 'lucide-react'
import { ForumCategoryBadge } from '@/components/forum/forum-category-badge'
import { cn } from '@/lib/utils'
import type { ForumPost } from '@/lib/forumService'

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes <= 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const roleBadgeColors: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  DOCTOR: 'bg-emerald-100 text-emerald-700',
  REVIEWER: 'bg-violet-100 text-violet-700',
  HOSPITAL: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-rose-100 text-rose-700',
  SUPER_ADMIN: 'bg-rose-100 text-rose-700',
}

export function ForumPostCard({
  post,
  onUpvote,
  onBookmark,
}: {
  post: ForumPost
  onUpvote?: (e: React.MouseEvent) => void
  onBookmark?: (e: React.MouseEvent) => void
}) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft transition-all hover:shadow-lift sm:p-6">
      <div className="flex gap-4">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onUpvote}
            className={cn(
              'grid size-10 cursor-pointer place-items-center rounded-xl border transition-colors',
              post.isUpvoted
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-ink-200 text-ink-400 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600',
            )}
          >
            <ArrowBigUp className="size-5" />
          </button>
          <span className={cn(
            'text-sm font-bold',
            post.isUpvoted ? 'text-brand-700' : 'text-ink-500',
          )}>
            {post.upvoteCount}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ForumCategoryBadge name={post.category.name} slug={post.category.slug} />
            {post.postType !== 'DISCUSSION' && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
                {post.postType.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <Link
            to={`/forum/post/${post.id}`}
            className="mt-2 block font-display text-base font-bold leading-snug text-ink-900 hover:text-brand-700 transition-colors"
          >
            {post.title}
          </Link>

          <p className="mt-1.5 line-clamp-2 text-sm text-ink-600 leading-relaxed">
            {post.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="grid size-5 place-items-center rounded-full bg-accent-600 text-[9px] font-bold text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-ink-700">{post.author.name}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase',
                  roleBadgeColors[post.author.role] ?? 'bg-ink-100 text-ink-600',
                )}
              >
                {post.author.role}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" aria-hidden />
              {formatRelativeTime(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" aria-hidden />
              {post.commentCount} {post.commentCount === 1 ? 'reply' : 'replies'}
            </span>
            <button
              type="button"
              onClick={onBookmark}
              className={cn(
                'flex items-center gap-1 cursor-pointer transition-colors',
                post.isBookmarked ? 'text-amber-600' : 'hover:text-amber-500',
              )}
            >
              <Bookmark className={cn('size-3', post.isBookmarked && 'fill-current')} />
              {post.isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
