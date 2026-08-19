const ADMIN_REG_KEY = 'imgprep_admin_reg_gate'

export function setAdminRegistrationGate() {
  try { sessionStorage.setItem(ADMIN_REG_KEY, '1') } catch { /* noop */ }
}

export function consumeAdminRegistrationGate(): boolean {
  try {
    const v = sessionStorage.getItem(ADMIN_REG_KEY)
    if (v) sessionStorage.removeItem(ADMIN_REG_KEY)
    return v === '1'
  } catch { return false }
}
