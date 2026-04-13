'use client';

const items = [
  '⚡ 5 fiches pour tester, sans carte bancaire',
  '✓ Titre · Méta · Slug · Alt image · JSON-LD — dans chaque fiche',
  '✦ Contenu original à chaque génération',
  '✓ Compatible WooCommerce & Shopify',
  '✦ Vocabulaire adapté à ta niche produit',
  '✓ Tu relis, tu ajustes, tu publies',
  '✦ Données structurées incluses d\'office',
  '✓ Pas de formation SEO nécessaire',
  '✦ Export CSV ou publication directe',
  '✓ Fiche complète en quelques minutes',
];

const SocialProofTicker = () => (
  <div className="relative border-y border-white/[0.06] bg-white/[0.02] overflow-hidden py-3.5 ticker-mask z-10">
    <div className="flex ticker-scroll">
      {[...items, ...items].map((item, i) => (
        <span
          key={i}
          className="whitespace-nowrap text-sm font-medium text-white/55 px-8 flex-shrink-0"
        >
          <span className="text-violet-400 mr-1">{item.slice(0, 1)}</span>
          {item.slice(1)}
        </span>
      ))}
    </div>
  </div>
);

export default SocialProofTicker;