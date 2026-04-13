'use client';

import { motion } from 'framer-motion';
import Footer from '@/components/footer';
import Features from '@/components/landing/Features';
import Faq from '@/components/landing/Faq';
import FinalCta from '@/components/landing/FinalCta';
import HowItWorks from '@/components/landing/HowItWorks';
import ForWho from '@/components/landing/ForWho';
import BeforeAfter from '@/components/landing/BeforeAfter';
import Testimonials from '@/components/landing/Testimonials';
import Comparatif from '@/components/landing/Comparatif';
import { Rocket, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import Pricing from '@/components/landing/Pricing';
import TrialGenerator from '@/components/landing/TrialGenerator';
import ScrollProgress from '@/components/landing/ScrollProgress';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import OwnProductMode from '@/components/landing/OwnProductMode';
import EditoSection from '@/components/landing/EditoSection';
import AdPowerSection from '@/components/landing/AdPowerSection';
import Image from 'next/image';

/* ─── HERO ─────────────────────────────────────────── */
const Hero = () => {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28 z-10">
      {/* Gradient glow backing behind content */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div
          className="w-[900px] h-[600px] opacity-20 blur-[120px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, #8B5CF6 0%, #3B82F6 60%, transparent 80%)' }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(139,92,246,0.08)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                IA spécialisée e-commerce · WooCommerce &amp; Shopify
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-headline text-5xl md:text-6xl lg:text-[3.4rem] font-black tracking-tight leading-[1.05] text-white">
              Tes fiches produits rédigées{' '}
              <span className="text-gradient">par une IA</span>
              {' '}qui connaît{' '}
              <span className="text-gradient">le SEO.</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl text-white/55 leading-relaxed max-w-lg">
              Tu décris ton produit, l&apos;IA rédige une fiche structurée pour Google — titre, méta, slug, balises alt, description longue. Sans agence, sans rédacteur.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToTrial}
                className="btn-primary-glow px-8 py-4 rounded-full text-white font-bold text-base flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Générer ma 1ère fiche — Gratuit
              </motion.button>
              <Link
                href="/pricing"
                className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
              >
                Voir les prix →
              </Link>
              <Link
                href="/v2"
                className="flex items-center gap-1.5 text-sm font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full transition-colors"
              >
                Comparer V2 (Bêta)
                <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-3 text-sm text-white/35">
              5 fiches pour tester — sans carte bancaire
            </p>

            {/* Trust chips */}
            <div className="mt-8 pt-6 border-t border-white/[0.07] flex flex-wrap gap-5">
              {[
                'Fiche structurée pour Google',
                'Contenu original à chaque fois',
                'WooCommerce & Shopify natif',
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-sm font-medium text-white/65">
                  <Check className="h-4 w-4 text-green-400 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — glass mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="relative hidden lg:block"
          >
            {/* Glow behind card */}
            <div
              className="absolute inset-0 rounded-3xl opacity-30 blur-[80px]"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
            />

            {/* Main glass card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card-featured relative overflow-hidden"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 w-full h-[1px]"
                style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.6), transparent)' }} />

              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-[11px] text-white/30 font-mono">app.woosenteur.fr — Générateur SEO</span>
              </div>

              <Image
                src="https://res.cloudinary.com/dzagwz94z/image/upload/v1767178954/ChatGPT_Image_31_d%C3%A9c._2025_12_01_35_as1mxu.png"
                alt="Exemple de fiche produit SEO générée par Woosenteur"
                width={600}
                height={440}
                className="w-full"
                priority
              />
            </motion.div>

            {/* SEO badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-5 glass-card px-4 py-3 flex items-center gap-3 !rounded-2xl"
            >
              <div className="h-9 w-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Rank Math</p>
                <p className="text-sm font-bold text-green-400 leading-tight">Fiche optimisée ✓</p>
              </div>
            </motion.div>

            {/* Time badge */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -top-5 -right-4 glass-card px-4 py-3 !rounded-2xl"
            >
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Généré en</p>
              <p className="text-base font-extrabold text-violet-400 leading-tight">2 min 34 s ⚡</p>
            </motion.div>

            {/* Woody mascot */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute -bottom-12 right-6 flex flex-col items-end gap-1"
            >
              <div className="glass-card !rounded-2xl !rounded-br-sm px-3 py-1.5 text-xs font-semibold text-violet-300 whitespace-nowrap self-center mb-1 border-violet-500/20">
                Salut, moi c&apos;est Woody ! 👋
              </div>
              <Image
                src="/woody-white.png"
                alt="Woody — mascotte Woosenteur"
                width={100}
                height={100}
                style={{ width: 100, height: 'auto' }}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

/* ─── PAGE ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="relative bg-[#060612] text-white min-h-screen">
      <ScrollProgress />
      <Header />
      <main className="flex flex-col gap-0 relative z-10">
        <Hero />
        <SocialProofTicker />
        <Features />
        <EditoSection />
        <AdPowerSection />
        <ForWho />
        <OwnProductMode />
        <HowItWorks />
        <BeforeAfter />
        <Testimonials />
        <Comparatif />
        <TrialGenerator />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
