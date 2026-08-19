import { apiGet, apiPost, apiPatch, apiDelete, apiFormPost } from '@/lib/apiClient'

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string | null
  postCount: number
}

export interface ForumPostAuthor {
  id: string
  name: string
  avatarUrl: string | null
  role: string
}

export interface ForumAttachment {
  id: string
  url: string
  fileName: string
  mimeType: string
  fileSize: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  postType: string
  status: string
  upvoteCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  author: ForumPostAuthor
  category: { id: string; name: string; slug: string }
  attachments: ForumAttachment[]
  isUpvoted: boolean
  isBookmarked: boolean
}

export interface ForumComment {
  id: string
  postId: string
  parentId: string | null
  content: string
  upvoteCount: number
  createdAt: string
  updatedAt: string
  author: ForumPostAuthor
  isUpvoted: boolean
  replies?: ForumComment[]
}

export interface ForumReport {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
  reporter: { id: string; name: string }
  post: { id: string; title: string; authorName: string } | null
  comment: { id: string; content: string; authorName: string } | null
  resolvedBy: { id: string; name: string } | null
}

export interface PaginatedResponse<T> {
  posts?: T[]
  comments?: T[]
  reports?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ForumStats {
  totalPosts: number
  totalComments: number
  pendingReports: number
  totalReports: number
}

// Categories
export function getForumCategories() {
  return apiGet<ForumCategory[]>('/forum/categories')
}

// Posts
export function getForumPosts(params: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  postType?: string
  sort?: string
}) {
  const sp = new URLSearchParams()
  if (params.page) sp.set('page', String(params.page))
  if (params.limit) sp.set('limit', String(params.limit))
  if (params.search) sp.set('search', params.search)
  if (params.categoryId) sp.set('categoryId', params.categoryId)
  if (params.postType) sp.set('postType', params.postType)
  if (params.sort) sp.set('sort', params.sort)
  const query = sp.toString()
  return apiGet<PaginatedResponse<ForumPost>>(`/forum/posts${query ? `?${query}` : ''}`)
}

export function getForumPost(id: string) {
  return apiGet<ForumPost>(`/forum/posts/${id}`)
}

export function createForumPost(data: {
  title: string
  content: string
  categoryId: string
  postType?: string
}) {
  return apiPost<ForumPost>('/forum/posts', data)
}

export function createForumPostWithAttachments(
  data: {
    title: string
    content: string
    categoryId: string
    postType?: string
  },
  files: File[],
) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('content', data.content)
  formData.append('categoryId', data.categoryId)
  if (data.postType) formData.append('postType', data.postType)
  for (const file of files) {
    formData.append('attachments', file)
  }
  return apiFormPost<ForumPost>('/forum/posts', formData)
}

export function updateForumPost(id: string, data: {
  title?: string
  content?: string
  categoryId?: string
  postType?: string
}) {
  return apiPatch<ForumPost>(`/forum/posts/${id}`, data)
}

export function deleteForumPost(id: string) {
  return apiDelete(`/forum/posts/${id}`)
}

// My Posts
export function getMyPosts(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ForumPost>>(`/forum/posts/mine?page=${page}&limit=${limit}`)
}

// Bookmarks
export function getBookmarks(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ForumPost>>(`/forum/posts/bookmarked?page=${page}&limit=${limit}`)
}

// Comments
export function getForumComments(postId: string, page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ForumComment>>(`/forum/posts/${postId}/comments?page=${page}&limit=${limit}`)
}

export function createForumComment(postId: string, data: { content: string; parentId?: string }) {
  return apiPost<ForumComment>(`/forum/posts/${postId}/comments`, data)
}

export function updateForumComment(id: string, data: { content: string }) {
  return apiPatch<ForumComment>(`/forum/comments/${id}`, data)
}

export function deleteForumComment(id: string) {
  return apiDelete(`/forum/comments/${id}`)
}

