import { useMemo, useState } from 'react'
import { Download, Search, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { auditSeverityMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAuditLogs } from '@/lib/adminQueries'
import type { AuditLog } from '@/mocks/admin/content'

export function SuperAdminAuditLogsPage() {
  const logs = useAuditLogs()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')

  const filtered = useMemo(() => {
    let result = logs.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        l =>
          l.actor.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q),
      )
    }
    if (severity !== 'all') result = result.filter(l => l.severity === severity)
    return result
  }, [logs.data, search, severity])

  if (logs.isLoading) return <PageLoader label="Loading audit logs…" />

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: 'actor',
      header: 'Actor',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
            <ScrollText className="size-4.5" aria-hidden />
          </span>
          <span className="font-semibold text-ink-900">{r.actor}</span>
        </div>
      ),
      sortValue: r => r.actor,
    },
    { key: 'action', header: 'Action', cell: r => r.action },
    { key: 'resource', header: 'Resource', cell: r => r.resource },
    {
      key: 'severity',
      header: 'Severity',
      cell: r => {
        const meta = auditSeverityMeta(r.severity)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'ip', header: 'IP address', cell: r => <span className="font-mono text-xs">{r.ip}</span> },
    { key: 'time', header: 'Timestamp', cell: r => r.time, align: 'right' },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of administrative actions for compliance review."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden />
            Export log
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor, action, resource…"
            className="w-72 pl-9"
            aria-label="Search audit logs"
          />
        </div>
        <Select value={severity} onChange={e => setSeverity(e.target.value)} className="w-44" aria-label="Filter by severity">
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="critical">Critical</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}
