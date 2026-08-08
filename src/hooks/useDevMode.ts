import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/apiClient'

interface DevModeStatus {
  enabled: boolean
}

export type DevModeState = 'loading' | 'enabled' | 'disabled'

export function useDevMode(): DevModeState {
  const [state, setState] = useState<DevModeState>('loading')

  useEffect(() => {
    let cancelled = false
    apiGet<DevModeStatus>('/devmode/status')
      .then(res => {
        if (!cancelled) setState(res.enabled ? 'enabled' : 'disabled')
      })
      .catch(() => {
        // Fail closed: if the status endpoint is unreachable, devmode is not shown.
        if (!cancelled) setState('disabled')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
