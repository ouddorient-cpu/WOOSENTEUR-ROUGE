'use client';

import { motion } from 'framer-motion';

const profiles = [
  { emoji: '🧺', label: 'Tu vends des produits faits main ou artisanaux' },
  { emoji: '🌿', label: 'Tu as lancé ta boutique naturelle ou bio' },
  { emoji: '🕯️', label: 'Tu vends des bougies, cosmétiques ou accessoires' },
  { emoji: '👶', label: 'Tu as créé des produits pour bébé ou famille' },
  { emoji: '🏠', label: 'Tu fais tout toi-même dans ta boutique en ligne' },
];

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,0 1080,48 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function ForWhoNew() {
  return (
    <>
      <section className="bg-sage-pale py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-warm-brown" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
              Fait pour toi, si...
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className={`bg-cream-surface rounded-2xl border border-warm-border px-5 py-4 flex items-center gap-4 shadow-sm ${i === 4 ? 'sm:col-span-2' : ''}`}
              >
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <p className="text-warm-brown text-[15px] leading-snug m-0">{p.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveDown to="#F3ECE4" />
    </>
  );
}
