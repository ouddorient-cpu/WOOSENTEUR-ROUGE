'use client';

import Footer from '@/components/footer';
import Faq from '@/components/landing/Faq';
import Pricing from '@/components/landing/Pricing';
import TrialGenerator from '@/components/landing/TrialGenerator';
import ScrollProgress from '@/components/landing/ScrollProgress';
import HeroNew from '@/components/landing/HeroNew';
import FrustrationsBlock from '@/components/landing/FrustrationsBlock';
import HowItWorksNew from '@/components/landing/HowItWorksNew';
import BeforeAfterNew from '@/components/landing/BeforeAfterNew';
import BenefitsBlock from '@/components/landing/BenefitsBlock';
import ReassuranceBlock from '@/components/landing/ReassuranceBlock';
import ForWhoNew from '@/components/landing/ForWhoNew';
import TestimonialNew from '@/components/landing/TestimonialNew';
import FinalCtaNew from '@/components/landing/FinalCtaNew';
import HeaderLanding from '@/components/header-landing';

export default function HomePage() {
  return (
    <div className="relative min-h-screen" style={{ background: '#FAF6F0', color: '#2E2018' }}>
      <ScrollProgress />
      <HeaderLanding />
      <main className="flex flex-col gap-0">

        {/* ── WARM SECTIONS ──────────────────────────────────── */}
        <HeroNew />
        <FrustrationsBlock />
        <HowItWorksNew />
        <BeforeAfterNew />
        <BenefitsBlock />

        {/* ── LIVE GENERATOR ─────────────────────────────────── */}
        <TrialGenerator />

        {/* ── WARM SECTIONS (suite) ──────────────────────────── */}
        <ReassuranceBlock />
        <ForWhoNew />
        <TestimonialNew />
        <FinalCtaNew />

        {/* ── PRICING & FAQ ──────────────────────────────────── */}
        <Pricing />
        <Faq />

      </main>
      <Footer />
    </div>
  );
}
