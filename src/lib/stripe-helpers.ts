
// This file can contain helper functions related to Stripe,
// for example, mapping price IDs to product features.

// Price ID to Credits mapping
// Ensure these Price IDs match EXACTLY with your Stripe products
export const priceToCreditsMap: Record<string, number> = {
  // --- PRODUCTION PRICE IDs ---
  // Essentiel Mensuel: 5,99€ -> 20 crédits
  'price_1PhA7iAIq9NC7F5az3f9l7n5': 20,
  // Essentiel Annuel: 59,90€ -> 240 crédits
  'price_1PhA8EAIq9NC7F5auydr2Y4J': 240,
  // Standard Mensuel: 9,99€ -> 60 crédits
  'price_1PhA8gAIq9NC7F5a4G3z2Uqg': 60,
  // Standard Annuel: 99,90€ -> 720 crédits
  'price_1PhA9DAIq9NC7F5aHn3L6qY3': 720,
  // Premium Mensuel: 24,90€ -> 300 crédits
  'price_1PhA9XAIq9NC7F5amY1g1b1g': 300,
  // Premium Annuel: 250,00€ -> 3600 crédits
  'price_1PhAA6AIq9NC7F5aV1m0f5hE': 3600,
};

// Add other Stripe-related helper functions here
