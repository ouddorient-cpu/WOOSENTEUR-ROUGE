'use client';

import { motion } from 'framer-motion';

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function TestimonialNew() {
  return (
    <>
      <section className="bg-cream-alt py-16 sm:py-20">
        <div className="max-w-xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Big decorative quote */}
            <div
              className="absolute -top-4 left-4 pointer-events-none select-none"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 96, color: '#3B82F6', opacity: 0.12, lineHeight: 1 }}
            >
              &ldquo;
            </div>

            <div className="mb-4" style={{ color: '#3B82F6', fontSize: 20 }}>★★★★★</div>

            <blockquote
              className="text-warm-brown italic mb-5"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.1rem,3vw,1.35rem)', lineHeight: 1.6 }}
            >
              &ldquo;J&apos;ai enfin une fiche produit dont je suis fière. En 5 minutes, j&apos;avais quelque chose
              de vrai et de professionnel. Je ne pensais pas que c&apos;était possible pour moi.&rdquo;
            </blockquote>

            <p className="text-warm-gray text-sm font-medium">
              — Marie-Claire, boutique de savons artisanaux
            </p>
          </motion.div>
        </div>
      </section>
      <WaveDown to="#07090F" />
    </>
  );
}
