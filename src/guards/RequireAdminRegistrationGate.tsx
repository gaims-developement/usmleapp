import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { consumeAdminRegistrationGate } from '@/lib/adminRegistrationGate'

export function RequireAdminRegistrationGate() {
  const [allowed] = useState(() => consumeAdminRegistrationGate())
  if (!allowed) {
    return <Navigate to="/register/administrative" replace />
  }
  return <Outlet />
}
