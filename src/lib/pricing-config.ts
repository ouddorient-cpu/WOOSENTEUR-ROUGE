export type BillingCycle = 'monthly' | 'annually';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: string; annually: string };
  credits: { monthly: number; annually: number };
  priceDescription?: string;
  features: string[];
  isPopular: boolean;
  cta: string;
  paymentLink?: { monthly: string; annually: string };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour tester et générer vos premières fiches produits.',
    price: { monthly: '0€', annually: '0€' },
    credits: { monthly: 5, annually: 5 },
    priceDescription: '5 crédits offerts',
    features: [
      '<span class="font-bold">5 crédits</span> = 5 fiches produits SEO',
      'Optimisation SEO de base',
      'Export des données en CSV',
      'Accès à vie aux fiches créées',
    ],
    isPopular: false,
    cta: 'Commencer gratuitement',
  },
  {
    id: 'essential',
    name: 'Essentiel',
    description: 'Parfait pour les petites boutiques et les lancements.',
    price: { monthly: '9,99€', annually: '99,90€' },
    credits: { monthly: 50, annually: 600 },
    features: [
      '<span class="font-bold">50 fiches produits / mois</span>',
      'Score Rank Math 88%+ garanti',
      'Publication 1-clic WooCommerce',
      'Export CSV',
      'Sans engagement · résiliez quand vous voulez',
    ],
    isPopular: false,
    cta: 'Choisir Essentiel',
    paymentLink: {
      monthly: 'https://buy.stripe.com/6oU8wOciJ7da5mr4cj2VG05',
      annually: 'https://buy.stripe.com/7sY9ASciJfJGbKPfV12VG01',
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Le meilleur rapport qualité-prix pour les boutiques actives.',
    price: { monthly: '19,90€', annually: '199,00€' },
    credits: { monthly: 200, annually: 2400 },
    features: [
      '<span class="font-bold">200 fiches produits / mois</span>',
      'Import de produits en masse (CSV)',
      'Publication 1-clic WooCommerce + export Shopify',
      'Support prioritaire par email',
      'Accès aux outils Marketing IA',
    ],
    isPopular: true,
    cta: 'Choisir Standard',
    paymentLink: {
      monthly: 'https://buy.stripe.com/aFa00i6Yp8he2af4cj2VG02',
      annually: 'https://buy.stripe.com/bJe14mdmN5523ej1072VG00',
    },
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    description: 'Pour les gros volumes et les agences e-commerce.',
    price: { monthly: '70,00€', annually: '700,00€' },
    credits: { monthly: 500, annually: 6000 },
    features: [
      '<span class="font-bold">500 fiches produits / mois</span>',
      'Onboarding personnalisé avec le fondateur',
      'Accès anticipé à toutes les nouvelles fonctionnalités',
      'Support dédié — réponse en moins de 24h',
      'Multi-boutiques WooCommerce inclus',
    ],
    isPopular: false,
    cta: 'Choisir Entreprise',
    paymentLink: {
      monthly: 'https://buy.stripe.com/8x2bJ096x6963ejdMT2VG03',
      annually: 'https://buy.stripe.com/00w00ifuV1SQ3ej1072VG04',
    },
  },
];
