export interface LegalSection {
  title: string
  paragraphs?: string[]
  items?: string[]
}

export const privacySections: LegalSection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'Welcome to IMG Prep – USMLE Preparation Platform ("IMG Prep", "we", "our", or "us").',
      'We are committed to protecting your privacy and handling your personal information responsibly. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices you have regarding your information.',
      'By using IMG Prep, you agree to the practices described in this Privacy Policy.',
    ],
  },
  {
    title: '2. Information We Collect',
    paragraphs: ['Personal Information'],
    items: [
      'Full name',
      'Email address',
      'Password (encrypted)',
      'Country',
      'Medical school',
      'Graduation year',
      'USMLE preparation stage',
      'Profile picture (optional)',
    ],
  },
  {
    title: 'Study Information',
    paragraphs: ['To provide personalized features, we may collect:'],
    items: [
      'Study progress',
      'Completed resources',
      'Bookmarked materials',
      'Notes',
      'Flashcards',
      'Study planner information',
      'Daily goals',
      'Learning preferences',
    ],
  },
  {
    title: 'Technical Information',
    paragraphs: ['We may automatically collect:'],
    items: [
      'IP address',
      'Browser type',
      'Device information',
      'Operating system',
      'Session information',
      'Cookies',
      'Log files',
      'Usage analytics',
    ],
  },
  {
    title: '3. How We Use Your Information',
    paragraphs: ['Your information is used to:'],
    items: [
      'Create and manage your account',
      'Provide access to platform features',
      'Track study progress',
      'Save bookmarks and notes',
      'Personalize your learning experience',
      'Improve platform performance',
      'Respond to support requests',
      'Send important service announcements',
      'Maintain platform security',
      'Detect fraud or misuse',
    ],
  },
  {
    title: '4. Cookies',
    paragraphs: ['We use cookies and similar technologies to:'],
    items: [
      'Keep you logged in',
      'Remember your preferences',
      'Improve website performance',
      'Analyze platform usage',
      'Enhance user experience',
    ],
  },
  {
    title: '5. Data Storage and Security',
    paragraphs: [
      'We take reasonable technical and organizational measures to protect your information, including:',
    ],
    items: [
      'Encrypted passwords',
      'Secure HTTPS connections',
      'Access controls',
      'Secure database storage',
      'Regular security updates',
      'Limited administrative access',
    ],
  },
  {
    title: '6. Sharing Your Information',
    paragraphs: ['We do not sell or rent your personal information.', 'We may share information only when necessary:'],
    items: [
      'With trusted service providers who help operate the platform',
      'To comply with applicable laws or legal requests',
      'To protect the rights, safety, or security of IMG Prep or its users',
      'During a business transfer, merger, or acquisition',
    ],
  },
  {
    title: '7. Third-Party Services',
    paragraphs: ['IMG Prep may use trusted third-party services, including:'],
    items: [
      'Authentication providers',
      'Cloud hosting services',
      'Database providers',
      'Analytics services',
      'Payment processors (if premium services are introduced)',
    ],
  },
  {
    title: '8. Data Retention',
    paragraphs: [
      'We retain your information only as long as necessary to:',
      'If you delete your account, we will delete or anonymize your personal data within a reasonable period, except where retention is required by law.',
    ],
    items: [
      'Maintain your account',
      'Provide platform services',
      'Meet legal obligations',
      'Resolve disputes',
      'Enforce our Terms of Service',
    ],
  },
  {
    title: '9. Your Rights',
    paragraphs: ['Depending on your location, you may have the right to:'],
    items: [
      'Access your personal data',
      'Correct inaccurate information',
      'Update your profile',
      'Request deletion of your account',
      'Request a copy of your personal data',
      'Withdraw consent where applicable',
    ],
  },
  {
    title: '10. Children\u2019s Privacy',
    paragraphs: [
      'IMG Prep is intended for medical students, graduates, and healthcare professionals.',
      'We do not knowingly collect personal information from individuals under the age required by applicable law. If such information is discovered, it will be removed promptly.',
    ],
  },
  {
    title: '11. International Users',
    paragraphs: [
      'If you access IMG Prep from outside the country where our servers are located, your information may be transferred and processed in accordance with applicable data protection laws.',
      'By using the platform, you consent to such transfers where permitted by law.',
    ],
  },
  {
    title: '12. Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time.',
      'Material changes will be communicated by updating the "Last Updated" date and, where appropriate, through notices within the platform.',
      'Continued use of IMG Prep after changes become effective constitutes acceptance of the updated Privacy Policy.',
    ],
  },
  {
    title: '13. Contact Us',
    paragraphs: [
      'If you have questions regarding this Privacy Policy or your personal data, please contact us:',
    ],
    items: [
      'IMG Prep – USMLE Preparation Platform',
      'Email: support@imgprep.com (Replace with your official support email.)',
      'Website: https://your-domain.com (Replace with your official website URL.)',
    ],
  },
  {
    title: '14. Consent',
    paragraphs: [
      'By creating an account or using IMG Prep, you acknowledge that you have read, understood, and agree to this Privacy Policy.',
    ],
  },
]

