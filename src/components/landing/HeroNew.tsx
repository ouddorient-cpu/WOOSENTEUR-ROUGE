'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const WaveDown = ({ from, to }: { from: string; to: string }) => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
      <path d={`M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z`} fill={to} />
    </svg>
  </div>
);

export default function HeroNew() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="bg-cream pt-28 pb-12 sm:pt-36 sm:pb-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-sage-pale text-sage font-semibold text-sm px-4 py-1.5 rounded-full mb-6 tracking-wide">
              ✦ +3 000 fiches produits déjà générées
            </span>

            <h1 className="font-serif text-warm-brown leading-tight mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 700 }}>
              Votre fiche produit rédigée<br className="hidden sm:block" /> en 5 minutes — prête à publier.
            </h1>

            <p className="text-warm-gray text-lg leading-relaxed max-w-lg mx-auto mb-8">
              Décrivez votre produit en quelques mots. Woosenteur écrit le texte de vente, le titre et les mots-clés. Vous copiez, vous publiez. Sans agence, sans rédacteur.
            </p>

            <button
              onClick={scrollToTrial}
              className="inline-block bg-terra text-white font-semibold text-base px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(212,112,74,0.28)] hover:bg-terra-dark hover:-translate-y-0.5 transition-all duration-200"
            >
              Générer ma première fiche — Gratuitement
            </button>
            <p className="text-warm-gray text-sm mt-3">
              Sans inscription · 5 fiches offertes · Aucune carte bancaire
            </p>
            <p className="text-warm-gray/60 text-sm mt-2">
              Ou{' '}
              <Link href="/pricing" className="underline underline-offset-2 hover:text-warm-brown transition-colors">
                voir les formules
              </Link>{' '}
              à partir de 5,99 €/mois
            </p>
          </motion.div>

          {/* Mini démo visuelle */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 rounded-2xl border border-warm-border bg-cream-surface shadow-[0_8px_40px_rgba(46,32,24,0.07)] p-6 text-left"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-2">✦ Exemple en live</p>
            <p className="text-warm-gray text-sm mb-4 italic">
              Ce que tu nous donnes :<br />
              <span className="font-medium">"Bougie naturelle à la lavande. Faite main. 150g."</span>
            </p>
            <div className="border-t border-warm-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-2">✓ Ce que Woosenteur rédige</p>
              <p className="text-warm-brown text-sm leading-relaxed">
                Offre-toi un moment de calme avec notre bougie à la vraie lavande de Provence, fabriquée à la main
                en petite série. Idéale pour une soirée cocooning ou en cadeau. 150g — jusqu&apos;à 40h de combustion douce.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      <WaveDown from="#07090F" to="#07090F" />
    </>
  );
}
