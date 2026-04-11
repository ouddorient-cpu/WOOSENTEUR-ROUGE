'use client';

import { motion } from 'framer-motion';
import { Sparkles, Search, Upload } from 'lucide-react';
import Image from 'next/image';
import { WoodyEmoji } from '@/components/ui/woody-emoji';
import { WoodyPose } from '@/components/ui/woody-pose';

const steps = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    step: 1,
    title: 'Entrez les infos produit',
    description: 'Nom, marque, catégorie — c\'est tout ce dont l\'IA a besoin pour démarrer.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    step: 2,
    title: 'L\'IA génère votre fiche',
    description: 'Notre agent recherche le produit sur le web et rédige une fiche unique, structurée et optimisée SEO en quelques secondes.',
  },
  {
    icon: <Upload className="h-6 w-6" />,
    step: 3,
    title: 'Exportez et publiez',
    description: '1 clic pour exporter vers WooCommerce, ou téléchargez un CSV universel pour Shopify et toute autre plateforme.',
  },
];

const HowItWorks = () => (
  <section id="comment" className="py-24 lg:py-32 bg-muted/20">
    <div className="container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="section-label">Comment ça marche ?</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mt-4">
          3 étapes pour une fiche{' '}
          <span className="text-gradient">prête à publier</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Pas besoin de formation. Vous êtes opérationnel dès la première utilisation.
        </p>
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Dashed connector line (desktop only) */}
        <div
          className="absolute top-8 left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-px border-t-2 border-dashed border-border hidden md:block"
          aria-hidden
        />

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon circle (sits on top of the connector line) */}
              <div className="relative z-10 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[11px] font-black text-primary leading-none">
                  {step.step}
                </span>
              </div>

              <div className="glass-card dark:bg-card dark:border-border rounded-2xl p-6 w-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <h3 className="font-headline text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Woody — commentaire final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WoodyPose pose="whispering" width={90} className="drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
