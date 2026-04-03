'use client';

import { motion } from 'framer-motion';
import { Rocket, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HeroV2 = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-12 lg:pt-32 lg:pb-20">
      <div className="absolute inset-0 bg-grid opacity-[0.3] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            IA spécialisée Parfumerie & Cosmétique
          </span>

          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-6">
            Vos fiches produits SEO en <span className="text-gradient">3 minutes</span>, pas en 3 heures.
          </h1>

          <p className="text-lg md:text-xl text-foreground/75 leading-relaxed mb-10 max-w-2xl mx-auto">
            Générez des descriptions structurées et optimisées pour WooCommerce & Shopify. 
            <strong> Woody</strong> s’occupe de tout : recherche, rédaction et publication 1-clic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-lg rounded-full shadow-xl shadow-primary/25 font-bold w-full sm:w-auto"
              asChild
            >
              <Link href="/dashboard/generate">
                <Rocket className="mr-2 h-5 w-5" />
                Essayer gratuitement — 5 fiches offertes
              </Link>
            </Button>
            <Link
              href="#comparatif"
              className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Pourquoi nous vs ChatGPT ?
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 border-t border-border/50 pt-8 mt-4">
            {[
              'Optimisé Rank Math / Yoast',
              'Publication 1-clic WooCommerce',
              'Export Shopify CSV natif',
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroV2;
