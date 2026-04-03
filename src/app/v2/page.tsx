'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import HeroV2 from '@/components/landing/HeroV2';
import Comparatif from '@/components/landing/Comparatif';
import Pricing from '@/components/landing/Pricing';
import ScrollProgress from '@/components/landing/ScrollProgress';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import FinalCta from '@/components/landing/FinalCta';

export default function LandingV2Page() {
  return (
    <div className="bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main>
        {/* 1. Hero Minimaliste */}
        <HeroV2 />
        
        {/* 2. Preuve Sociale Rapide (Ticker discret) */}
        <SocialProofTicker />

        {/* 3. Preuve de Valeur (Comparatif ChatGPT/Main vs Woosenteur) */}
        <section id="comparatif">
          <Comparatif />
        </section>

        {/* 4. Solution & Prix (Directement après la preuve) */}
        <Pricing />

        {/* 5. Appel à l'action final */}
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
