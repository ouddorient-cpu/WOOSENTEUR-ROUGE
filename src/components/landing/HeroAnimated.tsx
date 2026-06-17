'use client';

import { motion } from 'framer-motion';

export default function HeroAnimated() {
  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28"
      style={{ background: 'var(--ls-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">

        {/* ── Colonne texte ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--ls-accent)' }}
          >
            ✦ L&apos;IA qui rédige vos fiches
          </span>

          <h1
            className="font-bold tracking-tight mb-6"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontWeight: 600,
              fontSize: 'clamp(2.4rem,5vw,3.4rem)',
              lineHeight: 1.1,
              color: 'var(--ls-text)',
            }}
          >
            Un brouillon de 3 mots.
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--ls-accent)' }}>
              Une fiche prête à vendre.
            </em>
          </h1>

          <p
            className="mb-8 leading-relaxed max-w-md"
            style={{ color: 'var(--ls-muted)', fontSize: '1.05rem' }}
          >
            Décrivez votre produit comme vous le feriez à un ami. Woosenteur transforme ça
            en fiche claire, professionnelle et optimisée SEO — prête à publier sur WooCommerce ou Shopify.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              placeholder="ex : bougie vanille, pot 200g..."
              onFocus={scrollToTrial}
              className="flex-1 px-4 py-3.5 rounded-md text-sm outline-none"
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                background: 'var(--ls-surface)',
                border: '1px solid var(--ls-border-color)',
                color: 'var(--ls-text)',
              }}
            />
            <button
              onClick={scrollToTrial}
              className="px-6 py-3.5 rounded-md text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-90"
              style={{ background: 'var(--ls-text)', color: 'var(--ls-bg)' }}
            >
              Générer →
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--ls-muted)' }}>
            Aucune carte bancaire requise · résultat en 30 secondes
          </p>
        </motion.div>

        {/* ── Colonne signature : la fiche qui se transforme ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative h-[360px] sm:h-[420px]"
        >
          {/* Brouillon */}
          <div
            className="absolute top-0 left-0 sm:left-4 w-[260px] rounded-xl p-6"
            style={{
              background: 'var(--ls-surface)',
              border: '1px solid var(--ls-border-color)',
              boxShadow: '0 18px 36px -18px rgba(43,31,46,0.20)',
              transform: 'rotate(-5deg)',
            }}
          >
            <span
              aria-hidden
              className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full"
              style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border-color)' }}
            />
            <span
              className="block text-[10px] uppercase tracking-wider mb-3 ml-6"
              style={{ color: 'var(--ls-muted)', fontFamily: 'var(--font-plex-mono), monospace' }}
            >
              votre brouillon
            </span>
            <p
              className="ml-6 leading-relaxed"
              style={{ fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.85rem', color: 'var(--ls-muted)' }}
            >
              bougie vanille
              <br />
              200g, ça sent bon,
              <br />
              <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>je sais pas quoi dire</span>
              <br />
              pour la boutique...
            </p>
          </div>

          {/* Mot de transition */}
          <span
            className="hidden sm:block absolute z-10"
            style={{
              top: '110px', left: '230px',
              fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic',
              color: 'var(--ls-muted)', fontSize: '0.95rem', transform: 'rotate(-4deg)',
            }}
          >
            devient ↴
          </span>

          {/* Fiche finale */}
          <div
            className="absolute top-[150px] sm:top-[170px] left-8 sm:left-20 w-[270px] sm:w-[300px] rounded-xl p-6 z-20"
            style={{
              background: 'var(--ls-surface)',
              border: '1px solid var(--ls-border-color)',
              boxShadow: '0 22px 44px -18px rgba(43,31,46,0.24)',
              transform: 'rotate(2deg)',
            }}
          >
            <span
              aria-hidden
              className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full"
              style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border-color)' }}
            />
            <span
              className="block text-[10px] uppercase tracking-wider font-semibold mb-3 ml-6"
              style={{ color: 'var(--ls-accent)' }}
            >
              fiche publiée
            </span>
            <h3
              className="ml-6 mb-2"
              style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontWeight: 600, fontSize: '1.2rem', color: 'var(--ls-text)' }}
            >
              Bougie Vanille Bourbon — 200g
            </h3>
            <p className="ml-6 mb-4 leading-relaxed" style={{ fontSize: '0.85rem', color: 'var(--ls-muted)' }}>
              Une chaleur gourmande qui enveloppe la pièce. Cire végétale, mèche coton, jusqu&apos;à 45h de diffusion.
            </p>
            <span
              className="ml-6 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--ls-accent-soft)', color: 'var(--ls-accent)' }}
            >
              ✓ SEO optimisé
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
