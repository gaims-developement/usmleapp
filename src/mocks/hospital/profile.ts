export interface HospitalProfile {
  name: string
  tagline: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  beds: number
  staffCount: number
  accreditation: string[]
  coordinator: {
    name: string
    email: string
    phone: string
  }
  about: string
  logoColor: string
}

export const hospitalProfile: HospitalProfile = {
  name: 'St. Mary\'s University Hospital',
  tagline: 'Clinical Electives & Observerships',
  address: '2400 Clay Street, Suite 500',
  city: 'San Francisco',
  country: 'United States',
  phone: '+1 (415) 668-2400',
  email: 'electives@stmarys.org',
  website: 'https://www.stmarys.org/electives',
  beds: 432,
  staffCount: 1280,
  accreditation: ['ACGME-I Accredited', 'Joint Commission', 'AAMC Visiting Student Programs'],
  coordinator: {
    name: 'Karen Mitchell',
    email: 'k.mitchell@stmarys.org',
    phone: '+1 (415) 668-2420',
  },
  about:
    'St. Mary\'s University Hospital is a 432-bed teaching hospital in San Francisco offering structured clinical electives, sub-internships, and observerships for international medical students and graduates seeking US clinical experience.',
  logoColor: 'sky',
}
