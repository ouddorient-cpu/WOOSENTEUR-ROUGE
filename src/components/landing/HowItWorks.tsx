'use client';

import { motion } from 'framer-motion';
import { Sparkles, Search, Upload } from 'lucide-react';
import { WoodyEmoji } from '@/components/ui/woody-emoji';
import { WoodyPose } from '@/components/ui/woody-pose';

const steps = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    step: 1,
    title: 'Entrez les infos produit',
    description: 'Nom, marque, catégorie — c\'est tout ce dont l\'IA a besoin pour démarrer.',
    color: 'from-violet-600 to-violet-500',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    icon: <Search className="h-6 w-6" />,
    step: 2,
    title: 'L\'IA génère votre fiche',
    description: 'Notre agent recherche le produit sur le web et rédige une fiche unique, structurée et optimisée SEO en quelques secondes.',
    color: 'from-indigo-600 to-indigo-500',
    glow: 'rgba(99,102,241,0.35)',
  },
  {
    icon: <Upload className="h-6 w-6" />,
    step: 3,
    title: 'Exportez et publiez',
    description: '1 clic pour exporter vers WooCommerce, ou téléchargez un CSV universel pour Shopify et toute autre plateforme.',
    color: 'from-blue-600 to-blue-500',
    glow: 'rgba(59,130,246,0.35)',
  },
];

const HowItWorks = () => (
  <section id="comment" className="py-24 lg:py-32 relative z-10">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="w-[500px] h-[250px] opacity-10 blur-[100px] rounded-full"
        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }} />
    </div>

    <div className="container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="section-label">Comment ça marche ?</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mt-4">
          3 étapes pour une fiche{' '}
          <span className="text-gradient">prête à publier</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/50">
          Pas besoin de formation. Vous êtes opérationnel dès la première utilisation.
        </p>
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Gradient connector line (desktop) */}
        <div
          className="absolute top-8 left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-[2px] hidden md:block"
          aria-hidden
          style={{ background: 'linear-gradient(to right, #8B5CF6, #6366F1, #3B82F6)' }}
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
              {/* Icon circle */}
              <div className="relative z-10 mb-6">
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}
                  style={{ boxShadow: `0 8px 24px -6px ${step.glow}` }}
                >
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black text-white leading-none"
                  style={{ background: '#060612', border: `2px solid #8B5CF6`, boxShadow: '0 0 10px rgba(139,92,246,0.4)' }}>
                  {step.step}
                </span>
              </div>

              {/* Card */}
              <div className="glass-card p-6 w-full hover:-translate-y-1 transition-all duration-300">
                <h3 className="font-headline text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Woody commentaire */}
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
          <div className="glass-card !rounded-2xl !rounded-tl-sm px-5 py-3 max-w-xs border-violet-500/20">
            <p className="text-sm font-medium text-white/75 flex items-center gap-2 flex-wrap">
              Simple non ? Je m&apos;occupe de tout — vous vous concentrez sur votre cœur de métier.
              <WoodyEmoji mood="excited" size={28} />
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
