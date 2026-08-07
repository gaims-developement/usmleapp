export interface PlatformSettingToggle {
  id: string
  label: string
  description: string
  value: boolean
}

export interface PlatformSettings {
  organization: {
    name: string
    contactEmail: string
    supportEmail: string
    domain: string
  }
  toggles: PlatformSettingToggle[]
  security: {
    sessionTimeoutHours: number
    force2fa: boolean
    passwordMinLength: number
  }
  notifications: {
    digest: boolean
    applicationAlerts: boolean
    paymentAlerts: boolean
    auditAlerts: boolean
  }
}

export const platformSettings: PlatformSettings = {
  organization: {
    name: 'IMG Prep',
    contactEmail: 'ops@imgprep.com',
    supportEmail: 'support@imgprep.com',
    domain: 'imgprep.com',
  },
  toggles: [
    {
      id: 'registration',
      label: 'Open registration',
      description: 'Allow new student accounts to sign up on their own',
      value: true,
    },
    {
      id: 'auto_onboarding',
      label: 'Auto-approve onboarding',
      description: 'Skip manual review of student onboarding data',
      value: false,
    },
    {
      id: 'public_api',
      label: 'Public read-only API',
      description: 'Expose the public API for hospital and university partners',
      value: false,
    },
    {
      id: 'maintenance',
      label: 'Maintenance mode',
      description: 'Temporarily restrict access for platform updates',
      value: false,
    },
  ],
  security: {
    sessionTimeoutHours: 12,
    force2fa: false,
    passwordMinLength: 8,
  },
  notifications: {
    digest: true,
    applicationAlerts: true,
    paymentAlerts: true,
    auditAlerts: false,
  },
}
