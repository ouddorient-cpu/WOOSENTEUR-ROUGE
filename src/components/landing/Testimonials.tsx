'use client';

import { motion } from 'framer-motion';
import { Star, ExternalLink, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maghzaz Nourddine',
    boutique: 'Dubai Negoce',
    url: 'https://dubainegoce.fr',
    rating: 5,
    text: "Notre boutique en ligne est un véritable succès ! La navigation est fluide et les paiements sont sécurisés. Woosenteur a considérablement accéléré la mise en ligne de nos produits. Une collaboration que je recommande vivement.",
    category: 'Cosmétiques & Parfums',
  },
  {
    name: 'Maghzaz Nourddine',
    boutique: 'French Avenue',
    url: 'https://www.frenchavenue.fr',
    rating: 5,
    text: "Un outil exceptionnel. Le design de notre boutique est épuré, professionnel, et les fiches produits générées par l'IA sont parfaitement optimisées. Un vrai gain de temps pour gérer notre catalogue.",
    category: 'Mode & Beauté',
  },
];

const Testimonials = () => (
  <section className="py-20 lg:py-24 relative z-10">
    <div className="container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-300 mb-4">
          Ils utilisent Woosenteur
        </span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-white">
          Des boutiques réelles, des résultats réels
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-lg text-white/50">
          Découvrez comment nos clients gagnent du temps et vendent plus.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="glass-card p-8 flex flex-col gap-4"
          >
            <Quote className="h-8 w-8 text-violet-500/30 self-end" />

            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: t.rating }).map((_, si) => (
                <Star key={si} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <p className="text-white/65 leading-relaxed text-sm flex-grow">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
              <div>
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-xs text-white/40">{t.category}</p>
              </div>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                {t.boutique}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-white/35">
          Rejoignez les boutiques qui génèrent leurs fiches produits avec l&apos;IA
        </p>
      </motion.div>
    </div>
  </section>
);

export default Testimonials;
