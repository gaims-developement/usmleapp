import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Ambulance,
  Baby,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Calendar,
  FileCheck,
  HeartPulse,
  Home,
  LayoutDashboard,
  Megaphone,
  Route,
  Scan,
  Stethoscope,
  Target,
  UserRound,
} from 'lucide-react'

export const siteConfig = {
  name: 'IMG Prep',
  tagline: 'Your Gateway to U.S. Clinical Electives & Residency',
  description:
    'Find verified elective rotations, prepare for the USMLE, receive mentorship, and confidently build your residency application—all in one platform.',
  email: 'hello@imgprep.com',
  socials: {
    instagram: 'https://instagram.com/imgprep',
    twitter: 'https://twitter.com/imgprep',
    youtube: 'https://youtube.com/@imgprep',
    linkedin: 'https://linkedin.com/company/imgprep',
  },
} as const

export const navLinks = [
  { label: 'Electives', href: '#explore' },
  { label: 'Why Us', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '/contact' },
] as const

export interface ElectiveFact {
  title: string
  description: string
}

export const electiveFacts: ElectiveFact[] = [
  {
    title: 'What are U.S. electives?',
    description:
      'Short-term clinical rotations at U.S. hospitals and teaching institutions that let international medical students and graduates experience the American healthcare system first-hand.',
  },
  {
    title: 'Why they matter for IMGs',
    description:
      'U.S. clinical experience is frequently the deciding factor in residency selection. It shows programs you can function in their system and adapt to U.S. medicine.',
  },
  {
    title: 'Benefits for residency applications',
    description:
      'Electives build your CV with real clinical exposure, hands-on skills, and direct insight into how U.S. hospitals operate—exactly what program directors look for.',
  },
  {
    title: 'U.S. Letters of Recommendation',
    description:
      'Letters from U.S. attendings carry exceptional weight in ERAS. A strong LoR from an elective is among the most influential parts of your application.',
  },
  {
    title: 'How electives strengthen ERAS',
    description:
      'Beyond the letter itself, electives give you meaningful experiences to discuss in interviews and personal statements, showing genuine exposure to U.S. patient care.',
  },
]

export interface Reason {
  title: string
  description: string
  icon: LucideIcon
}

export const reasons: Reason[] = [
  {
    title: 'Verified Elective Opportunities',
    description:
      'Only vetted rotations at U.S. hospitals—screened for legitimacy, quality, and real clinical exposure.',
    icon: BadgeCheck,
  },
  {
    title: 'Application Assistance',
    description:
      'Guidance and tools to prepare, submit, and track your elective applications from start to finish.',
    icon: FileCheck,
  },
  {
    title: 'USMLE Study Resources',
    description:
      'A curated, organized library of books, videos, and guides for every step of the USMLE.',
    icon: BookOpen,
  },
  {
    title: 'Mentorship from Experienced Physicians',
    description:
      'Book 1:1 sessions with physicians who have navigated electives, the Match, and residency.',
    icon: UserRound,
  },
  {
    title: 'Residency Planning',
    description:
      'A clear roadmap from your first elective to ERAS submission and Match Day.',
    icon: Route,
  },
  {
    title: 'Personalized Dashboard',
    description:
      'Your applications, documents, and study progress all tracked in one calm, organized view.',
    icon: LayoutDashboard,
  },
]

export interface Elective {
  specialty: string
  location: string
  duration: string
  eligibility: string
  deadline: string
  process: string
  icon: LucideIcon
}

export const electives: Elective[] = [
  {
    specialty: 'Internal Medicine',
    location: 'Multiple U.S. hospitals',
    duration: '4–12 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: HeartPulse,
  },
  {
    specialty: 'General Surgery',
    location: 'New York, NY',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Activity,
  },
  {
    specialty: 'Pediatrics',
    location: 'Boston, MA',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Baby,
  },
  {
    specialty: 'Psychiatry',
    location: 'Chicago, IL',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Brain,
  },
  {
    specialty: 'Family Medicine',
    location: 'Houston, TX',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Home,
  },
  {
    specialty: 'Emergency Medicine',
    location: 'Miami, FL',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Ambulance,
  },
  {
    specialty: 'Radiology',
    location: 'Los Angeles, CA',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Scan,
  },
  {
    specialty: 'Neurology',
    location: 'Atlanta, GA',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: BrainCircuit,
  },
  {
    specialty: 'Obstetrics & Gynecology',
    location: 'Philadelphia, PA',
    duration: '4–8 weeks',
    eligibility: 'Clinical years / graduates',
    deadline: 'Rolling',
    process: 'Apply 6+ months ahead',
    icon: Stethoscope,
  },
]

