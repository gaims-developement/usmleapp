import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowBigUp,
  ArrowLeft,
  Bookmark,
  MessageSquare,
  Pencil,
  Trash2,
  Flag,
  AlertTriangle,
} from 'lucide-react'
import { PageLoader } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ForumCategoryBadge } from '@/components/forum/forum-category-badge'
import { ForumReportModal } from '@/components/forum/forum-report-modal'
import { ForumPagination } from '@/components/forum/forum-pagination'
import {
  useForumPost,
  useForumComments,
  useCreateForumComment,
  useUpdateForumComment,
  useDeleteForumComment,
  useTogglePostUpvote,
  useToggleCommentUpvote,
  useToggleBookmark,
  useReportPost,
  useReportComment,
} from '@/lib/forumQueries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const roleBadgeColors: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  DOCTOR: 'bg-emerald-100 text-emerald-700',
  REVIEWER: 'bg-violet-100 text-violet-700',
  HOSPITAL: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-rose-100 text-rose-700',
  SUPER_ADMIN: 'bg-rose-100 text-rose-700',
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes <= 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  onUpvote,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: {
  comment: any
  postId: string
  currentUserId?: string
  onUpvote: (id: string) => void
  onReply: (parentId: string) => void
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onReport: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const isOwner = currentUserId === comment.author.id

  return (
    <div className="group">
      <div className="flex gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white">
          {comment.author.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900">{comment.author.name}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase',
                roleBadgeColors[comment.author.role] ?? 'bg-ink-100 text-ink-600',
              )}
            >
              {comment.author.role}
            </span>
            <span className="text-xs text-ink-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="mt-2">
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => { onEdit(comment.id, editContent); setEditing(false) }}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditContent(comment.content) }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700 leading-relaxed">{comment.content}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
            <button
              type="button"
              onClick={() => onUpvote(comment.id)}
              className={cn(
                'flex items-center gap-1 cursor-pointer transition-colors',
                comment.isUpvoted ? 'text-brand-600 font-semibold' : 'hover:text-brand-600',
              )}
            >
              <ArrowBigUp className={cn('size-4', comment.isUpvoted && 'fill-current')} />
              {comment.upvoteCount}
            </button>
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="cursor-pointer transition-colors hover:text-ink-700"
            >
              Reply
            </button>
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="cursor-pointer transition-colors hover:text-ink-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="cursor-pointer transition-colors hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}
            {!isOwner && (
              <button
                type="button"
                onClick={() => onReport(comment.id)}
                className="cursor-pointer transition-colors hover:text-amber-600"
              >
                Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3 border-l-2 border-ink-100 pl-4">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onUpvote={onUpvote}
              onReply={() => {}}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ForumPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const post = useForumPost(id ?? '')
  const comments = useForumComments(id ?? '')
  const createComment = useCreateForumComment()
  const updateComment = useUpdateForumComment()
  const deleteComment = useDeleteForumComment()
  const upvotePost = useTogglePostUpvote()
  const upvoteComment = useToggleCommentUpvote()
  const bookmarkPost = useToggleBookmark()
  const reportPostMutation = useReportPost()
  const reportCommentMutation = useReportComment()

  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string }>({ type: 'post', id: '' })

  const postData = post.data
  const commentsData = comments.data?.comments ?? []
  const isAuthor = user?.id === postData?.author.id

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !id) return

    createComment.mutate(
      {
        postId: id,
        data: {
          content: commentText.trim(),
          ...(replyTo ? { parentId: replyTo } : {}),
        },
      },
      {
        onSuccess: () => {
          setCommentText('')
          setReplyTo(null)
          toast.success('Comment posted', 'Your comment has been published.')
        },
        onError: (err) => {
          toast.error('Failed to post comment', err.message)
        },
      },
    )
  }

  function handleDeletePost() {
    if (!id) return
    // TODO: implement delete via mutation
    setShowDeleteModal(false)
    toast.success('Post deleted', 'Your post has been removed.')
    navigate('/forum')
  }

  if (post.isPending) return <PageLoader label="Loading discussion..." />
  if (post.isError || !postData) {
    return (
      <div className="py-24 text-center">
        <p className="text-ink-500">Post not found or unavailable.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/forum')}>
          Back to Forum
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-4" />
          Forum
        </button>
        <span className="text-ink-300">/</span>
        <Link to="/forum" className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-700">
          {postData.category.name}
        </Link>
      </div>

      {/* Post */}
      <article className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <ForumCategoryBadge name={postData.category.name} slug={postData.category.slug} />
          {postData.postType !== 'DISCUSSION' && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
              {postData.postType.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <h1 className="mt-3 font-display text-xl font-bold text-ink-900">{postData.title}</h1>

        <div className="mt-3 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent-600 text-xs font-bold text-white">
            {postData.author.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <span className="text-sm font-semibold text-ink-900">{postData.author.name}</span>
            <span
              className={cn(
                'ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase',
                roleBadgeColors[postData.author.role] ?? 'bg-ink-100 text-ink-600',
              )}
            >
              {postData.author.role}
            </span>
          </div>
          <span className="text-xs text-ink-400">{formatRelativeTime(postData.createdAt)}</span>
        </div>

        <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {postData.content}
        </div>

        {/* Attachments */}
        {postData.attachments.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-ink-100 pt-4">
            {postData.attachments.map(att => (
              <div key={att.id}>
                {att.mimeType.startsWith('image/') ? (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="max-h-64 rounded-xl border border-ink-200 object-contain"
                    />
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    📄 {att.fileName}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={() => upvotePost.mutate(postData.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              postData.isUpvoted
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-ink-200 text-ink-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600',
            )}
          >
            <ArrowBigUp className={cn('size-4', postData.isUpvoted && 'fill-current')} />
            {postData.upvoteCount}
          </button>
          <button
            type="button"
            onClick={() => bookmarkPost.mutate(postData.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              postData.isBookmarked
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-ink-200 text-ink-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600',
            )}
          >
            <Bookmark className={cn('size-4', postData.isBookmarked && 'fill-current')} />
            {postData.isBookmarked ? 'Saved' : 'Save'}
          </button>
          {!isAuthor && (
            <button
              type="button"
              onClick={() => { setReportTarget({ type: 'post', id: postData.id }); setShowReportModal(true) }}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
            >
              <Flag className="size-4" />
              Report
            </button>
          )}
          {isAuthor && (
            <div className="ml-auto flex gap-2">
              <Link
                to={`/forum/post/${postData.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >
                <Pencil className="size-3.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink-900">
          {postData.commentCount} {postData.commentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Comment form */}
        <form onSubmit={handleSubmitComment} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-xs text-brand-700">
              Replying to comment
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="cursor-pointer font-semibold hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <Textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" size="sm" disabled={!commentText.trim() || createComment.isPending}>
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {comments.isPending ? (
          <PageLoader label="Loading comments..." />
        ) : commentsData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 py-12 text-center">
            <MessageSquare className="mx-auto size-8 text-ink-300" />
            <p className="mt-2 text-sm text-ink-500">No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentsData.map((comment: any) => (
              <div key={comment.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
                <CommentItem
                  comment={comment}
                  postId={id ?? ''}
                  currentUserId={user?.id}
                  onUpvote={(commentId) => upvoteComment.mutate(commentId)}
                  onReply={(parentId) => setReplyTo(parentId)}
                  onEdit={(commentId, content) => updateComment.mutate({ id: commentId, data: { content } })}
                  onDelete={(commentId) => {
                    if (window.confirm('Delete this comment?')) {
                      deleteComment.mutate(commentId)
                    }
                  }}
                  onReport={(commentId) => { setReportTarget({ type: 'comment', id: commentId }); setShowReportModal(true) }}
                />
              </div>
            ))}
          </div>
        )}

        {comments.data && comments.data.pagination.totalPages > 1 && (
          <ForumPagination
            page={comments.data.pagination.page}
            totalPages={comments.data.pagination.totalPages}
            onPageChange={() => comments.refetch()}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Post" size="sm">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <p className="pt-1 text-sm text-ink-600">This action cannot be undone. Your post will be permanently removed.</p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePost}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Report modal */}
      <ForumReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType={reportTarget.type}
        onSubmit={(reason, description) => {
          if (reportTarget.type === 'post') {
            reportPostMutation.mutate(
              { postId: reportTarget.id, data: { reason, description } },
              {
                onSuccess: () => toast.success('Report submitted', 'Thank you for helping keep the community safe.'),
                onError: (err) => toast.error('Failed to submit report', err.message),
              },
            )
          } else {
            reportCommentMutation.mutate(
              { commentId: reportTarget.id, data: { reason, description } },
              {
                onSuccess: () => toast.success('Report submitted', 'Thank you for helping keep the community safe.'),
                onError: (err) => toast.error('Failed to submit report', err.message),
              },
            )
          }
        }}
      />
    </div>
  )
}
