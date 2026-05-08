'use client';

import { motion } from 'framer-motion';
import SectionDivider from '@/components/ui/section-divider';

const metrics = [
  {
    value: '136',
    label: 'Fiches en 1 batch',
    sub: 'Enrichies en une seule session — là où ça prendrait des semaines',
  },
  {
    value: '30 s',
    label: 'Par fiche produit',
    sub: 'Titre · description · SEO · méta — prêt à publier',
  },
  {
    value: '500+',
    label: 'Boutiques actives',
    sub: 'WooCommerce & Shopify confondus',
  },
];

export default function MetricsSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: '#111827' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#3B82F6' }}>
              Les résultats
            </p>
            <h2 className="font-bold tracking-tight text-white" style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15 }}>
              Des chiffres qui parlent.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center justify-center text-center py-12 px-8"
                style={{ background: '#1E293B' }}
              >
                <span
                  className="font-extrabold tabular-nums mb-2"
                  style={{
                    fontSize: 'clamp(3rem,7vw,4.5rem)',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg,#60A5FA,#3B82F6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {m.value}
                </span>
                <span className="font-semibold text-white mb-1.5" style={{ fontSize: '1.05rem' }}>
                  {m.label}
                </span>
                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{m.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
