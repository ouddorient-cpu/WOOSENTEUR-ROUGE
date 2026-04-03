'use client';

const items = [
  '✦ 5 fiches pour tester, sans carte bancaire',
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
  <div className="border-y border-green-600 bg-green-600 overflow-hidden py-3">
    <div className="flex ticker-scroll">
      {[...items, ...items].map((item, i) => (
        <span
          key={i}
          className="whitespace-nowrap text-sm font-medium text-white px-8 flex-shrink-0"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default SocialProofTicker;