// Upvotes
export function togglePostUpvote(postId: string) {
  return apiPost<{ upvoted: boolean; upvoteCount: number }>(`/forum/posts/${postId}/upvote`)
}

export function toggleCommentUpvote(commentId: string) {
  return apiPost<{ upvoted: boolean; upvoteCount: number }>(`/forum/comments/${commentId}/upvote`)
}

// Bookmarks
export function toggleBookmark(postId: string) {
  return apiPost<{ bookmarked: boolean }>(`/forum/posts/${postId}/bookmark`)
}

// Reports
export function reportPost(postId: string, data: { reason: string; description?: string }) {
  return apiPost(`/forum/posts/${postId}/report`, data)
}

export function reportComment(commentId: string, data: { reason: string; description?: string }) {
  return apiPost(`/forum/comments/${commentId}/report`, data)
}

// Admin
export function getForumReports(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ForumReport>>(`/forum/reports?page=${page}&limit=${limit}`)
}

export function resolveReport(id: string, action: 'resolve' | 'dismiss') {
  return apiPatch(`/forum/reports/${id}/resolve`, { action })
}

export function moderatePost(id: string, action: 'hide' | 'restore') {
  return apiPatch(`/forum/posts/${id}/moderate`, { action })
}

export function moderateComment(id: string, action: 'remove' | 'restore') {
  return apiPatch(`/forum/comments/${id}/moderate`, { action })
}

export function getForumStats() {
  return apiGet<ForumStats>('/forum/stats')
}

// User Moderation & Appeals
export interface MyModerationStatus {
  isBanned: boolean
  strikes: number
  bannedAt?: string | null
  banExpiresAt?: string | null
  reason?: string | null
  activeAppeal?: {
    id: string
    status: string
    appealMessage: string
    createdAt: string
  } | null
}

export function getMyModerationStatus() {
  return apiGet<MyModerationStatus>('/forum/my-status')
}

export function submitBanAppeal(appealMessage: string) {
  return apiPost('/forum/appeals', { appealMessage })
}

// Admin Moderation Panel APIs
export interface ModerationUser {
  id: string
  userId: string
  name: string
  email: string
  role: string
  avatarUrl: string | null
  strikes: number
  isBanned: boolean
  bannedAt: string | null
  banExpiresAt: string | null
  reason: string | null
  updatedAt: string
}

export interface ModerationAppeal {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  reasonForBan: string
  strikeCount: number
  bannedAt: string
  banExpiresAt: string | null
  appealMessage: string
  status: string
  reviewedBy: { id: string; name: string } | null
  reviewNotes: string | null
  createdAt: string
}

export interface ModerationAuditLog {
  id: string
  userId: string
  userName: string
  userEmail: string
  moderatorName: string
  action: string
  reason: string
  severity: string
  matchedTerms: string[] | null
  relatedPostId: string | null
  relatedCommentId: string | null
  createdAt: string
}

export function getModerationUsers(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ModerationUser>>(`/forum/admin/users?page=${page}&limit=${limit}`)
}

export function getModerationAppeals(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ModerationAppeal>>(`/forum/admin/appeals?page=${page}&limit=${limit}`)
}

export function reviewModerationAppeal(id: string, action: 'approve' | 'reject', notes?: string) {
  return apiPatch(`/forum/admin/appeals/${id}`, { action, notes })
}

export function updateUserStrikes(userId: string, action: 'add' | 'remove', reason?: string) {
  return apiPost(`/forum/admin/users/${userId}/strike`, { action, reason })
}

export function updateUserBan(userId: string, action: 'ban' | 'unban', reason?: string, durationDays = 7) {
  return apiPost(`/forum/admin/users/${userId}/ban`, { action, reason, durationDays })
}

export function getModerationAuditLogs(page = 1, limit = 20) {
  return apiGet<PaginatedResponse<ModerationAuditLog>>(`/forum/admin/audit-logs?page=${page}&limit=${limit}`)
}
