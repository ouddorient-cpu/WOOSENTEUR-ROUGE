'use client';
import SectionDivider from '@/components/ui/section-divider';

import { motion } from 'framer-motion';

export default function BeforeAfterNew() {
  return (
    <>
      <section className="bg-cream py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* AVANT */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(59,130,246,0.06)', borderLeft: '4px solid #3B82F6' }}
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}
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
              style={{ background: 'rgba(14,165,233,0.06)', borderLeft: '4px solid #0EA5E9' }}
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: 'rgba(14,165,233,0.15)', color: '#38BDF8' }}
              >
                ✓ Après
              </span>
              <p className="text-warm-brown text-sm leading-relaxed mb-4">
                Offre-toi un moment de calme avec notre bougie à la vraie lavande de Provence, fabriquée à la main
                en petite série. Parfaite pour une soirée cocooning ou en cadeau. 150g — 40h de combustion douce.
              </p>
              <p className="text-xs font-medium" style={{ color: '#38BDF8' }}>
                Fiche rassurante — prête à publier
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
