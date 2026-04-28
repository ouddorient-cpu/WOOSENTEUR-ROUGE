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

export interface CreditPack {
  id: string;
  name: string;
  description: string;
  price: string;
  credits: number;
  validityMonths: number;
  priceId: string;
  features: string[];
  isPopular: boolean;
  cta: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack-s',
    name: 'Pack S',
    description: 'Idéal pour un lancement ou une petite collection.',
    price: '4,90€',
    credits: 10,
    validityMonths: 6,
    priceId: 'price_1TNiJkAIq9NC7F5alpgtfD6v',
    features: [
      '<span class="font-bold">10 fiches produit</span>',
      'Valables 6 mois',
      'Export CSV inclus',
      'Paiement unique · sans abonnement',
    ],
    isPopular: false,
    cta: 'Acheter le Pack S',
  },
  {
    id: 'pack-m',
    name: 'Pack M',
    description: 'Pour une collection complète ou plusieurs produits.',
    price: '9,90€',
    credits: 30,
    validityMonths: 12,
    priceId: 'price_1TNiLyAIq9NC7F5aNEol4nbe',
    features: [
      '<span class="font-bold">30 fiches produit</span>',
      'Valables 12 mois',
      'Export CSV inclus',
      'Paiement unique · sans abonnement',
    ],
    isPopular: true,
    cta: 'Acheter le Pack M',
  },
];

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
    price: { monthly: '9,99€', annually: '99,90€' },
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
    id: 'premium',
    name: 'Premium',
    description: 'Pour les gros volumes et les agences e-commerce.',
    price: { monthly: '19,99€', annually: '199,90€' },
    credits: { monthly: 999999, annually: 999999 },
    features: [
      '<span class="font-bold">Crédits illimités</span>',
      'Onboarding personnalisé avec le fondateur',
      'Accès anticipé à toutes les nouvelles fonctionnalités',
      'Support dédié — réponse en moins de 24h',
      'Multi-boutiques WooCommerce inclus',
    ],
    isPopular: false,
    cta: 'Choisir Premium',
    paymentLink: {
      monthly: 'https://buy.stripe.com/8x2bJ096x6963ejdMT2VG03',
      annually: 'https://buy.stripe.com/00w00ifuV1SQ3ej1072VG04',
    },
  },
];
