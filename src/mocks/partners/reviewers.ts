export interface PartnerReviewer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  department: string
  qualifications: string
  experienceYears: number
  reviewerId: string
  avatarColor: string
  status: 'active' | 'pending' | 'rejected' | 'info_requested'
  joinedAt: string
  password?: string
  reviewMessage?: string
}

export const partnerReviewers: PartnerReviewer[] = [
  { id: 'rev-reg-1', name: 'Dr. Anita Desai', email: 'a.desai@imgprep.com', phone: '+91 98450 11220', country: 'India', department: 'Internal Medicine', qualifications: 'MD (Internal Medicine), 15 yrs US clinical experience', experienceYears: 15, reviewerId: 'RV-2201', avatarColor: 'sky', status: 'active', joinedAt: '2026-02-10' },
  { id: 'rev-reg-2', name: 'Dr. Samuel Okafor', email: 's.okafor@imgprep.com', phone: '+234 803 555 2211', country: 'Nigeria', department: 'Family Medicine', qualifications: 'MBBS, MPH, 12 yrs community practice', experienceYears: 12, reviewerId: 'RV-2202', avatarColor: 'emerald', status: 'active', joinedAt: '2026-02-14' },
  { id: 'rev-reg-3', name: 'Dr. Leila Haddad', email: 'l.haddad@imgprep.com', phone: '+961 71 550 332', country: 'Lebanon', department: 'Pediatrics', qualifications: 'MD (Pediatrics), US board eligible', experienceYears: 9, reviewerId: 'RV-2203', avatarColor: 'violet', status: 'active', joinedAt: '2026-03-02' },
  { id: 'rev-reg-4', name: 'Dr. Rajesh Menon', email: 'r.menon@imgprep.com', phone: '+91 98220 33445', country: 'India', department: 'General Surgery', qualifications: 'MS (Surgery), 18 yrs operative experience', experienceYears: 18, reviewerId: 'RV-2204', avatarColor: 'red', status: 'active', joinedAt: '2026-03-20' },
  { id: 'rev-reg-5', name: 'Dr. Camila Ruiz', email: 'c.ruiz@imgprep.com', phone: '+52 55 5550 2211', country: 'Mexico', department: 'Psychiatry', qualifications: 'MD, Psychiatry residency (Mexico), 10 yrs experience', experienceYears: 10, reviewerId: 'RV-2205', avatarColor: 'amber', status: 'active', joinedAt: '2026-04-05' },
  { id: 'rev-reg-6', name: 'Dr. Omar Al-Jabri', email: 'o.aljabri@imgprep.com', phone: '+971 50 555 4411', country: 'United Arab Emirates', department: 'Emergency Medicine', qualifications: 'MD, ABEM eligible, 11 yrs ED experience', experienceYears: 11, reviewerId: 'RV-2206', avatarColor: 'brand', status: 'active', joinedAt: '2026-04-22' },
  { id: 'rev-reg-7', name: 'Dr. Priya Raman', email: 'p.raman@imgprep.com', phone: '+91 98450 66771', country: 'India', department: 'Radiology', qualifications: 'MD (Radiology), 8 yrs diagnostic experience', experienceYears: 8, reviewerId: 'RV-2207', avatarColor: 'sky', status: 'active', joinedAt: '2026-05-10' },
  { id: 'rev-reg-8', name: 'Dr. Gabriel Santos', email: 'g.santos@imgprep.com', phone: '+55 11 5550 3311', country: 'Brazil', department: 'Cardiology', qualifications: 'MD (Cardiology), 14 yrs experience', experienceYears: 14, reviewerId: 'RV-2208', avatarColor: 'emerald', status: 'active', joinedAt: '2026-05-28' },
  { id: 'rev-reg-9', name: 'Dr. Farah Al-Hadi', email: 'f.alhadi@imgprep.com', phone: '+962 79 555 2211', country: 'Jordan', department: 'Obstetrics & Gynecology', qualifications: 'MD (OB/GYN), 10 yrs experience', experienceYears: 10, reviewerId: 'RV-2209', avatarColor: 'violet', status: 'pending', joinedAt: '2026-07-26', password: 'Partner@123' },
  { id: 'rev-reg-10', name: 'Dr. Matthew Chen', email: 'm.chen@imgprep.com', phone: '+1 (202) 555-0188', country: 'United States', department: 'Neurology', qualifications: 'MD, US board certified, 9 yrs experience', experienceYears: 9, reviewerId: 'RV-2210', avatarColor: 'amber', status: 'pending', joinedAt: '2026-08-02', password: 'Partner@123' },
]
