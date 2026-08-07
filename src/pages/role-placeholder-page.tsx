import { Construction, ShieldCheck } from 'lucide-react'
import type { Role } from '@/types/rbac'
import { PERMISSION_REGISTRY } from '@/permissions/permissions'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

/**
 * Placeholder home for staff roles. Dashboards are intentionally NOT built
 * yet — this screen confirms the correct role is granted access and lists the
 * permissions the role carries, ready for the next milestone.
 */
export function RolePlaceholderPage({ role }: { role: Role }) {
  const { logout } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <div className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <Construction className="size-7" aria-hidden />
        </span>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
          <ShieldCheck className="size-3.5" aria-hidden />
          {role.name}
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">
          {role.name} dashboard coming soon
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
          {role.description}
        </p>
      </div>

      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">
          Granted permissions ({role.permissions.length})
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {role.permissions.map(p => (
            <li
              key={p}
              className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm text-ink-700"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
              <span className="min-w-0 truncate">{PERMISSION_REGISTRY[p].label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
          Role id: <code className="font-mono font-semibold">{role.id}</code> — this is a
          placeholder until the {role.name} dashboard milestone.
        </p>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
