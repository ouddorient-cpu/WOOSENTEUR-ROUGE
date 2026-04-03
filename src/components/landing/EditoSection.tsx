'use client';

import { motion } from 'framer-motion';

const EditoSection = () => (
  <section className="py-20 lg:py-28 bg-background border-t border-border/40">
    <div className="container mx-auto px-4 md:px-6 max-w-3xl">

      {/* Chapô */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="section-label">Prendre du recul</span>
        <p className="mt-5 text-xl md:text-2xl font-semibold text-foreground leading-snug">
          La fiche produit a toujours été l'un des leviers les plus sous-estimés
          du commerce — en ligne comme hors ligne. Ce qui a changé, c'est le coût d'accès à la qualité.
        </p>
      </motion.div>

      {/* Corps dense */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="prose prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed space-y-5"
      >
        <p>
          Avant internet, La Redoute, Les 3 Suisses, le Bon Marché employaient
          des équipes entières pour rédiger leurs catalogues. Le copywriting produit
          n'est pas une invention numérique — c'est un artisanat centenaire,
          longtemps réservé aux entreprises qui pouvaient se l'offrir.
        </p>

        <p>
          WooCommerce, Shopify, Prestashop ont ouvert la vente en ligne à tous.
          Mais la plateforme ne rédige pas à votre place. Un copywriter freelance
          e-commerce facture entre 40 et 120 € la fiche.
          Pour 150 références, la question financière se pose d'elle-même.
        </p>

        <p>
          Les IA généralistes écrivent vite. Mais une fiche qui performe sur Google,
          c'est un titre SEO, une méta à 155 caractères, un slug, du JSON-LD,
          un vocabulaire ancré dans votre niche. Un outil généraliste produit du texte.
          Un outil e-commerce produit une architecture.
        </p>

        <p>
          La vraie question n'est pas « faut-il l'IA ? ». C'est : quel outil
          a été conçu pour WooCommerce, Rank Math, votre acheteur —
          et pas pour l'utilisateur moyen d'un chatbot généraliste ?
        </p>

        <p className="pt-4 border-t border-border/40 text-foreground/50 italic text-sm">
          Les 5 premières fiches sont gratuites. Sans carte bancaire.
          La suite, c'est à vous d'en juger.
        </p>
      </motion.div>

    </div>
  </section>
);

export default EditoSection;
