'use client';

import Footer from '@/components/footer';
import Faq from '@/components/landing/Faq';
import Pricing from '@/components/landing/Pricing';
import TrialGenerator from '@/components/landing/TrialGenerator';
import ScrollProgress from '@/components/landing/ScrollProgress';
import HeroAnimated from '@/components/landing/HeroAnimated';
import HeaderLanding from '@/components/header-landing';
import SectionDivider from '@/components/ui/section-divider';

// Storytelling arc — Pain → Solution → Proof → Conversion
import PainSection from '@/components/landing/PainSection';
import SolutionSection from '@/components/landing/SolutionSection';
import StepsSection from '@/components/landing/StepsSection';
import MetricsSection from '@/components/landing/MetricsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ForWhoSection from '@/components/landing/ForWhoSection';
import CtaSection from '@/components/landing/CtaSection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <HeaderLanding />
      <main className="flex flex-col gap-0">

        {/* 1 — ACCROCHE : l'outcome en 2 secondes */}
        <HeroAnimated />

        {/* 2 — DOULEUR : le problème qu'ils vivent chaque jour */}
        <PainSection />

        {/* 3 — SOLUTION : la révélation, simple et nette */}
        <SolutionSection />

        {/* 4 — COMMENT : 3 étapes, zéro friction */}
        <StepsSection />

        {/* 5 — DEMO LIVE : voir pour croire */}
        <SectionDivider />
        <TrialGenerator />

        {/* 6 — PREUVES : chiffres + témoignages */}
        <SectionDivider />
        <MetricsSection />
        <TestimonialsSection />

        {/* 7 — QUALIFICATION : est-ce fait pour moi ? */}
        <ForWhoSection />

        {/* 8 — OFFRE : pricing clair */}
        <SectionDivider />
        <Pricing />

        {/* 9 — OBJECTIONS : FAQ */}
        <Faq />

        {/* 10 — DERNIÈRE CHANCE : CTA final */}
        <CtaSection />

      </main>
      <Footer />
    </div>
  );
}
