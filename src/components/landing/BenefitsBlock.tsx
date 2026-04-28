'use client';

import { motion } from 'framer-motion';

const benefits = [
  { emoji: '⏱', title: 'Tu gagnes du temps', desc: 'Plus besoin de passer 2h à chercher tes mots. En 5 minutes, c\'est fait.' },
  { emoji: '✍️', title: 'Fini la page blanche', desc: 'L\'outil démarre la rédaction à ta place. Tu n\'as qu\'à valider.' },
  { emoji: '🛒', title: 'Des visiteurs qui comprennent', desc: 'Une fiche claire, c\'est un acheteur rassuré qui passe à l\'acte.' },
  { emoji: '🌿', title: 'Zéro jargon', desc: 'Pas besoin de connaître le SEO ni l\'IA. On parle comme toi.' },
  { emoji: '💬', title: 'Un texte qui te ressemble', desc: 'Donne le ton, on l\'adapte à ta façon de vendre.' },
  { emoji: '📦', title: 'Prêt à publier', desc: 'Copie-colle directement sur WooCommerce, Shopify ou ta boutique.' },
];

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function BenefitsBlock() {
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
            <h2 className="text-warm-brown" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
              Ce que ça change pour toi
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-cream-surface rounded-2xl p-6 shadow-sm border border-warm-border"
              >
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-semibold text-warm-brown text-base mb-1.5">{b.title}</h3>
                <p className="text-warm-gray text-sm leading-relaxed m-0">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveDown to="#FAF6F0" />
    </>
  );
}
