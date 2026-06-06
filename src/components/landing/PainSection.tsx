'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingDown, Search } from 'lucide-react';
import SectionDivider from '@/components/ui/section-divider';

const pains = [
  {
    icon: Clock,
    headline: 'Des heures perdues sur chaque fiche',
    body: 'Vous passez 2 h à écrire une description bancale — pendant que vos concurrents vendent.',
  },
  {
    icon: TrendingDown,
    headline: 'Vos visiteurs partent sans acheter',
    body: 'Une fiche vide ou floue fait fuir. L\'acheteur ne comprend pas le produit, il ferme l\'onglet.',
  },
  {
    icon: Search,
    headline: 'Google ne voit pas vos produits',
    body: 'Sans mots-clés, sans structure, votre boutique reste invisible. Zéro trafic organique gratuit.',
  },
];

export default function PainSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#3B82F6' }}>
              Le vrai problème
            </p>
            <h2 className="font-bold tracking-tight text-foreground" style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15 }}>
              Chaque jour sans fiche complète,<br />c&apos;est une vente perdue.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pains.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl p-7"
                  style={{
                    background: 'var(--ls-surface)',
                    border: '1px solid var(--ls-card-border)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(239,68,68,0.1)' }}
                  >
                    <Icon size={20} strokeWidth={1.8} style={{ color: '#F87171' }} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2.5" style={{ fontSize: '1.05rem' }}>
                    {p.headline}
                  </h3>
                  <p className="leading-relaxed" style={{ color: 'var(--ls-muted)', fontSize: '0.9375rem' }}>
                    {p.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
