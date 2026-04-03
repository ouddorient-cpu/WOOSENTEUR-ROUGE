'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, BarChart2, PenLine, Check } from 'lucide-react';
import NextImage from 'next/image';
import { WoodyPose } from '@/components/ui/woody-pose';

/* ─── Visuel composé : Frustration → Solution ─────────────────────────────── */

const CardVisual = ({
  logos,
  beforeIcon,
  beforeLabel,
  afterStat,
  afterLabel,
}: {
  logos: string[];
  beforeIcon: React.ReactNode;
  beforeLabel: string;
  afterStat: string;
  afterLabel: string;
}) => (
  <div className="relative h-52 rounded-t-2xl overflow-hidden bg-gradient-to-br from-blue-50/80 to-primary/8 dark:from-slate-900 dark:to-primary/10 flex items-center px-6 gap-5">

    {/* ── AVANT : élément barré ─────────────────── */}
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative">
        <div className="opacity-50 text-slate-400">
          {beforeIcon}
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 48 48">
          <line x1="4" y1="44" x2="44" y2="4" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>
      <span className="text-xs font-semibold text-red-400 text-center leading-tight max-w-[70px]">{beforeLabel}</span>
    </div>

    {/* ── Flèche ──────────────────────────────── */}
    <ArrowRight className="h-5 w-5 text-primary/50 flex-shrink-0" />

    {/* ── APRÈS : Woody + stat ────────────────── */}
    <div className="flex flex-col items-center gap-2 flex-1">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="bg-white rounded-full p-1.5 shadow-md">
          <NextImage
            src="/woody-white.png"
            alt="Woody Woosenteur"
            width={56}
            height={56}
            style={{ width: 56, height: 'auto' }}
          />
        </div>
      </motion.div>

      {/* Carte stat minimaliste */}
      <div className="bg-white dark:bg-card rounded-2xl px-4 py-2.5 shadow-lg border border-border text-center w-full">
        <div className="text-primary font-black text-2xl leading-none tracking-tight">{afterStat}</div>
        <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-primary" />
          {afterLabel}
        </div>
      </div>
    </div>

    {/* ── Badge logos plateforme ───────────────── */}
    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white dark:bg-card/90 rounded-xl px-2.5 py-1.5 shadow-sm border border-border/50">
      {logos.map((src, i) => (
        <NextImage key={i} src={src} alt="logo plateforme" width={56} height={18} style={{ height: 18, width: 'auto', objectFit: 'contain' }} />
      ))}
    </div>
  </div>
);

/* ─── Données des 3 cartes ─────────────────────────────────────────────────── */

const whyCards = [
  {
    visual: (
      <CardVisual
        logos={['/logo-woocommerce.png']}
        beforeIcon={<Clock className="h-12 w-12" />}
        beforeLabel="1h – 2h par fiche"
        afterStat="3 min"
        afterLabel="Fiche prête à publier"
      />
    ),
    pain: 'Rédiger une fiche prend du temps',
    solution: 'Quelques minutes, pas des heures',
    description: 'Tu renseignes le nom du produit et sa catégorie. L\'IA cherche le contexte, rédige et structure le tout. Tu relis, tu publies.',
    outcome: 'Temps de rédaction réduit',
  },
  {
    visual: (
      <CardVisual
        logos={['/logo-shopify.png']}
        beforeIcon={<BarChart2 className="h-12 w-12" />}
        beforeLabel="ChatGPT généraliste"
        afterStat="6 / 6"
        afterLabel="Champs SEO générés"
      />
    ),
    pain: 'Les fiches mal structurées passent inaperçues',
    solution: 'Chaque champ SEO rempli correctement',
    description: 'Titre, méta-description, slug, balises alt, JSON-LD — tout est généré selon les bonnes pratiques Rank Math et Yoast.',
    outcome: 'Structure SEO complète d\'emblée',
  },
  {
    visual: (
      <CardVisual
        logos={['/logo-woocommerce.png', '/logo-shopify.png', '/logo-magento.png']}
        beforeIcon={<PenLine className="h-12 w-12" />}
        beforeLabel="Rédaction à la main"
        afterStat="1 clic"
        afterLabel="Publié automatiquement"
      />
    ),
    pain: 'Un rédacteur rédige, corrige, envoie par mail',
    solution: 'Vous publiez directement depuis le générateur',
    description: 'Fini les allers-retours avec un copywriter qui vous envoie des emails. Depuis le générateur, publiez en 1 clic sur WooCommerce ou exportez un CSV pour Shopify — sans quitter l\'interface.',
    outcome: 'Publication directe — 0 intermédiaire',
  },
];

/* ─── Composant principal ──────────────────────────────────────────────────── */

const Features = () => (
  <section id="pourquoi" className="py-24 lg:py-32 bg-muted/20">
    <div className="container mx-auto px-4 md:px-6">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 relative"
      >
        {/* Woody pointing — desktop */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute -left-4 top-0 hidden lg:block"
          style={{ transform: 'scaleX(-1)' }}
        >
          <WoodyPose pose="pointing" width={100} />
        </motion.div>

        <span className="section-label">Pourquoi Woosenteur ?</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mt-4">
          Ce que les autres outils{' '}
          <span className="text-gradient">ne font pas pour vous</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/65">
          Les outils IA généralistes produisent du texte. Woosenteur produit une fiche structurée
          — avec tous les champs qu&apos;un bon référencement demande.
        </p>
      </motion.div>

      {/* 3 grandes cartes Frustration → Solution */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-14">
        {whyCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card dark:bg-card dark:border-border rounded-2xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl overflow-hidden"
          >
            {/* Visuel composé */}
            {card.visual}

            {/* Texte */}
            <div className="p-6">
              <h3 className="font-headline text-xl font-bold text-foreground mb-3">
                {card.solution}
              </h3>
              <p className="text-sm text-foreground/75 leading-relaxed mb-5">
                {card.description}
              </p>
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                ✦ {card.outcome}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default Features;
