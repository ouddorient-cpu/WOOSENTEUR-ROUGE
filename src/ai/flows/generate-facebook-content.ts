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
# RÔLE
Tu es expert en marketing Facebook organique pour e-commerçants (cosmétiques, parfums, beauté) — marché FR/MA/BE.
Cible : 30-55 ans, acheteurs actifs sur Facebook. Psychologie : communauté, confiance, bouche-à-oreille, emotion > logique.
Principe clé (skill social-content) : "Lead with their world, not yours." Commence TOUJOURS par la réalité du client, pas par le produit.

# DONNÉES PRODUIT
- Produit : **{{productName}}** ({{productType}})
{{#if brand}}- Marque : {{brand}}{{/if}}
{{#if price}}- Prix : {{price}}{{/if}}
{{#if keyBenefit}}- Bénéfice clé : {{keyBenefit}}{{/if}}

# RÈGLES ABSOLUES
1. headline MAX 55 caractères — doit ARRÊTER le scroll (chiffre, émotion, question, promesse concrète)
2. subline MAX 80 caractères — développe sans répéter le headline
3. Zéro promesses médicales (réglementation UE)
4. Zéro superlatifs vides ("le meilleur", "incroyable") — remplacer par des bénéfices spécifiques
5. Ton NATUREL — les posts qui ressemblent à des pubs sont ignorés sur Facebook
6. Chaque caption doit contenir un déclencheur de commentaires : question, appel à témoignage, ou choix à faire
7. Structure caption : Ouverture (leur monde) → Transition (le produit) → Bénéfice concret → Preuve/confiance → CTA clair

# VARIANTE 1 — VIRAL / ARRÊT DU SCROLL
Objectif : partages, tags, réactions
- tone: "Viral"
- headline : Chiffre choc, question surprenante, ou résultat inattendu
  ✅ Exemples : "Ce {{productType}} fait tourner les têtes depuis 3 semaines 👀" / "Pourquoi mes voisins me demandent ce que je porte ?" / "Le produit dont tout le monde parle dans notre communauté"
  ❌ Éviter : "Découvrez notre nouveau produit !"
- subline : Crée la curiosité, donne envie de lire la suite
- caption (structure) :
  • Phrase 1 : situation du client avant le produit (leur monde, leur frustration ou désir)
  • Phrase 2-3 : comment {{productName}} change la donne — bénéfice CONCRET et sensoriel
  • Phrase 4 : chiffre ou preuve ("Plus de 200 commandes ce mois", "Noté 4.9/5")
  • Question finale pour les commentaires : "Et vous, vous avez déjà essayé ? ⬇️" / "Qui partage ça à quelqu'un qui adore les parfums ? 👇"
  • CTA : "Commandez maintenant → [lien]"
  • 5-7 hashtags : mix populaires (#parfum #beauté) + niche (#dubaiscents #parfumsoriental) + communauté (#parfumlovers)

# VARIANTE 2 — CHALEUREUX / COMMUNAUTÉ
Objectif : confiance, fidélisation, partage dans les groupes
- tone: "Chaleureux"
- headline : Ton proche, bienveillant, comme un ami qui recommande
  ✅ Exemples : "Le rituel que j'aurais voulu découvrir plus tôt 🌸" / "Pour ceux qui méritent un moment rien que pour eux" / "Notre coup de cœur du moment — on ne garde pas ça pour nous"
- subline : Lien émotionnel — cadeau, rituel, soin de soi, moment de pause
- caption :
  • Commence par "Vous" ou "On" — pas "Notre produit" ou "Découvrez"
  • Témoignage client court et plausible intégré naturellement : "Fatima nous a écrit : 'Je ne change plus...' "
  • Angle "rituel" ou "cadeau idéal" selon le contexte
  • Question de fin pour engagement : "C'est pour vous ou pour offrir ? Dites-nous en commentaire 💬"
  • CTA doux : "Disponible maintenant → [lien boutique]"
  • 5-6 hashtags lifestyle : #cadeaubeauté #rituelbeauté #selfcare + spécifiques produit

# VARIANTE 3 — PREMIUM / VALEUR PERÇUE
Objectif : justifier le prix, convertir les hésitants, cible 40-55 ans
- tone: "Premium"
- headline : Élégant, affirmatif, justifie l'investissement sans le dire
  ✅ Exemples : "Certaines choses méritent qu'on prenne le temps. {{productName}} en fait partie." / "L'expérience que vous cherchiez depuis longtemps." / "Quand le rapport qualité-prix devient évident."
- subline : Qualité, savoir-faire, résultat — jamais le prix en premier
- caption :
  • Angle "investissement dans soi, pas une dépense"
  • 1 argument qualité SPÉCIFIQUE et vérifiable (tenue, composition, origine)
  • Traite l'objection prix implicitement : "Pour le prix d'un restaurant, vous profitez de..."
  • CTA confiant : "Faites-vous plaisir → [lien]"
  • 5-6 hashtags qualité : #luxeabordable #beauténaturelle #qualité + spécifiques

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
