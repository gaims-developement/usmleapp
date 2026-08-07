import { Hero } from '@/components/landing/hero'
import { WhatAreClinicalElectives } from '@/components/landing/what-are-clinical-electives'
import { WhyChooseImgPrep } from '@/components/landing/why-choose-img-prep'
import { ExploreElectives } from '@/components/landing/explore-electives'
import { Features } from '@/components/landing/features'
import { Faq } from '@/components/landing/faq'
import { MatchCta } from '@/components/landing/match-cta'

export function LandingPage() {
  return (
    <>
      <Hero />
      <WhatAreClinicalElectives />
      <WhyChooseImgPrep />
      <ExploreElectives />
      <Features />
      <Faq />
      <MatchCta />
    </>
  )
}
