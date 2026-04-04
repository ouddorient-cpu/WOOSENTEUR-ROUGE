'use server';
/**
 * @fileOverview Flow to generate Facebook-specific marketing content.
 *
 * Covers 3 formats optimised for e-commerce on Facebook:
 *   1. Posts Standard  — 3 tone variants (Viral / Chaleureux / Premium)
 *   2. Sondage         — Question + 2 options + caption
 *   3. Offre Flash     — Urgency headline + discount copy + caption
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ─── Shared API key guard ──────────────────────────────────────────────────────
function checkApiKey() {
  const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_api_key_here')) {
    throw new Error("La clé API Google AI n'est pas configurée.");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. POSTS STANDARD (3 VARIANTES)
// ══════════════════════════════════════════════════════════════════════════════

const FacebookPostInputSchema = z.object({
  productName: z.string().describe('Nom du produit'),
  productType: z.string().default('Parfum').describe('Type de produit'),
  brand: z.string().optional().describe('Marque (optionnel)'),
  price: z.string().optional().describe('Prix affiché ex: "49€" (optionnel)'),
  keyBenefit: z.string().optional().describe('Message ou bénéfice clé à mettre en avant (optionnel)'),
});

export type FacebookPostInput = z.infer<typeof FacebookPostInputSchema>;

const FacebookPostVariantSchema = z.object({
  tone: z.enum(['Viral', 'Chaleureux', 'Premium']),
  headline: z.string().describe('Titre accrocheur affiché sur l\'image (max 55 caractères)'),
  subline: z.string().describe('Sous-titre développant l\'accroche (max 80 caractères)'),
  caption: z.string().describe('Légende complète pour le post Facebook avec emojis et 5-7 hashtags'),
});

const FacebookPostOutputSchema = z.object({
  variants: z.array(FacebookPostVariantSchema).length(3),
});

export type FacebookPostOutput = z.infer<typeof FacebookPostOutputSchema>;
export type FacebookPostVariant = z.infer<typeof FacebookPostVariantSchema>;

const facebookPostPrompt = ai.definePrompt({
  name: 'facebookPostPrompt',
  input: { schema: FacebookPostInputSchema },
  output: { schema: FacebookPostOutputSchema },
  prompt: `
Tu es expert en marketing Facebook pour e-commerçants cosmétiques français (cible 30-55 ans, acheteurs actifs).

Crée 3 posts Facebook pour : **{{productName}}** ({{productType}})
{{#if brand}}Marque : {{brand}}{{/if}}
{{#if price}}Prix : {{price}}{{/if}}
{{#if keyBenefit}}Message clé : {{keyBenefit}}{{/if}}

# RÈGLES GÉNÉRALES
- headline MAX 55 caractères (affiché en grand sur l'image)
- subline MAX 80 caractères (complète l'accroche)
- Pas de promesses médicales (réglementation UE cosmétiques)
- Pas de superlatifs absolus non vérifiables
- Ton naturel, jamais trop "pub"
- caption : 2-4 phrases + emojis pertinents + 5-7 hashtags (mix populaires + niche) + CTA "Commandez maintenant →"

# VARIANTE 1 — VIRAL (engagement maximal)
- tone: "Viral"
- headline : Question choc, stat, ou formule qui stoppe le scroll
  Exemples : "Ce parfum fait tourner les têtes. Littéralement. 👀" / "Le secret des personnes qui sentent toujours bon ☁️"
- subline : Développe le désir, crée la curiosité
- caption : Storytelling court (30-50 mots) + bénéfice surprise + CTA + hashtags dynamiques

# VARIANTE 2 — CHALEUREUX (proximité, confiance, communauté)
- tone: "Chaleureux"
- headline : Ton proche, bienveillant, "comme si on se parlait"
  Exemples : "Votre nouveau rituel bien-être est arrivé ☁️" / "Offrez-vous ce moment rien que pour vous 🌸"
- subline : Crée un lien émotionnel, sentiment de soin ou de cadeau
- caption : Angle "soin de soi", témoignage client fictif plausible (ex: "Emma, 34 ans: ..."), CTA doux + hashtags lifestyle

# VARIANTE 3 — PREMIUM (valeur perçue, aspirationnel)
- tone: "Premium"
- headline : Élégant, exclusif, justifie l'investissement
  Exemples : "L'expérience olfactive que vous méritez. 🌟" / "Raffinement sans compromis. {{productName}}."
- subline : Qualité, savoir-faire, justification du prix par l'expérience
- caption : Angle "investissement dans soi", valorisation du produit, CTA premium + hashtags luxe/qualité

Génère maintenant les 3 variantes pour {{productName}}.
`,
});

const facebookPostFlow = ai.defineFlow(
  {
    name: 'facebookPostFlow',
    inputSchema: FacebookPostInputSchema,
    outputSchema: FacebookPostOutputSchema,
  },
  async (input) => {
    checkApiKey();
    const { output } = await facebookPostPrompt(input);
    if (!output?.variants?.length) throw new Error('Génération des posts Facebook échouée.');
    return output;
  }
);

export async function generateFacebookPosts(input: FacebookPostInput): Promise<FacebookPostOutput> {
  return facebookPostFlow(input);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. SONDAGE (1 question + 2 options + caption)
// ══════════════════════════════════════════════════════════════════════════════

const FacebookPollInputSchema = z.object({
  productName: z.string().describe('Nom du produit'),
  productType: z.string().default('Parfum').describe('Type de produit'),
  brand: z.string().optional().describe('Marque (optionnel)'),
  theme: z.string().optional().describe('Thème souhaité ex: "saison", "occasion", "profil client" (optionnel)'),
});

export type FacebookPollInput = z.infer<typeof FacebookPollInputSchema>;

const FacebookPollOutputSchema = z.object({
  question: z.string().describe('Question engageante pour le sondage (max 80 caractères)'),
  optionA: z.string().describe('Option A courte et claire (max 28 caractères, sans émojis)'),
  optionB: z.string().describe('Option B courte et claire (max 28 caractères, sans émojis)'),
  caption: z.string().describe('Légende complète pour le post : intro + question + emojis + 5-6 hashtags. Finir par "Répondez ci-dessous ! 👇"'),
});

export type FacebookPollOutput = z.infer<typeof FacebookPollOutputSchema>;

const facebookPollPrompt = ai.definePrompt({
  name: 'facebookPollPrompt',
  input: { schema: FacebookPollInputSchema },
  output: { schema: FacebookPollOutputSchema },
  prompt: `
Tu es expert en engagement Facebook pour e-commerçants cosmétiques français.

Crée un sondage Facebook viral pour : **{{productName}}** ({{productType}})
{{#if brand}}Marque : {{brand}}{{/if}}
{{#if theme}}Thème souhaité : {{theme}}{{/if}}

# OBJECTIF
Maximiser les commentaires, partages et réactions. Les sondages sur Facebook génèrent 3× plus d'engagement que les posts classiques.

# RÈGLES
- question : MAX 80 caractères. Doit provoquer une OPINION PERSONNELLE (pas une question avec une "bonne" réponse)
- optionA et optionB : MAX 28 caractères chacune. Courtes, claires, sans émojis dans le texte
  (les options seront affichées dans des boutons sur l'image)
- Les deux options doivent être POSITIVES — éviter le négatif/négatif
- caption : 2-3 phrases d'introduction + la question + appel à voter + emojis + 5-6 hashtags

# TYPES DE QUESTIONS QUI MARCHENT SUR FACEBOOK
- Préférences saisonnières : "Ce parfum vous fait penser à quelle saison ?"
  A: "Été — plein soleil" / B: "Automne — soirée cosy"
- Occasions : "Quand porteriez-vous {{productName}} ?"
  A: "En journée, au bureau" / B: "Le soir, pour séduire"
- Profil : "Quel type d'acheteur êtes-vous ?"
  A: "Je tente les nouveautés" / B: "Je reste fidèle à ma marque"
- Style de vie : "Votre rituel beauté du matin, c'est..."
  A: "Rapide et efficace" / B: "Long et délicieux"

Génère maintenant pour {{productName}}.
`,
});

const facebookPollFlow = ai.defineFlow(
  {
    name: 'facebookPollFlow',
    inputSchema: FacebookPollInputSchema,
    outputSchema: FacebookPollOutputSchema,
  },
  async (input) => {
    checkApiKey();
    const { output } = await facebookPollPrompt(input);
    if (!output) throw new Error('Génération du sondage échouée.');
    return output;
  }
);

export async function generateFacebookPoll(input: FacebookPollInput): Promise<FacebookPollOutput> {
  return facebookPollFlow(input);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. OFFRE FLASH
// ══════════════════════════════════════════════════════════════════════════════

const FacebookFlashInputSchema = z.object({
  productName: z.string().describe('Nom du produit'),
  productType: z.string().default('Parfum').describe('Type de produit'),
  brand: z.string().optional().describe('Marque (optionnel)'),
  discountPercent: z.number().min(5).max(80).default(30).describe('Pourcentage de réduction'),
  originalPrice: z.string().optional().describe('Prix original ex: "89€"'),
  salePrice: z.string().optional().describe('Prix soldé ex: "62€"'),
  endDate: z.string().optional().describe('Fin de l\'offre ex: "ce soir minuit", "dimanche"'),
});

export type FacebookFlashInput = z.infer<typeof FacebookFlashInputSchema>;

const FacebookFlashOutputSchema = z.object({
  headline: z.string().describe('Titre percutant affiché sur l\'image (max 42 caractères)'),
  urgencyLine: z.string().describe('Ligne d\'urgence/scarcité (max 55 caractères)'),
  caption: z.string().describe('Légende complète avec storytelling court, CTA fort, emojis et 5-6 hashtags'),
});

export type FacebookFlashOutput = z.infer<typeof FacebookFlashOutputSchema>;

const facebookFlashPrompt = ai.definePrompt({
  name: 'facebookFlashPrompt',
  input: { schema: FacebookFlashInputSchema },
  output: { schema: FacebookFlashOutputSchema },
  prompt: `
Tu es expert en copywriting e-commerce pour les offres flash Facebook. Tu maîtrises le FOMO et la psychologie de l'urgence.

Crée le texte d'une offre flash pour : **{{productName}}** ({{productType}})
{{#if brand}}Marque : {{brand}}{{/if}}
- Réduction : -{{discountPercent}}%
{{#if originalPrice}}- Prix original : {{originalPrice}}{{/if}}
{{#if salePrice}}- Prix soldé : {{salePrice}}{{/if}}
{{#if endDate}}- Fin de l'offre : {{endDate}}{{/if}}

# RÈGLES

**headline** (MAX 42 caractères — affiché EN GRAND sur l'image) :
- Doit hurler "URGENCE" et mentionner la réduction ou le produit
- Formules qui marchent :
  - "⚡ -{{discountPercent}}% SUR {{productName}} !"
  - "FLASH : {{productName}} à -{{discountPercent}}% !"
  - "{{discountPercent}}% DE RÉDUCTION — AUJOURD'HUI SEULEMENT"

**urgencyLine** (MAX 55 caractères — affiché sous le prix) :
- Crée la scarcité ou la deadline
  - "⏰ Offre valable {{endDate}} seulement"
  - "🔥 Stock limité — commandez avant rupture"
  - "🚨 Moins de 48h pour en profiter"

**caption** :
- 1 phrase d'intro (pourquoi cette promo ?)
- Prix clair si disponibles
- CTA fort : "Profitez-en maintenant → [lien boutique]"
- Urgence répétée
- Emojis 🔥⚡⏰💸
- 5-6 hashtags : #promobeauté #flashsale #bonplan + hashtags spécifiques produit

Génère maintenant pour {{productName}}.
`,
});

const facebookFlashFlow = ai.defineFlow(
  {
    name: 'facebookFlashFlow',
    inputSchema: FacebookFlashInputSchema,
    outputSchema: FacebookFlashOutputSchema,
  },
  async (input) => {
    checkApiKey();
    const { output } = await facebookFlashPrompt(input);
    if (!output) throw new Error("Génération de l'offre flash échouée.");
    return output;
  }
);

export async function generateFacebookFlash(input: FacebookFlashInput): Promise<FacebookFlashOutput> {
  return facebookFlashFlow(input);
}
