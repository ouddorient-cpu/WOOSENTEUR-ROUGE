'use client';

import { motion } from 'framer-motion';

const pains = [
  "Je perds des ventes parce que mes fiches sont vides ou bâclées.",
  "J'ai peur que ça fasse amateur et que ça fasse fuir mes clients.",
  "Je bloque depuis des heures devant une page vide — j'ai d'autres choses à faire.",
  "Je ne connais rien au SEO et mes produits n'apparaissent pas sur Google.",
  "J'ai 50 produits à rédiger. Je ne sais même pas par où commencer.",
];

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,0 1080,48 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function FrustrationsBlock() {
  return (
    <>
      <section className="bg-cream-alt py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-warm-gray text-lg italic mb-3">
              &ldquo;Combien de ventes perdez-vous chaque jour à cause d&apos;une fiche produit incomplète ?&rdquo;
            </p>
            <h2 className="text-warm-brown" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
              Ces problèmes ont une solution.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {pains.map((pain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-cream-surface rounded-xl border-l-[3px] border-terra px-5 py-4 flex items-center gap-4 shadow-sm"
              >
                <span className="text-terra text-lg flex-shrink-0 opacity-70">✗</span>
                <p className="text-warm-brown text-[15.5px] m-0">{pain}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveDown to="#07090F" />
    </>
  );
}
