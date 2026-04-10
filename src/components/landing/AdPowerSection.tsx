'use client';

import { motion } from 'framer-motion';
import {
  Megaphone, Image as ImageIcon, Flame, BarChart2,
  Sparkles, Share2, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const tools = [
  {
    icon: <Megaphone className="h-5 w-5" />,
    color: 'bg-rose-500/10 text-rose-500',
    badge: 'Facebook & Instagram',
    title: 'Posts viraux en 1 clic',
    description:
      'Génère 3 posts Facebook prêts à publier : accroche, corps du texte, hashtags et emoji. Adapté à ton parfum, ton audience et ton style.',
  },
  {
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-500',
    badge: 'Tendance',
    title: 'Flash vente & urgence',
    description:
      'Textes "vente flash" avec compte à rebours psychologique. L\'IA rédige l\'urgence pour toi — promo, stock limité, offre exclusive.',
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    color: 'bg-violet-500/10 text-violet-500',
    badge: 'IA visuelle',
    title: 'Visuels pub générés par IA',
    description:
      'FLUX génère des images publicitaires premium à partir de ton flacon. 3 styles : Luxe, Clean, Fun. Format carré, story ou bannière.',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-500',
    badge: 'Engagement',
    title: 'Sondages & polls audience',
    description:
      'Crée des sondages Facebook qui génèrent de l\'interaction — "Tu préfères oud ou vanille ?" — pour booster ta portée organique.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-500',
    badge: 'Comparatif',
    title: 'Dupe Viral Before/After',
    description:
      'Format Before/After canvas optimisé TikTok & Reels. L\'IA identifie ton équivalent de marque et rédige la comparaison qui convertit.',
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    color: 'bg-emerald-500/10 text-emerald-500',
    badge: 'Multicanal',
    title: 'Export & partage direct',
    description:
      'Télécharge tes visuels en PNG, copie les textes en 1 clic. Prêts pour Buffer, Meta Business Suite ou publication manuelle.',
  },
];

export default function AdPowerSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 text-white"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 50%, #1e3a8a 100%)' }}>
            <Zap className="h-3.5 w-3.5" />
            Studio publicitaire IA — tout intégré dans le dashboard
          </span>
          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Ton contenu pub,{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 50%, #1e3a8a 100%)' }}
            >
              généré en 30 secondes.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Woosenteur ne fait pas que les fiches produits. Le dashboard contient un vrai studio pub IA —
            posts, visuels, sondages, flash vente — que la plupart des utilisateurs n&apos;ont pas encore découvert.
          </p>
        </motion.div>

        {/* Tools grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group relative bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Badge */}
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {tool.badge}
              </span>

              {/* Icon + Title */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${tool.color}`}>
                  {tool.icon}
                </div>
                <h3 className="font-semibold text-foreground text-base leading-snug pt-1">
                  {tool.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA — Sedestral-style proof + action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.08) 0%, rgba(124,58,237,0.08) 50%, rgba(30,58,138,0.10) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <div className="flex-1">
            <h3 className="font-headline text-2xl md:text-3xl font-bold text-foreground mb-3">
              Un dashboard. Tout ce qu&apos;il faut pour vendre.
            </h3>
            <div className="flex flex-col gap-2 mt-4">
              {[
                'Fiches produits SEO générées par IA',
                'Posts Facebook & visuels pub prêts à l\'emploi',
                'Formats TikTok, Story, Dupe Viral Before/After',
                'Publication WooCommerce en 1 clic',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" className="text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 50%, #1e3a8a 100%)' }}>
                <Link href="/dashboard/marketing">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Accéder au Studio Pub
                </Link>
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground">Inclus dans tous les plans</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
