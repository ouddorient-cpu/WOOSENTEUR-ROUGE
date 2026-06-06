'use client';

import { motion } from 'framer-motion';
import SectionDivider from '@/components/ui/section-divider';

const VIDEO_URL =
  'https://res.cloudinary.com/db2ljqpdt/video/upload/v1765634611/Vid%C3%A9o_sans_titre_R%C3%A9alis%C3%A9e_avec_Clipchamp_1_epbgwe.mp4';

export default function VideoSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#3B82F6' }}>
              Voir en action
            </p>
            <h2
              className="font-bold tracking-tight text-foreground"
              style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15 }}
            >
              De 3 mots à une fiche complète.<br />
              <span style={{ color: '#60A5FA' }}>En moins de 30 secondes.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 24px 80px -16px rgba(37,99,235,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Glow top */}
            <div
              className="absolute top-0 inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(to right,transparent,rgba(59,130,246,0.6),transparent)' }}
              aria-hidden="true"
            />

            <video
              src={VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              className="w-full block"
              style={{ aspectRatio: '16/9', background: 'var(--ls-bg)' }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </motion.div>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center mt-5"
            style={{ color: 'var(--ls-muted)', fontSize: '0.875rem' }}
          >
            Démo réelle — aucun montage, aucune retouche.
          </motion.p>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
