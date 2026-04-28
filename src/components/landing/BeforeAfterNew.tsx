'use client';

import { motion } from 'framer-motion';

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,0 1080,48 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function BeforeAfterNew() {
  return (
    <>
      <section className="bg-cream py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-warm-brown" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
              La différence que ça fait
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* AVANT */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-6"
              style={{ background: '#FFF3EE', borderLeft: '4px solid #D4704A' }}
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: '#FFE0D5', color: '#D4704A' }}
              >
                ❌ Avant
              </span>
              <p className="text-warm-gray text-sm italic leading-relaxed mb-4">
                &ldquo;Bougie naturelle à la lavande. Faite main. 150g.&rdquo;
              </p>
              <p className="text-xs text-warm-gray/70 font-medium">
                Fiche incomplète — ne convainc pas
              </p>
            </motion.div>

            {/* APRÈS */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-6"
              style={{ background: '#EDF2EC', borderLeft: '4px solid #7D9B76' }}
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: '#D0E8CC', color: '#4A7A42' }}
              >
                ✓ Après
              </span>
              <p className="text-warm-brown text-sm leading-relaxed mb-4">
                Offre-toi un moment de calme avec notre bougie à la vraie lavande de Provence, fabriquée à la main
                en petite série. Parfaite pour une soirée cocooning ou en cadeau. 150g — 40h de combustion douce.
              </p>
              <p className="text-xs font-medium" style={{ color: '#7D9B76' }}>
                Fiche rassurante — prête à publier
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <WaveDown to="#F3ECE4" />
    </>
  );
}
