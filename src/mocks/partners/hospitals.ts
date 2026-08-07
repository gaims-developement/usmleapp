export interface PartnerHospital {
  id: string
  name: string
  hospitalCode: string
  email: string
  coordinator: {
    name: string
    email: string
  }
  phone: string
  country: string
  city: string
  address: string
  website: string
  departments: string[]
  logoColor: string
  accreditation: string[]
  description: string
  status: 'active' | 'pending' | 'rejected' | 'info_requested'
  joinedAt: string
  password?: string
  reviewMessage?: string
}

export const partnerHospitals: PartnerHospital[] = [
  {
    id: 'hosp-1001',
    name: 'St. Mary\u2019s University Hospital',
    hospitalCode: 'IMGH-1001',
    email: 'electives@stmarys.org',
    coordinator: { name: 'Karen Mitchell', email: 'k.mitchell@stmarys.org' },
    phone: '+1 (415) 668-2400',
    country: 'United States',
    city: 'San Francisco',
    address: '2400 Clay Street, Suite 500, San Francisco, CA',
    website: 'https://www.stmarys.org/electives',
    departments: ['Internal Medicine', 'Pediatrics', 'General Surgery', 'Cardiology', 'Neurology'],
    logoColor: 'sky',
    accreditation: ['ACGME-I Accredited', 'Joint Commission'],
    description:
      'A 432-bed teaching hospital in San Francisco offering structured clinical electives and observerships for international medical students and graduates.',
    status: 'active',
    joinedAt: '2026-01-15',
  },
  {
    id: 'hosp-1002',
    name: 'Mount Sinai Beth Israel',
    hospitalCode: 'IMGH-1002',
    email: 'electives@bethisrael.org',
    coordinator: { name: 'Robert Alvarez', email: 'r.alvarez@bethisrael.org' },
    phone: '+1 (212) 420-2000',
    country: 'United States',
    city: 'New York',
    address: '281 First Avenue, New York, NY',
    website: 'https://www.mountsinai.org',
    departments: ['Internal Medicine', 'Family Medicine', 'Psychiatry', 'Neurology'],
    logoColor: 'emerald',
    accreditation: ['ACGME Accredited', 'Joint Commission'],
    description:
      'Manhattan teaching hospital with an experienced IMG-friendly internal medicine service and robust elective programming.',
    status: 'active',
    joinedAt: '2026-02-02',
  },
  {
    id: 'hosp-1003',
    name: 'Cleveland Clinic',
    hospitalCode: 'IMGH-1003',
    email: 'electives@clevelandclinic.org',
    coordinator: { name: 'Priya Nair', email: 'p.nair@clevelandclinic.org' },
    phone: '+1 (216) 444-2200',
    country: 'United States',
    city: 'Cleveland',
    address: '9500 Euclid Avenue, Cleveland, OH',
    website: 'https://www.clevelandclinic.org',
    departments: ['Internal Medicine', 'Cardiology', 'General Surgery', 'Radiology'],
    logoColor: 'violet',
    accreditation: ['ACGME Accredited', 'Joint Commission'],
    description:
      'World-renowned academic medical center offering specialized cardiology and internal medicine electives for advanced clinical-year students.',
    status: 'active',
    joinedAt: '2026-02-18',
  },
  {
    id: 'hosp-1004',
    name: 'Mass General Brigham Affiliate',
    hospitalCode: 'IMGH-1004',
    email: 'electives@mgb.org',
    coordinator: { name: 'Daniel Kim', email: 'd.kim@mgb.org' },
    phone: '+1 (617) 726-2000',
    country: 'United States',
    city: 'Boston',
    address: '55 Fruit Street, Boston, MA',
    website: 'https://www.massgeneralbrigham.org',
    departments: ['General Surgery', 'Internal Medicine', 'Neurology', 'Anesthesiology'],
    logoColor: 'brand',
    accreditation: ['ACGME Accredited', 'Joint Commission'],
    description:
      'Top-tier academic center with high-volume surgical exposure and structured resident-led teaching for IMGs.',
    status: 'active',
    joinedAt: '2026-03-05',
  },
  {
    id: 'hosp-1005',
    name: 'Northwestern Memorial Hospital',
    hospitalCode: 'IMGH-1005',
    email: 'electives@nmh.org',
    coordinator: { name: 'Susan Whitfield', email: 's.whitfield@nmh.org' },
    phone: '+1 (312) 926-2000',
    country: 'United States',
    city: 'Chicago',
    address: '251 East Huron Street, Chicago, IL',
    website: 'https://www.nm.org',
    departments: ['Psychiatry', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology'],
    logoColor: 'amber',
    accreditation: ['ACGME Accredited'],
    description:
      'Academic medical center in downtown Chicago with a dedicated consultation-liaison psychiatry service and strong mentorship structure.',
    status: 'active',
    joinedAt: '2026-03-21',
  },
  {
    id: 'hosp-1006',
    name: 'Jackson Memorial Hospital',
    hospitalCode: 'IMGH-1006',
    email: 'electives@jhsmiami.org',
    coordinator: { name: 'Maria Lopez', email: 'm.lopez@jhsmiami.org' },
    phone: '+1 (305) 585-1111',
    country: 'United States',
    city: 'Miami',
    address: '1611 NW 12th Avenue, Miami, FL',
    website: 'https://www.jhsmiami.org',
    departments: ['Emergency Medicine', 'Internal Medicine', 'Trauma Surgery', 'Pediatrics'],
    logoColor: 'red',
    accreditation: ['ACGME Accredited', 'Level I Trauma Center'],
    description:
      'Level I trauma center with fast-paced emergency medicine and critical care exposure for hands-on learners.',
    status: 'active',
    joinedAt: '2026-04-02',
  },
  {
    id: 'hosp-1007',
    name: 'UCLA Medical Center Affiliate',
    hospitalCode: 'IMGH-1007',
    email: 'electives@uclahealth.org',
    coordinator: { name: 'James Park', email: 'j.park@uclahealth.org' },
    phone: '+1 (310) 825-9111',
    country: 'United States',
    city: 'Los Angeles',
    address: '757 Westwood Plaza, Los Angeles, CA',
    website: 'https://www.uclahealth.org',
    departments: ['Radiology', 'Internal Medicine', 'Neurology', 'Surgery'],
    logoColor: 'sky',
    accreditation: ['ACGME Accredited', 'Joint Commission'],
    description:
      'West Coast academic medical center offering structured diagnostic radiology observerships with multidisciplinary tumor board access.',
    status: 'active',
    joinedAt: '2026-04-19',
  },
  {
    id: 'hosp-1008',
    name: 'Pacific Coast Medical Center',
    hospitalCode: 'IMGH-1008',
    email: 'electives@pcmc.org',
    coordinator: { name: 'Rebecca Tran', email: 'r.tran@pcmc.org' },
    phone: '+1 (858) 555-0142',
    country: 'United States',
    city: 'San Diego',
    address: '4120 Mission Boulevard, San Diego, CA',
    website: 'https://www.pacificcoastmedical.org',
    departments: ['Family Medicine', 'Internal Medicine', 'Pediatrics'],
    logoColor: 'emerald',
    accreditation: ['Joint Commission'],
    description:
      'Community teaching hospital on the California coast expanding its elective offerings for international medical graduates.',
    status: 'pending',
    joinedAt: '2026-07-22',
    password: 'Partner@123',
  },
  {
    id: 'hosp-1009',
    name: 'St. Luke\u2019s Riverside Health',
    hospitalCode: 'IMGH-1009',
    email: 'electives@stlukesriverside.org',
    coordinator: { name: 'Michael Chen', email: 'm.chen@stlukesriverside.org' },
    phone: '+1 (651) 555-0177',
    country: 'United States',
    city: 'Minneapolis',
    address: '800 Riverside Avenue, Minneapolis, MN',
    website: 'https://www.stlukesriverside.org',
    departments: ['Internal Medicine', 'Neurology', 'Cardiology'],
    logoColor: 'violet',
    accreditation: ['Joint Commission'],
    description:
      'Riverside teaching hospital with a growing international elective program and dedicated IMG orientation.',
    status: 'pending',
    joinedAt: '2026-07-28',
    password: 'Partner@123',
  },
  {
    id: 'hosp-1010',
    name: 'Midwest Academic Medical Center',
    hospitalCode: 'IMGH-1010',
    email: 'electives@midwestacademic.org',
    coordinator: { name: 'Laura Bennett', email: 'l.bennett@midwestacademic.org' },
    phone: '+1 (614) 555-0129',
    country: 'United States',
    city: 'Columbus',
    address: '960 University Boulevard, Columbus, OH',
    website: 'https://www.midwestacademic.org',
    departments: ['General Surgery', 'Internal Medicine', 'Family Medicine'],
    logoColor: 'amber',
    accreditation: ['ACGME-I Accredited'],
    description:
      'Academic center in the Midwest seeking approval to host clinical electives for international medical students.',
    status: 'pending',
    joinedAt: '2026-08-01',
    password: 'Partner@123',
  },
]
