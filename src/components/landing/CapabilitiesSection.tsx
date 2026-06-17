'use client';

import { motion } from 'framer-motion';
import SectionDivider from '@/components/ui/section-divider';

type Item = { title: string; desc: string };
type Pillar = { n: string; label: string; tagline: string; items: Item[] };

const pillars: Pillar[] = [
  {
    n: '01',
    label: 'Rédiger',
    tagline: 'L\u2019IA qui écrit',
    items: [
      {
        title: 'Une fiche en 30 secondes',
        desc: 'Titre SEO, méta-description, slug, balise alt, données structurées — générés à partir de quelques mots, avec recherche web automatique du produit.',
      },
      {
        title: 'Deux expertises, un seul outil',
        desc: 'Pour les parfums : prose olfactive sensorielle — notes de tête/cœur/fond, sillage, tenue, famille. Pour le reste, l\u2019IA généraliste adapte le ton à chaque catégorie : dynamique pour le sport, rassurant pour les soins.',
      },
      {
        title: 'Votre propre produit, même inconnu de l\u2019IA',
        desc: 'Marque propre, dropshipping confidentiel, création artisanale : décrivez-le, Woosenteur lui invente la fiche que le monde verra.',
      },
    ],
  },
  {
    n: '02',
    label: 'Publier',
    tagline: 'L\u2019IA qui exporte',
    items: [
      {
        title: 'Fiches en masse',
        desc: 'Importez un fichier CSV et enrichissez plusieurs dizaines de produits d\u2019un coup — au lieu d\u2019une fiche à la fois.',
      },
      {
        title: 'Export WooCommerce en 1 clic',
        desc: 'Connectez votre boutique une fois. Chaque fiche se publie directement, structurée selon les conventions WooCommerce.',
      },
      {
        title: 'Export CSV universel',
        desc: 'Shopify, Etsy, Prestashop, Magento ou tout autre CMS : un fichier prêt à importer, sans manipulation technique.',
      },
    ],
  },
  {
    n: '03',
    label: 'Promouvoir',
    tagline: 'Le studio pub intégré',
    items: [
      {
        title: 'Posts Facebook & Instagram viraux',
        desc: 'Accroche, corps de texte, hashtags — générés en 1 clic, adaptés à votre produit et à votre audience.',
      },
      {
        title: 'Visuels publicitaires par IA',
        desc: 'Images premium générées à partir de votre photo produit, en 3 styles : Luxe, Clean ou Fun. Carré, story ou bannière.',
      },
      {
        title: 'Dupe Viral Before/After',
        desc: 'Spécial parfum : l\u2019IA identifie l\u2019équivalent de marque et rédige la comparaison, au format Before/After pensé pour TikTok et Reels.',
      },
    ],
  },
];

export default function CapabilitiesSection() {
  return (
    <>
      <section className="py-24 sm:py-32" style={{ background: 'var(--ls-bg-alt)' }}>
        <div className="max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ls-accent)' }}
            >
              ✦ Tout ce que Woosenteur fait pour vous
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif', fontWeight: 600,
                fontSize: 'clamp(2rem,4.5vw,2.8rem)', lineHeight: 1.15,
                color: 'var(--ls-text)',
              }}
            >
              Un outil. <em style={{ fontStyle: 'italic', color: 'var(--ls-accent)' }}>Trois métiers.</em>
            </h2>
            <p className="mt-4" style={{ color: 'var(--ls-muted)' }}>
              De la première phrase jusqu\u2019au post Facebook qui fait vendre.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, pi) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: pi * 0.12 }}
                className="relative rounded-xl p-7"
                style={{ background: 'var(--ls-surface)', border: '1px solid var(--ls-card-border)' }}
              >
                <span
                  aria-hidden
                  className="absolute top-5 left-5 w-3 h-3 rounded-full"
                  style={{ background: 'var(--ls-bg-alt)', border: '1px solid var(--ls-border-color)' }}
                />

                <div className="ml-5 mb-6 flex items-baseline gap-3">
                  <span
                    style={{ fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.78rem', color: 'var(--ls-accent)' }}
                  >
                    {p.n}
                  </span>
                  <div>
                    <h3
                      style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.4rem', color: 'var(--ls-text)' }}
                    >
                      {p.label}
                    </h3>
                    <span className="text-xs" style={{ color: 'var(--ls-muted)' }}>{p.tagline}</span>
                  </div>
                </div>

                <div className="ml-5 space-y-5">
                  {p.items.map((item) => (
                    <div key={item.title}>
                      <p className="font-semibold mb-1" style={{ fontSize: '0.94rem', color: 'var(--ls-text)' }}>
                        {item.title}
                      </p>
                      <p className="leading-relaxed" style={{ fontSize: '0.85rem', color: 'var(--ls-muted)' }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
