/**
 * Scaffold pour les achats in-app (non câblé pour le MVP — les achats restent sur Stripe via le web).
 *
 * Intégration future prévue avec RevenueCat ou cordova-plugin-purchase.
 */

export interface MobilePack {
  id: string;
  label: string;
  credits: number;
  priceLabel: string;
}

export async function getAvailablePacks(): Promise<MobilePack[]> {
  throw new Error('getAvailablePacks() non implémenté — utiliser /pricing sur le web pour le MVP.');
}

export async function purchasePack(packId: string): Promise<void> {
  throw new Error('purchasePack() non implémenté — utiliser /pricing sur le web pour le MVP.');
}
