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
    price: { monthly: '5,99€', annually: '59,90€' },
    credits: { monthly: 20, annually: 240 },
    features: [
      '<span class="font-bold">20 crédits / mois</span> = 20 fiches produits',
      'Score Rank Math 88%+ garanti',
      'Publication 1-clic WooCommerce',
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
    description: 'Le meilleur rapport qualité-prix pour les actifs.',
    price: { monthly: '9,99€', annually: '99,90€' },
    credits: { monthly: 60, annually: 720 },
    features: [
      '<span class="font-bold">60 crédits / mois</span> = 60 fiches produits',
      'Import de produits en masse (CSV)',
      'Publication 1-clic WooCommerce + export Shopify',
      'Support prioritaire par email',
    ],
    isPopular: true,
    cta: 'Choisir Standard',
    paymentLink: {
      monthly: 'https://buy.stripe.com/aFa00i6Yp8he2af4cj2VG02',
      annually: 'https://buy.stripe.com/bJe14mdmN5523ej1072VG00',
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Pour une productivité maximale et de gros volumes.',
    price: { monthly: '24,90€', annually: '250,00€' },
    credits: { monthly: 300, annually: 3600 },
    features: [
      '<span class="font-bold">300 crédits / mois</span> = 300 fiches produits',
      'Onboarding personnalisé avec le fondateur',
      'Accès anticipé à toutes les nouvelles fonctionnalités',
      'Support dédié — réponse en moins de 24h',
    ],
    isPopular: false,
    cta: 'Choisir Premium',
    paymentLink: {
      monthly: 'https://buy.stripe.com/8x2bJ096x6963ejdMT2VG03',
      annually: 'https://buy.stripe.com/00w00ifuV1SQ3ej1072VG04',
    },
  },
];
