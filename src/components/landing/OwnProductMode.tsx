'use client';

import { motion } from 'framer-motion';
import { PenLine, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/useT';

const OwnProductMode = () => {
  const t = useT();

  return (
    <section
      id="mon-produit"
      className="py-24 lg:py-32 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%] bg-secondary/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-bold border border-secondary/20 uppercase tracking-widest mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            {t.ownproduct.badge}
          </span>

          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-[1.1]">
            {t.ownproduct.title}{' '}
            <span className="text-muted-foreground font-medium text-2xl md:text-3xl">
              {t.ownproduct.titleSub}
            </span>
            <br className="hidden md:block" />
            <span className="text-gradient">{t.ownproduct.titleGradient}</span>
          </h2>

          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.ownproduct.sub}{' '}
            <span className="text-gradient font-bold">
              {t.ownproduct.subGradient}
            </span>
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm mb-5">
            {t.ownproduct.ctaSub}
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white px-10 py-6 text-base rounded-full shadow-lg shadow-secondary/25 font-semibold"
            >
              <PenLine className="mr-2 h-4 w-4" />
              {t.ownproduct.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default OwnProductMode;
