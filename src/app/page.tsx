'use client';

import { motion } from 'framer-motion';
import Footer from '@/components/footer';
import Faq from '@/components/landing/Faq';
import FinalCta from '@/components/landing/FinalCta';
import HowItWorks from '@/components/landing/HowItWorks';
import ForWho from '@/components/landing/ForWho';
import BeforeAfter from '@/components/landing/BeforeAfter';
import Testimonials from '@/components/landing/Testimonials';
import Comparatif from '@/components/landing/Comparatif';
import { Button } from '@/components/ui/button';
import { Rocket, Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import Pricing from '@/components/landing/Pricing';
import TrialGenerator from '@/components/landing/TrialGenerator';
import ScrollProgress from '@/components/landing/ScrollProgress';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import OwnProductMode from '@/components/landing/OwnProductMode';
import EditoSection from '@/components/landing/EditoSection';
import Image from 'next/image';

const Hero = () => {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-background pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background accents */}
      <div className="absolute inset-0 bg-grid opacity-[0.7] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[45%] h-[60%] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[45%] bg-secondary/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center max-w-6xl mx-auto">

          {/* Left column — copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                IA spécialisée e-commerce · WooCommerce &amp; Shopify
              </span>
            </motion.div>

            <h1 className="font-headline text-4xl md:text-5xl lg:text-[3.2rem] font-bold tracking-tight leading-[1.1] text-foreground">
              Tes fiches produits rédigées{' '}
              <span className="text-gradient">par une IA</span>
              {' '}qui connaît{' '}
              <span className="text-gradient">le SEO e-commerce.</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-lg">
              Tu décris ton produit, l&apos;IA rédige une fiche structurée pour Google — titre, méta, slug, balises alt, description longue. Sans agence, sans rédacteur.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base rounded-full shadow-lg shadow-primary/25 font-semibold"
                  onClick={scrollToTrial}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Générer ma 1ère fiche — Gratuit
                </Button>
              </motion.div>
              <Link
                href="/pricing"
                className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Voir les prix →
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/v2"
                className="group flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full"
              >
                Comparer V2 (Bêta)
                <Sparkles className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              5 fiches pour tester — sans carte bancaire
            </p>

            <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-5">
              {[
                'Fiche structurée pour Google',
                'Contenu original à chaque fois',
                'WooCommerce & Shopify natif',
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — product mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] bg-card">
              {/* Browser chrome */}
              <div className="h-9 bg-muted/60 flex items-center gap-1.5 px-4 border-b border-border/50">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                <span className="ml-3 text-[11px] text-muted-foreground font-mono tracking-wide">
                  Woosenteur — Générateur de fiches produits
                </span>
              </div>
              <video
                src="https://res.cloudinary.com/dzagwz94z/video/upload/v1766425674/Vid%C3%A9o_sans_titre_R%C3%A9alis%C3%A9e_avec_Clipchamp_1_gx07qt.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto"
              />
            </div>

            {/* Floating SEO score badge */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden lg:flex absolute -bottom-5 -left-5 bg-white dark:bg-card border border-border/70 shadow-xl rounded-2xl px-4 py-3 items-center gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rank Math</p>
                <p className="text-sm font-bold text-green-500 leading-tight">Fiche structurée</p>
              </div>
            </motion.div>

            {/* Floating time badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="hidden lg:block absolute -top-5 -right-4 bg-white dark:bg-card border border-border/70 shadow-xl rounded-2xl px-4 py-3"
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Généré en</p>
              <p className="text-base font-extrabold text-primary leading-tight">2 min 34 s ⚡</p>
            </motion.div>

            {/* Woody mascot — floating with speech bubble */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="hidden lg:flex absolute -bottom-10 right-6 flex-col items-end gap-1"
            >
              <div className="bg-white dark:bg-card border border-primary/20 shadow-lg rounded-2xl rounded-br-sm px-3 py-1.5 text-xs font-semibold text-primary whitespace-nowrap self-center mb-1">
                Salut, moi c&apos;est Woody ! 👋
              </div>
              <Image
                src="/woody-white.png"
                alt="Woody — mascotte Woosenteur"
                width={100}
                height={100}
                style={{ width: 100, height: 'auto' }}
                className="drop-shadow-xl"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main>
        {/* 1. Hero — Quoi ? */}
        <Hero />
        {/* Proof ticker */}
        <SocialProofTicker />
        {/* 2b. Section éditoriale narrative */}
        <EditoSection />
        {/* 3. Pour qui ? */}
        <ForWho />
        {/* 3b. Produit sans marque — nouvelle fonctionnalité */}
        <OwnProductMode />
        {/* 4. Comment ? */}
        <HowItWorks />
        {/* Visual proof */}
        <BeforeAfter />
        {/* Social proof */}
        <Testimonials />
        {/* Comparatif */}
        <Comparatif />
        {/* Trial + Pricing */}
        <TrialGenerator />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
