'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    n: '1',
    title: 'Décris ton produit',
    desc: "Son nom, ce qu'il fait, à qui il s'adresse. Pas besoin d'être exhaustif·ve — quelques mots suffisent.",
  },
  {
    n: '2',
    title: "On s'occupe du reste",
    desc: 'Woosenteur rédige une fiche claire avec les bons mots pour convaincre tes visiteurs. Aucun jargon technique.',
  },
  {
    n: '3',
    title: 'Publie en un clic',
    desc: 'Copie le texte ou exporte directement vers ta boutique WooCommerce ou Shopify. Ta fiche est prête.',
  },
];

const WaveDown = ({ to }: { to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill={to} />
    </svg>
  </div>
);

export default function HowItWorksNew() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

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
            <span className="inline-block bg-white text-sage font-semibold text-sm px-4 py-1.5 rounded-full mb-4 tracking-wide shadow-sm">
              Comment ça marche
            </span>
            <h2 className="text-warm-brown" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 600 }}>
              Trois étapes.<br />Pas de complication.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-7">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-5"
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ fontFamily: "'Cormorant Garamond', serif", background: '#2563EB' }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-warm-brown text-base mb-1">{step.title}</h3>
                  <p className="text-warm-gray text-[15px] leading-relaxed m-0">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={scrollToTrial}
              className="inline-block border-2 border-sage text-sage font-medium text-[15px] px-6 py-3 rounded-xl hover:bg-sage-pale transition-colors duration-200"
            >
              Essayer maintenant →
            </button>
          </div>
        </div>
      </section>
      <WaveDown to="#07090F" />
    </>
  );
}
