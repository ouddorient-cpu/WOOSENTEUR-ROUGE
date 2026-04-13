'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, BarChart2, PenLine, Check } from 'lucide-react';
import NextImage from 'next/image';
import { WoodyPose } from '@/components/ui/woody-pose';

/* ─── CardVisual ─────────────────────────────────────────────────────────── */
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
  <div className="relative h-52 rounded-t-2xl overflow-hidden flex items-center px-6 gap-5"
    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.06) 100%)' }}>

    {/* Top shimmer line */}
    <div className="absolute top-0 left-0 w-full h-[1px]"
      style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.5), transparent)' }} />

    {/* AVANT */}
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative">
        <div className="opacity-40 text-white/60">{beforeIcon}</div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 48 48">
          <line x1="4" y1="44" x2="44" y2="4" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>
      <span className="text-xs font-semibold text-red-400 text-center leading-tight max-w-[70px]">{beforeLabel}</span>
    </div>

    {/* Flèche */}
    <ArrowRight className="h-5 w-5 text-violet-400/60 flex-shrink-0" />

    {/* APRÈS */}
    <div className="flex flex-col items-center gap-2 flex-1">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="rounded-full p-1.5 shadow-md shadow-violet-500/20" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <NextImage
            src="/woody-white.png"
            alt="Woody Woosenteur"
            width={56}
            height={56}
            style={{ width: 56, height: 'auto' }}
          />
        </div>
      </motion.div>
      <div className="glass-card !rounded-xl px-4 py-2.5 text-center w-full">
        <div className="font-black text-2xl leading-none tracking-tight text-gradient">{afterStat}</div>
        <div className="text-xs text-white/50 font-medium mt-1 flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-violet-400" />
          {afterLabel}
        </div>
      </div>
    </div>

    {/* Badge logos */}
    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
      {logos.map((src, i) => (
        <NextImage key={i} src={src} alt="logo plateforme" width={56} height={18}
          style={{ height: 18, width: 'auto', objectFit: 'contain', opacity: 0.8 }} />
      ))}
    </div>
  </div>
);

/* ─── Données ─────────────────────────────────────────────────────────────── */
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
    solution: 'Quelques minutes, pas des heures',
    description: 'Tu renseignes le nom du produit et sa catégorie. L\'IA cherche le contexte, rédige et structure le tout. Tu relis, tu publies.',
    outcome: 'Temps de rédaction réduit',
    accent: 'text-violet-400',
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
    solution: 'Chaque champ SEO rempli correctement',
    description: 'Titre, méta-description, slug, balises alt, JSON-LD — tout est généré selon les bonnes pratiques Rank Math et Yoast.',
    outcome: 'Structure SEO complète d\'emblée',
    accent: 'text-blue-400',
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
    solution: 'Publication directe — 0 intermédiaire',
    description: 'Depuis le générateur, publiez en 1 clic sur WooCommerce ou exportez un CSV pour Shopify — sans quitter l\'interface.',
    outcome: 'Publication en 1 clic',
    accent: 'text-indigo-400',
  },
];

/* ─── Composant ──────────────────────────────────────────────────────────── */
const Features = () => (
  <section id="pourquoi" className="py-24 lg:py-32 relative z-10">
    {/* Subtle section glow */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="w-[600px] h-[300px] opacity-10 blur-[100px] rounded-full"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }} />
    </div>

    <div className="container mx-auto px-4 md:px-6">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 relative"
      >
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
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mt-4">
          Ce que les autres outils{' '}
          <span className="text-gradient">ne font pas pour vous</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/50">
          Les outils IA généralistes produisent du texte. Woosenteur produit une fiche structurée
          — avec tous les champs qu&apos;un bon référencement demande.
        </p>
      </motion.div>

      {/* 3 cartes */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {whyCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card overflow-hidden"
          >
            {card.visual}
            <div className="p-6">
              <h3 className="font-headline text-xl font-bold text-white mb-3">
                {card.solution}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed mb-5">
                {card.description}
              </p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${card.accent}`}
                style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
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