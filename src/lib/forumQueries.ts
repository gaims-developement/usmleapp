import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as forum from '@/lib/forumService'

export const forumQueryKeys = {
  categories: ['forum', 'categories'] as const,
  posts: (params: Record<string, unknown>) => ['forum', 'posts', params] as const,
  post: (id: string) => ['forum', 'post', id] as const,
  myPosts: (page: number) => ['forum', 'my-posts', page] as const,
  bookmarks: (page: number) => ['forum', 'bookmarks', page] as const,
  comments: (postId: string, page: number) => ['forum', 'comments', postId, page] as const,
  reports: (page: number) => ['forum', 'reports', page] as const,
  stats: ['forum', 'stats'] as const,
}

export function useForumCategories() {
  return useQuery({
    queryKey: forumQueryKeys.categories,
    queryFn: forum.getForumCategories,
  })
}

export function useForumPosts(params: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  postType?: string
  sort?: string
}) {
  return useQuery({
    queryKey: forumQueryKeys.posts(params),
    queryFn: () => forum.getForumPosts(params),
  })
}

export function useForumPost(id: string) {
  return useQuery({
    queryKey: forumQueryKeys.post(id),
    queryFn: () => forum.getForumPost(id),
    enabled: Boolean(id),
  })
}

export function useMyPosts(page = 1) {
  return useQuery({
    queryKey: forumQueryKeys.myPosts(page),
    queryFn: () => forum.getMyPosts(page),
  })
}

export function useBookmarks(page = 1) {
  return useQuery({
    queryKey: forumQueryKeys.bookmarks(page),
    queryFn: () => forum.getBookmarks(page),
  })
}

export function useForumComments(postId: string, page = 1) {
  return useQuery({
    queryKey: forumQueryKeys.comments(postId, page),
    queryFn: () => forum.getForumComments(postId, page),
    enabled: Boolean(postId),
  })
}

export function useCreateForumPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ data, files }: { data: { title: string; content: string; categoryId: string; postType?: string }; files: File[] }) => {
      if (files.length > 0) {
        return forum.createForumPostWithAttachments(data, files)
      }
      return forum.createForumPost(data)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'my-posts'] })
    },
  })
}

export function useUpdateForumPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string; categoryId?: string; postType?: string } }) =>
      forum.updateForumPost(id, data),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: forumQueryKeys.post(variables.id) })
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
    },
  })
}

export function useDeleteForumPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => forum.deleteForumPost(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'my-posts'] })
    },
  })
}

export function useCreateForumComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: { content: string; parentId?: string } }) =>
      forum.createForumComment(postId, data),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: forumQueryKeys.comments(variables.postId, 1) })
      void qc.invalidateQueries({ queryKey: forumQueryKeys.post(variables.postId) })
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
    },
  })
}

export function useUpdateForumComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content: string } }) =>
      forum.updateForumComment(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'comments'] })
    },
  })
}

export function useDeleteForumComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => forum.deleteForumComment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'comments'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
    },
  })
}

export function useTogglePostUpvote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => forum.togglePostUpvote(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'post'] })
    },
  })
}

export function useToggleCommentUpvote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => forum.toggleCommentUpvote(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'comments'] })
    },
  })
}

export function useToggleBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => forum.toggleBookmark(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'bookmarks'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'post'] })
    },
  })
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: { reason: string; description?: string } }) =>
      forum.reportPost(postId, data),
  })
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: { reason: string; description?: string } }) =>
      forum.reportComment(commentId, data),
  })
}

export function useForumReports(page = 1) {
  return useQuery({
    queryKey: forumQueryKeys.reports(page),
    queryFn: () => forum.getForumReports(page),
  })
}

export function useResolveReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'resolve' | 'dismiss' }) =>
      forum.resolveReport(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'reports'] })
      void qc.invalidateQueries({ queryKey: forumQueryKeys.stats })
    },
  })
}

export function useModeratePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'hide' | 'restore' }) =>
      forum.moderatePost(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'posts'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'reports'] })
    },
  })
}

export function useModerateComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'remove' | 'restore' }) =>
      forum.moderateComment(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'comments'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'reports'] })
    },
  })
}

export function useForumStats() {
  return useQuery({
    queryKey: forumQueryKeys.stats,
    queryFn: forum.getForumStats,
  })
}

// User Moderation Hooks
export function useMyModerationStatus() {
  return useQuery({
    queryKey: ['forum', 'my-status'],
    queryFn: forum.getMyModerationStatus,
  })
}

export function useSubmitBanAppeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (appealMessage: string) => forum.submitBanAppeal(appealMessage),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'my-status'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'appeals'] })
    },
  })
}

// Admin Moderation Hooks
export function useModerationUsers(page = 1) {
  return useQuery({
    queryKey: ['forum', 'admin', 'users', page],
    queryFn: () => forum.getModerationUsers(page),
  })
}

export function useModerationAppeals(page = 1) {
  return useQuery({
    queryKey: ['forum', 'admin', 'appeals', page],
    queryFn: () => forum.getModerationAppeals(page),
  })
}

export function useReviewModerationAppeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }) =>
      forum.reviewModerationAppeal(id, action, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'appeals'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'users'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'audit-logs'] })
    },
  })
}

export function useUpdateUserStrikes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, action, reason }: { userId: string; action: 'add' | 'remove'; reason?: string }) =>
      forum.updateUserStrikes(userId, action, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'users'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'audit-logs'] })
    },
  })
}

export function useUpdateUserBan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, action, reason, durationDays }: { userId: string; action: 'ban' | 'unban'; reason?: string; durationDays?: number }) =>
      forum.updateUserBan(userId, action, reason, durationDays),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'users'] })
      void qc.invalidateQueries({ queryKey: ['forum', 'admin', 'audit-logs'] })
    },
  })
}

export function useModerationAuditLogs(page = 1) {
  return useQuery({
    queryKey: ['forum', 'admin', 'audit-logs', page],
    queryFn: () => forum.getModerationAuditLogs(page),
  })
}
