'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

const guarantees = [
  { icon: ShieldCheck, label: '5 fiches offertes' },
  { icon: Zap, label: 'Résultat en 30 secondes' },
  { icon: RefreshCw, label: 'Sans engagement' },
];

export default function CtaSection() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-28 sm:py-36 relative overflow-hidden text-center">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0C1A3A 50%, #0F172A 100%)',
        }}
        aria-hidden="true"
      />
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-extrabold tracking-tight text-white mb-5"
            style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)', lineHeight: 1.1 }}
          >
            Arrêtez de perdre<br />des ventes.
          </h2>
          <p
            className="mx-auto mb-10 leading-relaxed"
            style={{ color: '#94A3B8', fontSize: '1.125rem', maxWidth: '30rem' }}
          >
            5 fiches produit professionnelles, sans carte bancaire, sans inscription obligatoire.
            Voyez le résultat avant de décider quoi que ce soit.
          </p>

          <motion.button
            onClick={scrollToTrial}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 font-bold text-white rounded-full px-9 py-4 text-base"
            style={{
              background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
              boxShadow: '0 6px 30px rgba(37,99,235,0.5)',
            }}
          >
            Générer ma première fiche — Gratuit
            <ArrowRight size={18} />
          </motion.button>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {guarantees.map((g, i) => {
              const Icon = g.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon size={15} style={{ color: '#3B82F6' }} />
                  <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{g.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
