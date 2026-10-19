import React from 'react'
import { AnnouncementBanner } from '@/components/banners/announcement-banner'
import { NavbarPrimary } from '@/components/sections/navbar-primary'
import { HeroCentered } from '@/components/sections/hero-centered'
import { FeaturesGrid3x2 } from '@/components/sections/features-grid-3x2'
import { Pricing3Tier } from '@/components/sections/pricing-3-tier'
import { FaqAccordion } from '@/components/sections/faq-accordion'
import { FooterMultiColumn } from '@/components/sections/footer-multi-column'

export const LandingSaasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      <AnnouncementBanner />
      <NavbarPrimary />
      <main className="flex-1">
        <HeroCentered />
        <FeaturesGrid3x2 />
        <Pricing3Tier />
        <FaqAccordion />
      </main>
      <FooterMultiColumn />
    </div>
  )
}

export default LandingSaasPage
