'use client';

import { motion } from 'framer-motion';
import { PenLine, Zap, Upload } from 'lucide-react';
import SectionDivider from '@/components/ui/section-divider';

const steps = [
  {
    icon: PenLine,
    number: '01',
    title: 'Décrivez votre produit',
    body: 'Nom, catégorie, 2-3 caractéristiques. Même 5 mots suffisent pour démarrer.',
  },
  {
    icon: Zap,
    number: '02',
    title: "L'IA génère en 30 secondes",
    body: "Titre accrocheur, description convaincante, mots-clés SEO intégrés. Automatiquement.",
  },
  {
    icon: Upload,
    number: '03',
    title: 'Publiez en un clic',
    body: 'Copiez ou exportez directement vers WooCommerce et Shopify. Votre fiche est en ligne.',
  },
];

export default function StepsSection() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: '#0F172A' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#3B82F6' }}>
              Comment ça marche
            </p>
            <h2 className="font-bold tracking-tight text-white" style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15 }}>
              Trois étapes. C&apos;est tout.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.3), rgba(59,130,246,0.3), transparent)' }}
              aria-hidden="true"
            />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col items-center text-center px-6 py-8 rounded-2xl"
                  style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Number */}
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#3B82F6', color: '#fff', boxShadow: '0 0 16px rgba(59,130,246,0.5)' }}
                  >
                    {step.number}
                  </div>

                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mt-4"
                    style={{ background: 'rgba(59,130,246,0.1)' }}
                  >
                    <Icon size={22} strokeWidth={1.6} style={{ color: '#60A5FA' }} />
                  </div>

                  <h3 className="font-semibold text-white mb-2.5" style={{ fontSize: '1.0625rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                    {step.body}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center mt-12"
          >
            <button
              onClick={scrollToTrial}
              className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-full text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#2563EB', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
            >
              Essayer maintenant — Gratuit
            </button>
          </motion.div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
