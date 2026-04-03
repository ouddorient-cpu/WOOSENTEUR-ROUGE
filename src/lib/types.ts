
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  brand: string;
  productType: 'Parfum' | 'Soin' | 'Cosmétique' | 'parfum d’intérieur' | 'Sport' | 'Habillement' | 'Maison' | 'Autres';
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  seo: SeoData;
  imageUrl?: string;
  weight?: string; // Shipping weight in grams e.g., "250"
  price?: number; // e.g., 99.99
};

export type SeoData = {
  focusKeyword: string;
  productTitle: string; // Changed from title
  shortDescription: string;
  longDescription: string;
  category: 'Homme' | 'Femme' | 'Unisexe'; // This is the Target Audience
  contenance?: string; // Product volume e.g., "100ml"
  mainNotes?: string;
  ingredients?: string;
  benefits?: string;
  price?: string;
  imageAltText?: string;
  slug?: string;
  tags?: string;
};

export type UserProfile = {
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due';
  subscriptionPlan?: 'free' | 'essential' | 'standard' | 'premium';
  wooCommerce?: {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
  role?: 'user' | 'admin' | 'superadmin';
  isUnlimited?: boolean;
  creditBalance?: number;
  claimedSessions?: string[]; // Array of claimed Stripe session IDs
  createdAt?: Timestamp;
  dailyImportCount?: number;  // Nombre de produits importés aujourd'hui
  dailyImportDate?: string;   // Date du dernier import au format YYYY-MM-DD
  isBetaTester?: boolean;     // Flag testeur beta
  promoCodesUsed?: string[];  // Codes promo déjà utilisés
  source?: string;            // Canal d'acquisition
};

// Promo code (Firestore: promoCodes/{code})
export type PromoCode = {
  code: string;
  credits: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  label?: string;
  createdAt?: Timestamp;
};

// Import history record (Firestore: users/{uid}/importHistory/{id})
export type ImportRecord = {
  id: string;
  fileName: string;
  totalProducts: number;
  successCount: number;
  failedCount: number;
  createdAt: Timestamp;
};

// Feedback utilisateur (Firestore: feedback/{id})
export type UserFeedback = {
  id?: string;
  userId: string;
  userEmail: string;
  rating: number;
  message: string;
  page?: string;
  createdAt?: Timestamp;
};

// Marketing Campaign Types
export type MarketingStyle = 'luxe' | 'clean' | 'fun' | 'science';
export type MarketingFormat = 'instagram_post' | 'instagram_story' | 'facebook_ad';
export type MarketingVariant = 'A' | 'B' | 'C';

export type MarketingTargetAudience = {
  ageRange: string;
  gender: 'Femmes' | 'Hommes' | 'Tous';
  values: string[];
};

export type MarketingBrief = {
  message: string;
  targetAudience: MarketingTargetAudience;
  style: MarketingStyle;
  cta: string;
  formats: MarketingFormat[];
};

export type MarketingGeneration = {
  id: string;
  variant: MarketingVariant;
  styleName: MarketingStyle;
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
  imageUrl: string;
  imagePrompt: string;
  format: MarketingFormat;
  dimensions: { width: number; height: number };
  generatedAt: Timestamp;
};

export type MarketingCampaign = {
  id: string;
  productId: string;
  productName: string;
  productType: Product['productType'];
  productImageUrl?: string;
  brief: MarketingBrief;
  generations: MarketingGeneration[];
  creditsUsed: number;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
