import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Flag,
  ShieldAlert,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { ForumPagination } from '@/components/forum/forum-pagination'
import {
  useForumReports,
  useResolveReport,
  useModeratePost,
  useModerateComment,
  useForumStats,
  useModerationUsers,
  useModerationAppeals,
  useReviewModerationAppeal,
  useUpdateUserStrikes,
  useUpdateUserBan,
  useModerationAuditLogs,
} from '@/lib/forumQueries'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const reasonLabels: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  MEDICAL_MISINFORMATION: 'Medical misinformation',
  OFFENSIVE_CONTENT: 'Offensive content',
  ADVERTISING: 'Advertising',
  PERSONAL_INFORMATION: 'Personal information',
  OTHER: 'Other',
}

type Tab = 'reports' | 'users' | 'appeals' | 'audit'

export function ForumModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reports')
  const [page, setPage] = useState(1)
  const toast = useToast()

  const stats = useForumStats()
  const reports = useForumReports(activeTab === 'reports' ? page : 1)
  const users = useModerationUsers(activeTab === 'users' ? page : 1)
  const appeals = useModerationAppeals(activeTab === 'appeals' ? page : 1)
  const auditLogs = useModerationAuditLogs(activeTab === 'audit' ? page : 1)

  const resolveReport = useResolveReport()
  const moderatePost = useModeratePost()
  const moderateComment = useModerateComment()

  const reviewAppeal = useReviewModerationAppeal()
  const updateStrikes = useUpdateUserStrikes()
  const updateBan = useUpdateUserBan()

  const reportList = reports.data?.reports ?? []
  const userList = users.data?.users ?? []
  const appealList = appeals.data?.appeals ?? []
  const auditList = auditLogs.data?.auditLogs ?? []

  function getActivePagination() {
    if (activeTab === 'reports') return reports.data?.pagination
    if (activeTab === 'users') return users.data?.pagination
    if (activeTab === 'appeals') return appeals.data?.pagination
    if (activeTab === 'audit') return auditLogs.data?.pagination
    return undefined
  }

  const pagination = getActivePagination()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forum Moderation Panel"
        subtitle="Review reported content, manage user strikes, process ban appeals, and inspect audit logs."
      />

      {/* Stats */}
      {stats.data && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <p className="text-xs font-bold uppercase text-ink-500">Total Posts</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-900">{stats.data.totalPosts}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <p className="text-xs font-bold uppercase text-ink-500">Total Comments</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-900">{stats.data.totalComments}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <p className="text-xs font-bold uppercase text-ink-500">Pending Reports</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-600">{stats.data.pendingReports}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <p className="text-xs font-bold uppercase text-ink-500">Total Reports</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-900">{stats.data.totalReports}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-ink-200 text-sm font-semibold">
        <button
          type="button"
          onClick={() => { setActiveTab('reports'); setPage(1) }}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 cursor-pointer transition-colors',
            activeTab === 'reports' ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900',
          )}
        >
          <Flag className="size-4" />
          Reported Content
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('users'); setPage(1) }}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 cursor-pointer transition-colors',
            activeTab === 'users' ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900',
          )}
        >
          <ShieldAlert className="size-4" />
          User Moderation & Bans
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('appeals'); setPage(1) }}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 cursor-pointer transition-colors',
            activeTab === 'appeals' ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900',
          )}
        >
          <UserCheck className="size-4" />
          Review Appeals
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('audit'); setPage(1) }}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 cursor-pointer transition-colors',
            activeTab === 'audit' ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900',
          )}
        >
          <FileText className="size-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Reported Content */}
      {activeTab === 'reports' && (
        reports.isPending ? (
          <PageLoader label="Loading reports..." />
        ) : reportList.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="size-7" />}
            title="No reports"
            description="There are no reports to review at this time."
          />
        ) : (
          <div className="space-y-3">
            {reportList.map((report: any) => (
              <div
                key={report.id}
                className={cn(
                  'rounded-2xl border bg-white p-5 shadow-soft',
                  report.status === 'PENDING' ? 'border-amber-200' : 'border-ink-200',
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                          report.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : report.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-ink-100 text-ink-600',
                        )}
                      >
                        {report.status}
                      </span>
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        {reasonLabels[report.reason] ?? report.reason}
                      </span>
                      {report.post && (
                        <span className="text-xs text-ink-500">
                          Post: <strong className="text-ink-700">{report.post.title}</strong>
                        </span>
                      )}
                      {report.comment && (
                        <span className="text-xs text-ink-500">
                          Comment by {report.comment.authorName}
                        </span>
                      )}
                    </div>

                    {report.description && (
                      <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                        "{report.description}"
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span>Reported by {report.reporter.name}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.resolvedBy && (
                        <span>Resolved by {report.resolvedBy.name}</span>
                      )}
                    </div>
                  </div>

                  {report.status === 'PENDING' && (
                    <div className="flex flex-wrap gap-2">
                      {report.post && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderatePost.mutate(
                              { id: report.post!.id, action: 'hide' },
                              { onSuccess: () => toast.success('Post hidden', 'The post has been hidden.') },
                            )}
                          >
                            <EyeOff className="size-3.5" />
                            Hide Post
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderatePost.mutate(
                              { id: report.post!.id, action: 'restore' },
                              { onSuccess: () => toast.success('Post restored', 'The post has been restored.') },
                            )}
                          >
                            <Eye className="size-3.5" />
                            Restore Post
                          </Button>
                        </>
                      )}
                      {report.comment && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderateComment.mutate(
                              { id: report.comment!.id, action: 'remove' },
                              { onSuccess: () => toast.success('Comment removed', 'The comment has been removed.') },
                            )}
                          >
                            <XCircle className="size-3.5" />
                            Remove Comment
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderateComment.mutate(
                              { id: report.comment!.id, action: 'restore' },
                              { onSuccess: () => toast.success('Comment restored', 'The comment has been restored.') },
                            )}
                          >
                            <Eye className="size-3.5" />
                            Restore Comment
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => resolveReport.mutate(
                          { id: report.id, action: 'resolve' },
                          { onSuccess: () => toast.success('Report resolved', 'The report has been marked as resolved.') },
                        )}
                      >
                        <CheckCircle className="size-3.5" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveReport.mutate(
                          { id: report.id, action: 'dismiss' },
                          { onSuccess: () => toast.success('Report dismissed', 'The report has been dismissed.') },
                        )}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: User Moderation & Bans */}
      {activeTab === 'users' && (
        users.isPending ? (
          <PageLoader label="Loading user moderation records..." />
        ) : userList.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="size-7" />}
            title="No user moderation records"
            description="No users currently have strikes or bans."
          />
        ) : (
          <div className="space-y-3">
            {userList.map((modUser: any) => (
              <div key={modUser.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-900">{modUser.name}</span>
                      <span className="text-xs text-ink-500">({modUser.email})</span>
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-700">
                        {modUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-600">
                      <span>Strikes: <strong className="text-amber-700">{modUser.strikes}</strong></span>
                      <span>Status: {modUser.isBanned ? <strong className="text-rose-600">Banned</strong> : <strong className="text-emerald-600 font-bold">Active</strong>}</span>
                      {modUser.isBanned && (modUser.bannedAt || modUser.banExpiresAt) && (
                        <span>Banned On: {new Date(modUser.bannedAt || modUser.banExpiresAt).toLocaleString()}</span>
                      )}
                    </div>
                    {modUser.reason && (
                      <p className="text-xs text-ink-500">Reason: "{modUser.reason}"</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStrikes.mutate(
                        { userId: modUser.userId, action: 'add' },
                        { onSuccess: () => toast.success('Strike Added', `Added strike to ${modUser.name}`) }
                      )}
                    >
                      + Add Strike
                    </Button>
                    {modUser.strikes > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStrikes.mutate(
                          { userId: modUser.userId, action: 'remove' },
                          { onSuccess: () => toast.success('Strike Removed', `Removed strike from ${modUser.name}`) }
                        )}
                      >
                        - Remove Strike
                      </Button>
                    )}
                    {modUser.isBanned ? (
                      <Button
                        size="sm"
                        onClick={() => updateBan.mutate(
                          { userId: modUser.userId, action: 'unban' },
                          { onSuccess: () => toast.success('User Unbanned', `${modUser.name} has been unbanned.`) }
                        )}
                      >
                        <UserCheck className="size-3.5 mr-1" />
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateBan.mutate(
                          { userId: modUser.userId, action: 'ban', durationDays: 7 },
                          { onSuccess: () => toast.success('User Banned', `${modUser.name} has been temporarily banned for 7 days.`) }
                        )}
                      >
                        <UserX className="size-3.5 mr-1" />
                        Temp Ban (7d)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Review Appeals */}
      {activeTab === 'appeals' && (
        appeals.isPending ? (
          <PageLoader label="Loading review appeals..." />
        ) : appealList.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="size-7" />}
            title="No review appeals"
            description="There are no ban review appeals to evaluate."
          />
        ) : (
          <div className="space-y-3">
            {appealList.map((appeal: any) => (
              <div key={appeal.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-900">{appeal.userName}</span>
                      <span className="text-xs text-ink-500">({appeal.userEmail})</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                          appeal.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : appeal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        )}
                      >
                        {appeal.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      Banned at: {new Date(appeal.bannedAt).toLocaleString()} (Strikes: {appeal.strikeCount})
                    </p>
                  </div>
                  {appeal.status === 'OPEN' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => reviewAppeal.mutate(
                          { id: appeal.id, action: 'approve', notes: 'Approved by moderator' },
                          { onSuccess: () => toast.success('Appeal Approved', 'User ban lifted.') }
                        )}
                      >
                        Approve & Unban
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reviewAppeal.mutate(
                          { id: appeal.id, action: 'reject', notes: 'Rejected by moderator' },
                          { onSuccess: () => toast.success('Appeal Rejected', 'Appeal rejected.') }
                        )}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-ink-50 p-3.5 text-xs text-ink-800">
                  <p className="font-bold text-ink-900 mb-1">User's Appeal Message:</p>
                  <p className="italic">"{appeal.appealMessage}"</p>
                </div>

                {appeal.reviewNotes && (
                  <p className="text-xs text-ink-500">Moderator notes: {appeal.reviewNotes}</p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        auditLogs.isPending ? (
          <PageLoader label="Loading audit logs..." />
        ) : auditList.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-7" />}
            title="No audit logs"
            description="No moderation actions have been recorded yet."
          />
        ) : (
          <div className="rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-soft">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50/80 font-bold uppercase text-ink-600">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 text-ink-800">
                {auditList.map((log: any) => (
                  <tr key={log.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{log.userName}</td>
                    <td className="px-4 py-3">{log.moderatorName}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        log.action.includes('BAN') ? 'bg-rose-100 text-rose-800' : log.action.includes('WARNING') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">{log.severity}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pagination */}
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
