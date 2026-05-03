'use client';

import { motion } from 'framer-motion';

const objections = [
  {
    q: 'Je ne connais rien au SEO.',
    a: 'Tu n\'as pas à le connaître. Woosenteur s\'en occupe discrètement, sans t\'en parler.',
  },
  {
    q: 'Je ne suis pas bon·e en rédaction.',
    a: 'C\'est exactement pour ça que l\'outil existe. Tu donnes les infos, on rédige pour toi.',
  },
  {
    q: 'Et si le résultat ne me correspond pas ?',
    a: 'Tu peux relancer, modifier et affiner jusqu\'à être satisfait·e. Gratuitement.',
  },
  {
    q: 'C\'est fait pour les grandes boutiques ?',
    a: 'Non — c\'est fait pour les vendeurs qui démarrent, qui gèrent tout seul·e et qui ont besoin d\'un coup de main rapide.',
  },
];

export default function ReassuranceBlock() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-warm-brown mb-3" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
            Pas besoin d&apos;être expert·e.
          </h2>
          <p className="text-warm-gray text-[17px] max-w-md mx-auto">
            Woosenteur a été conçu pour des gens comme toi — pas pour des développeurs.
          </p>
        </motion.div>

        <div className="divide-y divide-warm-border border-t border-warm-border">
          {objections.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="py-6"
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-sage"
                  style={{ background: 'rgba(59,130,246,0.12)' }}
                >
                  ?
                </div>
                <p className="font-semibold text-warm-brown text-base m-0">{o.q}</p>
              </div>
              <p className="text-warm-gray text-[15.5px] leading-relaxed pl-10 m-0">{o.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
