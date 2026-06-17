'use client';

import Footer from '@/components/footer';
import Faq from '@/components/landing/Faq';
import Pricing from '@/components/landing/Pricing';
import TrialGenerator from '@/components/landing/TrialGenerator';
import HeroAnimated from '@/components/landing/HeroAnimated';
import HeaderLanding from '@/components/header-landing';
import SectionDivider from '@/components/ui/section-divider';

import SolutionSection from '@/components/landing/SolutionSection';
import CapabilitiesSection from '@/components/landing/CapabilitiesSection';
import StepsSection from '@/components/landing/StepsSection';
import MetricsSection from '@/components/landing/MetricsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ForWhoSection from '@/components/landing/ForWhoSection';
import CtaSection from '@/components/landing/CtaSection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--ls-bg)' }}>
      <HeaderLanding />
      <main className="flex flex-col gap-0">

        {/* 1 — ACCROCHE : la fiche qui se transforme sous vos yeux */}
        <HeroAnimated />

        {/* 2 — LA TRANSFORMATION : avant / après en clair */}
        <SolutionSection />

        {/* 3 — DÉMO LIVE : essayez tout de suite */}
        <TrialGenerator />

        {/* 4 — TOUT CE QUE WOOSENTEUR FAIT : rédiger / publier / promouvoir */}
        <CapabilitiesSection />

        {/* 5 — QUALIFICATION : est-ce fait pour moi ? */}
        <ForWhoSection />

        {/* 6 — COMMENT : 3 étapes, zéro friction */}
        <StepsSection />

        {/* 7 — PREUVES : chiffres + témoignages */}
        <MetricsSection />
        <TestimonialsSection />

        {/* 8 — OFFRE */}
        <SectionDivider />
        <Pricing />

        {/* 9 — OBJECTIONS */}
        <Faq />

        {/* 10 — DERNIÈRE CHANCE */}
        <CtaSection />

      </main>
      <Footer />
    </div>
  );
}
