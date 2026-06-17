'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import SectionDivider from '@/components/ui/section-divider';

const forWho = [
  'Vous gérez votre boutique seul·e',
  'Vous avez lancé ou allez lancer sur WooCommerce / Shopify',
  'Vous avez des dizaines de produits à rédiger',
  'Vous manquez de temps ou d\'inspiration',
  'Vous voulez du trafic Google sans payer une agence',
  'Vous vendez des produits artisanaux, mode, cosmétiques, ou lifestyle',
];

const notForWho = [
  'Vous avez déjà une équipe rédaction dédiée',
  'Vous vendez uniquement en B2B sur devis',
];

export default function ForWhoSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg-alt)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#C2553B' }}>
              Pour qui ?
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15, color: 'var(--ls-text)',
              }}
            >
              Fait pour les e-commerçants<br /><em style={{ fontStyle: 'italic', color: 'var(--ls-accent)' }}>qui gèrent tout seuls.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pour vous */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(194,85,59,0.06)', border: '1px solid rgba(194,85,59,0.15)' }}
            >
              <p className="font-bold text-foreground mb-5" style={{ fontSize: '1rem' }}>
                ✓ Woosenteur est fait pour vous si…
              </p>
              <ul className="space-y-3">
                {forWho.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#C2553B' }} />
                    <span style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pas pour vous */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
            >
              <p className="font-bold text-foreground mb-5" style={{ fontSize: '1rem' }}>
                ✗ Probablement pas si…
              </p>
              <ul className="space-y-3">
                {notForWho.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#F87171', opacity: 0.7 }} />
                    <span style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--ls-card-border)' }}>
                <p className="font-semibold text-foreground mb-1" style={{ fontSize: '0.9375rem' }}>
                  Vous ne savez pas encore ?
                </p>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                  Testez gratuitement — 5 fiches offertes, sans carte bancaire.
                  Vous décidez après.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
