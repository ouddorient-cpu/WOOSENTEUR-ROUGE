'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import SectionDivider from '@/components/ui/section-divider';

const testimonials = [
  {
    quote: "Mes produits remontent maintenant sur Google. En 3 semaines j'ai eu 40% de trafic organique en plus. Je ne savais même pas que c'était lié aux fiches produit.",
    name: 'Sophie M.',
    role: 'Boutique bien-être & cosmétiques',
    initials: 'SM',
  },
  {
    quote: "J'ai enfin des fiches dont je suis fière. En 5 minutes, j'avais quelque chose de vrai et de professionnel. Je ne pensais pas que c'était possible pour moi.",
    name: 'Marie-Claire D.',
    role: 'Boutique de savons artisanaux',
    initials: 'MC',
  },
  {
    quote: "J'avais 80 produits à rédiger avant le lancement. Avec Woosenteur j'ai tout fait en une matinée. Mes fiches sont meilleures que ce que j'aurais écrit en une semaine.",
    name: 'Karim B.',
    role: 'E-commerce mode homme',
    initials: 'KB',
  },
];

const Stars = () => (
  <div className="flex gap-0.5 mb-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} fill="#C2553B" style={{ color: '#C2553B' }} />
    ))}
  </div>
);

export default function TestimonialsSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#C2553B' }}>
              Ce qu&apos;ils disent
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15, color: 'var(--ls-text)',
              }}
            >
              Ils ont essayé. <em style={{ fontStyle: 'italic', color: 'var(--ls-accent)' }}>Ils ne reviennent pas en arrière.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col rounded-2xl p-7"
                style={{
                  background: 'var(--ls-surface)',
                  border: '1px solid var(--ls-card-border)',
                }}
              >
                <Stars />
                <blockquote className="flex-grow italic leading-relaxed mb-6" style={{ color: 'var(--ls-muted)', fontSize: '0.9375rem' }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#A23F29,#8C7C99)' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
