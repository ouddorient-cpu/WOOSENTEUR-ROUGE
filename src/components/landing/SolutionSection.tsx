'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SectionDivider from '@/components/ui/section-divider';

export default function SolutionSection() {
  return (
    <>
      <section className="py-24 sm:py-32 text-center" style={{ background: 'var(--ls-bg-alt)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <Sparkles size={14} />
              La solution
            </div>

            {/* Headline */}
            <h2
              className="font-bold tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(2.2rem,5.5vw,3.5rem)', lineHeight: 1.12 }}
            >
              Décrivez votre produit en 3 mots.
              <br />
              <span style={{ background: 'linear-gradient(110deg,#3B82F6,#60A5FA,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Woosenteur rédige tout.
              </span>
            </h2>

            {/* Sub */}
            <p
              className="mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--ls-muted)', fontSize: '1.125rem', maxWidth: '36rem' }}
            >
              Plus besoin de chercher vos mots. Notre IA génère une fiche produit claire,
              professionnelle et optimisée SEO — en moins de 30 secondes.
            </p>

            {/* Before / After inline */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div
                className="flex items-center gap-3 rounded-xl px-5 py-3.5 w-full sm:w-auto"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <span style={{ color: '#F87171', fontWeight: 700 }}>Avant</span>
                <span style={{ color: '#64748B' }}>2 h de travail · résultat médiocre</span>
              </div>
              <span style={{ color: '#334155', fontWeight: 700, fontSize: '1.2rem' }}>→</span>
              <div
                className="flex items-center gap-3 rounded-xl px-5 py-3.5 w-full sm:w-auto"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <span style={{ color: '#60A5FA', fontWeight: 700 }}>Après</span>
                <span style={{ color: '#94A3B8' }}>30 s · fiche pro prête à publier</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