export const usLocations = [
  'New York, NY',
  'Boston, MA',
  'Chicago, IL',
  'Houston, TX',
  'Los Angeles, CA',
  'Miami, FL',
  'Philadelphia, PA',
  'Atlanta, GA',
  'San Francisco, CA',
  'Dallas, TX',
  'Washington, DC',
  'Seattle, WA',
  'Phoenix, AZ',
  'Minneapolis, MN',
  'Detroit, MI',
]

export const applicationSteps = [
  {
    title: 'Create Your Profile',
    description: 'Set up your profile with your education, documents, and preferences.',
  },
  {
    title: 'Browse Elective Programs',
    description: 'Search and filter verified rotations by specialty, location, and dates.',
  },
  {
    title: 'Submit Your Documents',
    description: 'Upload and submit your application directly through the platform.',
  },
  {
    title: 'Receive Confirmation',
    description: 'Track your status and get your placement confirmed with clear next steps.',
  },
  {
    title: 'Complete Your Rotation',
    description: 'Learn from U.S. attendings, earn certificates, and secure letters of recommendation.',
  },
]

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    title: 'Study Planner',
    description: 'Plan daily, weekly, and monthly goals around your rotations and exam timeline.',
    icon: Calendar,
  },
  {
    title: 'Daily Goals',
    description: 'Small, achievable targets that keep you consistent without burning out.',
    icon: Target,
  },
  {
    title: 'Pomodoro',
    description: 'Focus in timed study blocks to keep you consistent without burning out.',
    icon: BarChart3,
  },
  {
    title: 'Announcements',
    description: 'Never miss an elective opening, score release, or match deadline.',
    icon: Megaphone,
  },
  {
    title: 'Mentorship',
    description: 'Guidance from physicians who have been through electives and the Match.',
    icon: UserRound,
  },
]

export interface Faq {
  question: string
  answer: string
}

export const faqs: Faq[] = [
  {
    question: 'Who can apply?',
    answer:
      'International medical students and graduates preparing for the USMLE and residency. Whether you are in your clinical years or already graduated, there is a path for you.',
  },
  {
    question: 'Which countries are eligible?',
    answer:
      'Eligibility is open to applicants worldwide. Program requirements can vary by hospital, so we show the eligibility criteria for every rotation before you apply.',
  },
  {
    question: 'What documents are required?',
    answer:
      'Most programs ask for a passport, CV, medical school transcript, immunization records, and USMLE scores if available. English proficiency proof may be required for non-native speakers.',
  },
  {
    question: 'How long are electives?',
    answer:
      'Most rotations run between 4 and 12 weeks, depending on the specialty and hospital. You can filter programs by duration to fit your timeline.',
  },
  {
    question: 'Are electives paid?',
    answer:
      'Electives are typically unpaid clinical experiences. Program fees vary by institution, and every verified listing clearly shows the fees and costs before you apply.',
  },
  {
    question: 'Will I receive a certificate?',
    answer:
      'Yes. Most U.S. programs issue a certificate of completion at the end of your rotation, which you can store in your document manager and share with programs.',
  },
  {
    question: 'Will I receive an LoR?',
    answer:
      'Many IMGs receive U.S. Letters of Recommendation from their elective attendings. Performing well, showing initiative, and asking thoughtfully is the best way to secure one.',
  },
  {
    question: 'Can I apply before graduation?',
    answer:
      'Yes. Clinical-year medical students are eligible for most rotations. Deadlines and eligibility windows vary by program, so we surface them on every listing.',
  },
]
