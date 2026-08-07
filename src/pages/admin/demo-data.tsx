import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/apiClient'
import { Database, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react'

interface DemoStatusData {
  demoMode: boolean
  demoRecords: number
  realRecords: number
  details: {
    applications: { demo: number; real: number }
    documents: { demo: number; real: number }
    payments: { demo: number; real: number }
    notifications: { demo: number; real: number }
    events: { demo: number; real: number }
  }
}

export function DemoDataPage() {
  const [data, setData] = useState<DemoStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await apiGet<DemoStatusData>('/admin/demo/demo-status')
      setData(res)
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to fetch demo status' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleAction = async (action: 'enable' | 'disable' | 'delete') => {
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await apiPost<{ message: string }>('/admin/demo/demo-action', { action })
      setMessage({ type: 'success', text: res.message || `Demo data action executed successfully` })
      await fetchStatus()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || `Failed to execute action ${action}` })
    } finally {
      setActionLoading(false)
      setShowConfirm(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          System Demo Data Control
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Manage the system's demo data status and clean up seeded records. Demo mode isolation keeps development and testing content separate from live production registrations.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Demo Mode Status</h2>
            <div className="flex items-center gap-3">
              {data?.demoMode ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xl font-bold text-emerald-400">ENABLED</span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                  <span className="text-xl font-bold text-rose-400">DISABLED (PRODUCTION MODE)</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When Demo Mode is enabled, new/seeded demo accounts show test applications, payments, and notifications. In production/disabled mode, only real data is loaded.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleAction('enable')}
              disabled={actionLoading || data?.demoMode}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                data?.demoMode
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              Enable Demo Mode
            </button>
            <button
              onClick={() => handleAction('disable')}
              disabled={actionLoading || !data?.demoMode}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !data?.demoMode
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
              }`}
            >
              Disable Demo Mode
            </button>
          </div>
        </div>

        {/* Database Records Stats */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Database Records Distribution</h2>
          <div className="space-y-4">
            {/* Demo Records Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Demo Records (Seeded)</span>
                <span className="font-semibold text-emerald-400">{data?.demoRecords ?? 0}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (data?.demoRecords ?? 0) + (data?.realRecords ?? 0) === 0
                        ? 0
                        : ((data?.demoRecords ?? 0) / ((data?.demoRecords ?? 0) + (data?.realRecords ?? 0))) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Real Records Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Real Records (User Generated)</span>
                <span className="font-semibold text-sky-400">{data?.realRecords ?? 0}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (data?.demoRecords ?? 0) + (data?.realRecords ?? 0) === 0
                        ? 0
                        : ((data?.realRecords ?? 0) / ((data?.demoRecords ?? 0) + (data?.realRecords ?? 0))) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={actionLoading || data?.demoRecords === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                data?.demoRecords === 0
                  ? 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed'
                  : 'border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:border-rose-500/40'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Delete Seeded Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Details breakdown */}
      {data && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Record Categories breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 text-right font-semibold">Demo (Seeded)</th>
                  <th className="pb-3 text-right font-semibold">Real (Live Users)</th>
                  <th className="pb-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                <tr className="hover:bg-muted/30">
                  <td className="py-3 font-medium">Applications</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{data.details.applications.demo}</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">{data.details.applications.real}</td>
                  <td className="py-3 text-right font-bold">{data.details.applications.demo + data.details.applications.real}</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-3 font-medium">Documents</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{data.details.documents.demo}</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">{data.details.documents.real}</td>
                  <td className="py-3 text-right font-bold">{data.details.documents.demo + data.details.documents.real}</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-3 font-medium">Payments</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{data.details.payments.demo}</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">{data.details.payments.real}</td>
                  <td className="py-3 text-right font-bold">{data.details.payments.demo + data.details.payments.real}</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-3 font-medium">Notifications</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{data.details.notifications.demo}</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">{data.details.notifications.real}</td>
                  <td className="py-3 text-right font-bold">{data.details.notifications.demo + data.details.notifications.real}</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-3 font-medium">Planner Events</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{data.details.events.demo}</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">{data.details.events.real}</td>
                  <td className="py-3 text-right font-bold">{data.details.events.demo + data.details.events.real}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Confirm Demo Data Deletion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you absolutely sure you want to delete all seeded demo data? This action will permanently remove demo applications, payments, notifications, documents, and planner events for accounts ending in <span className="font-semibold text-foreground">@imgprep.com</span>.
              </p>
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl mt-3">
                <p className="text-xs text-rose-400 flex gap-2 font-medium">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  Real user data and production settings will not be modified or deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-all border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('delete')}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default DemoDataPage
