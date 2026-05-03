'use client';

import { motion } from 'framer-motion';

export default function FinalCtaNew() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-24 text-center" style={{ background: 'linear-gradient(135deg, #0A0F1C 0%, #081A3D 50%, #0A0F1C 100%)' }}>
      <div className="max-w-xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 700 }}>
            Arrêtez de perdre des ventes<br />avec des fiches incomplètes.
          </h2>
          <p className="text-white/65 text-[17px] mb-8 max-w-md mx-auto">
            5 fiches produits offertes, sans carte bancaire. Vous voyez le résultat avant de décider quoi que ce soit.
          </p>

          <button
            onClick={scrollToTrial}
            className="inline-block bg-terra text-white font-semibold text-base px-10 py-4 rounded-xl shadow-[0_4px_24px_rgba(212,112,74,0.35)] hover:bg-terra-dark hover:-translate-y-0.5 transition-all duration-200"
          >
            Générer ma première fiche — Gratuitement
          </button>

          <p className="text-white/40 text-sm mt-4">
            Sans inscription · Résultat en moins de 60 secondes · Annulable à tout moment
          </p>

          <div className="flex justify-center gap-6 flex-wrap mt-8 text-white/50 text-sm">
            <span>🔒 Données sécurisées</span>
            <span>⚡ Résultat en 60 secondes</span>
            <span>📦 Export WooCommerce & Shopify</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
