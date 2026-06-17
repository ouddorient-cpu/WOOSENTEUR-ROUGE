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
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg-alt)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#C2553B' }}>
              Les résultats
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15, color: 'var(--ls-text)',
              }}
            >
              Des chiffres <em style={{ fontStyle: 'italic', color: 'var(--ls-accent)' }}>qui parlent.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--ls-card-border)' }}>
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center justify-center text-center py-12 px-8"
                style={{ background: 'var(--ls-surface)' }}
              >
                <span
                  className="font-extrabold tabular-nums mb-2"
                  style={{
                    fontSize: 'clamp(3rem,7vw,4.5rem)',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg,#D98F73,#C2553B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {m.value}
                </span>
                <span className="font-semibold text-foreground mb-1.5" style={{ fontSize: '1.05rem' }}>
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