export const termsSections: LegalSection[] = [
  {
    title: '1. Acceptance of Terms',
    paragraphs: [
      'Welcome to IMG Prep ("IMG Prep", "we", "our", or "us").',
      'By accessing or using our website, mobile application, or services, you agree to be bound by these Terms and Conditions. If you do not agree with these terms, please do not use our platform.',
    ],
  },
  {
    title: '2. About IMG Prep',
    paragraphs: [
      'IMG Prep is an educational and application management platform designed to assist International Medical Graduates (IMGs) by providing:',
    ],
    items: [
      'Clinical elective opportunities',
      'Elective application management',
      'Residency guidance',
      'USMLE preparation resources',
      'Mentorship',
      'Educational content',
      'Document management',
    ],
  },
  {
    title: '3. Eligibility',
    paragraphs: ['To use IMG Prep, you must:'],
    items: [
      'Be at least 18 years of age or the age of majority in your jurisdiction.',
      'Provide accurate registration information.',
      'Maintain the confidentiality of your account credentials.',
      'Use the platform only for lawful purposes.',
    ],
  },
  {
    title: '4. User Accounts',
    paragraphs: ['You are responsible for:'],
    items: [
      'Maintaining the security of your account.',
      'Keeping your information accurate and up to date.',
      'All activities that occur under your account.',
    ],
  },
  {
    title: '5. Clinical Elective Applications',
    paragraphs: [
      'IMG Prep facilitates access to clinical elective opportunities.',
      'Please note:',
    ],
    items: [
      'Submission of an application does not guarantee acceptance.',
      'Acceptance decisions are made solely by the participating institution or organization.',
      'Program requirements, eligibility criteria, fees, and deadlines may change without prior notice.',
      'Applicants are responsible for ensuring that all submitted information is accurate.',
    ],
  },
  {
    title: '6. Payments',
    paragraphs: [
      'Certain services offered through IMG Prep may require payment.',
      'By purchasing any service, you agree that:',
    ],
    items: [
      'Fees are displayed before payment.',
      'Payments are processed through secure third-party payment providers.',
      'Prices may change without prior notice.',
      'Taxes, where applicable, are the responsibility of the user.',
    ],
  },
  {
    title: '7. Refund Policy',
    paragraphs: ['Unless otherwise stated:'],
    items: [
      'Application fees are generally non-refundable once processing has begun.',
      'Refund requests will be reviewed on a case-by-case basis.',
      'Processing fees charged by payment providers may not be refundable.',
      'Specific programs may have separate refund policies.',
    ],
  },
  {
    title: '8. User Responsibilities',
    paragraphs: ['You agree not to:'],
    items: [
      'Provide false or misleading information.',
      'Upload fraudulent or altered documents.',
      'Attempt unauthorized access to the platform.',
      'Interfere with platform security.',
      'Upload malicious software.',
      'Use the platform for illegal activities.',
      'Copy or distribute platform content without permission.',
    ],
  },
  {
    title: '9. Documents',
    paragraphs: ['Users may upload documents such as:'],
    items: [
      'Passport',
      'Curriculum Vitae (CV)',
      'Academic transcripts',
      'Immunization records',
      'Identification documents',
      'USMLE score reports',
      'Letters of Recommendation',
      'Other required application materials',
    ],
  },
  {
    title: '10. Intellectual Property',
    paragraphs: ['All content available on IMG Prep, including but not limited to:'],
    items: [
      'Logos',
      'Branding',
      'Design',
      'Source code',
      'Graphics',
      'Educational materials',
      'Text',
      'Icons',
      'Images',
    ],
  },
  {
    title: '11. Educational Content',
    paragraphs: [
      'Educational materials provided through IMG Prep are intended for informational purposes only.',
      'They should not be considered:',
    ],
    items: [
      'Medical advice',
      'Legal advice',
      'Immigration advice',
      'Professional licensing advice',
    ],
  },
  {
    title: '12. Third-Party Services',
    paragraphs: [
      'IMG Prep may include links to third-party services, institutions, hospitals, payment providers, or external websites.',
      'We are not responsible for:',
    ],
    items: [
      'Their content',
      'Their policies',
      'Their availability',
      'Their services',
    ],
  },
  {
    title: '13. Disclaimer',
    paragraphs: [
      'While we strive to provide accurate and up-to-date information, IMG Prep does not warrant that:',
    ],
    items: [
      'All information is always complete or current.',
      'Every elective opportunity will remain available.',
      'Every application will be successful.',
      'The platform will be uninterrupted or error-free.',
    ],
  },
  {
    title: '14. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by law, IMG Prep shall not be liable for:',
    ],
    items: [
      'Rejection of elective applications',
      'Residency application outcomes',
      'Visa decisions',
      'Travel expenses',
      'Loss of data',
      'Loss of profits',
      'Indirect, incidental, or consequential damages arising from your use of the platform',
    ],
  },
  {
    title: '15. Account Suspension or Termination',
    paragraphs: ['We reserve the right to suspend or terminate accounts that:'],
    items: [
      'Violate these Terms and Conditions.',
      'Engage in fraudulent activity.',
      'Misuse the platform.',
      'Threaten the security or integrity of the platform.',
    ],
  },
  {
    title: '16. Privacy',
    paragraphs: [
      'Your use of IMG Prep is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.',
    ],
  },
  {
    title: '17. Changes to the Terms',
    paragraphs: [
      'We may update these Terms and Conditions from time to time.',
      'Changes become effective upon publication on the platform. Continued use of IMG Prep after updates constitutes acceptance of the revised Terms.',
    ],
  },
  {
    title: '18. Governing Law',
    paragraphs: [
      'These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the jurisdiction in which IMG Prep operates, without regard to conflict of law principles.',
    ],
  },
  {
    title: '19. Contact Information',
    paragraphs: ['For questions regarding these Terms and Conditions, please contact us:'],
    items: [
      'IMG Prep – Clinical Electives & Residency Platform',
      'Email: support@imgprep.com (Replace with your official support email.)',
      'Website: https://your-domain.com (Replace with your official website URL.)',
    ],
  },
  {
    title: '20. Acknowledgement',
    paragraphs: [
      'By creating an account, applying for a clinical elective, purchasing services, or otherwise using IMG Prep, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.',
    ],
  },
]
