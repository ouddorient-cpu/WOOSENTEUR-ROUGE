'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const personas = [
  {
    logoSrc: '/logo-woocommerce.png',
    logoAlt: 'WooCommerce',
    logoW: 130,
    logoH: 32,
    accentBorder: 'border-t-primary',
    accentColor: 'text-primary',
    bgAccent: 'bg-primary/10 border-primary/20',
    title: 'Boutiques WooCommerce',
    subtitle: 'Publication directe, sans copier-coller',
    description:
      'Connectez votre boutique une seule fois. Vos fiches sont rédigées et structurées selon les conventions WooCommerce — prêtes à publier en 1 clic.',
    benefit: 'Export WooCommerce natif',
  },
  {
    logoSrc: '/logo-shopify.png',
    logoAlt: 'Shopify',
    logoW: 110,
    logoH: 32,
    accentBorder: 'border-t-green-500',
    accentColor: 'text-emerald-600',
    bgAccent: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Boutiques Shopify',
    subtitle: 'CSV prêt à l\'import, en quelques secondes',
    description:
      'Générez vos descriptions optimisées et téléchargez un fichier CSV compatible Shopify — sans aucune manipulation technique.',
    benefit: 'Export CSV universel',
  },
  {
    logoSrc: '/logo-magento.png',
    logoAlt: 'Magento',
    logoW: 120,
    logoH: 32,
    accentBorder: 'border-t-orange-500',
    accentColor: 'text-orange-600',
    bgAccent: 'bg-orange-500/10 border-orange-500/20',
    title: 'Magento & autres CMS',
    subtitle: 'Mode, cosmétiques, maison, sport, alimentation…',
    description:
      'L\'IA adapte le ton et la structure à votre univers produit. Les cosmétiques disposent d\'optimisations dédiées : notes, ingrédients, bénéfices.',
    benefit: 'Tous les champs SEO générés',
  },
];

const ForWho = () => (
  <section id="pour-qui" className="py-24 lg:py-32 bg-background">
    <div className="container mx-auto px-4 md:px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <span className="section-label">Pour qui ?</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mt-4">
          Quelle que soit votre boutique,{' '}
          <span className="text-gradient">Woosenteur s&apos;adapte.</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Un seul outil pour tous les e-commerçants qui veulent des fiches qui convertissent.
        </p>
      </motion.div>

      {/* Bannière triptych — 3 plateformes en une image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-xl"
      >
        <Image
          src="/Gemini_Generated_Image_uskb23uskb23uskb.png"
          alt="E-commerçants utilisant WooCommerce, Shopify et Magento"
          width={1200}
          height={500}
          className="w-full object-cover"
          style={{ maxHeight: 340 }}
          priority
        />
        {/* Gradient bottom pour transition douce */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* 3 cartes avec logos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {personas.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`bg-white dark:bg-card rounded-2xl border-t-4 ${p.accentBorder} border border-border hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden shadow-md`}
          >
            {/* Logo plateforme */}
            <div className="px-6 pt-6 pb-4 border-b border-border/50">
              <Image
                src={p.logoSrc}
                alt={p.logoAlt}
                width={p.logoW}
                height={p.logoH}
                style={{ height: 28, width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Contenu */}
            <div className="p-6">
              <h3 className="font-headline text-xl font-bold text-foreground mb-1">
                {p.title}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground mb-3">
                {p.subtitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {p.description}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${p.bgAccent} ${p.accentColor}`}
              >
                ✓ {p.benefit}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ForWho;
