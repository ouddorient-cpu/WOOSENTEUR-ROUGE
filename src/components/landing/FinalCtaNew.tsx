'use client';

import { motion } from 'framer-motion';

export default function FinalCtaNew() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-warm-brown py-20 sm:py-24 text-center">
      <div className="max-w-xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 700 }}>
            Ton prochain produit mérite<br />une belle fiche.
          </h2>
          <p className="text-white/65 text-[17px] mb-8 max-w-md mx-auto">
            Commence maintenant, c&apos;est gratuit. Pas d&apos;abonnement, pas de carte bancaire.
          </p>

          <button
            onClick={scrollToTrial}
            className="inline-block bg-terra text-white font-semibold text-base px-10 py-4 rounded-xl shadow-[0_4px_24px_rgba(212,112,74,0.35)] hover:bg-terra-dark hover:-translate-y-0.5 transition-all duration-200"
          >
            Écrire ma première fiche — Gratuitement
          </button>

          <p className="text-white/40 text-sm mt-4">
            5 fiches offertes · Sans inscription · Annulable à tout moment
          </p>

          <div className="flex justify-center gap-6 flex-wrap mt-6 text-white/40 text-sm">
            <span>🔒 Sécurisé</span>
            <span>❤️ Sans engagement</span>
            <span>⚡ En 5 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
