import { ShieldCheck, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { PageLoader } from '@/components/ui/spinner'
import { useRoleSummaries } from '@/lib/adminQueries'
import { roleById } from '@/roles/roles'
import { formatDate } from '@/lib/utils'

export function SuperAdminRolesPage() {
  const roles = useRoleSummaries()

  if (roles.isLoading) return <PageLoader label="Loading roles…" />

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Review the six platform roles, their members, and granted permissions."
        actions={
          <ButtonLink to="/dashboard/super-admin/roles" size="sm">
            <ShieldCheck className="size-4" aria-hidden />
            Manage permissions
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.data!.map(role => {
          const definition = roleById(role.id)
          return (
            <div
              key={role.id}
              className="flex flex-col rounded-3xl border border-ink-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                  <Users className="size-3.5" aria-hidden />
                  {role.members.toLocaleString()} members
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{role.name}</h3>
              <p className="mt-1.5 flex-1 text-sm text-ink-600">{role.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <StatusBadge label={`${definition.permissions.length} permissions`} tone="brand" />
                {definition.manageableRoles.length > 0 && (
                  <StatusBadge
                    label={`Manages ${definition.manageableRoles.length} role${definition.manageableRoles.length === 1 ? '' : 's'}`}
                    tone="violet"
                  />
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                <p className="text-xs text-ink-400">Updated {formatDate(role.updatedAt)}</p>
                <ButtonLink to="/dashboard/super-admin/roles" variant="outline" size="sm">
                  Manage
                </ButtonLink>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
