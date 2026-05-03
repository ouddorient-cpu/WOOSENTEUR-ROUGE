'use server';
/**
 * @fileOverview Flow to generate viral "dupe" comparison marketing text.
 *
 * Generates catchy comparison copy for white-label / dropshipping sellers
 * who sell affordable alternatives to luxury products.
 * Example output: "Tu aimes Sauvage d'YSL mais pas son prix 320€ ? LA SOLUTION : Salvo de Alhambra 49€"
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ── Input Schema ──────────────────────────────────────────────────────────────
const DupeTextInputSchema = z.object({
  dupeProductName: z
    .string()
    .describe('Nom du produit alternatif/dupe (ex: "Salvo de Alhambra")'),
  originalProductName: z
    .string()
    .optional()
    .describe('Nom du produit luxe de référence (ex: "Sauvage d\'YSL"). Si vide, l\'IA invente un équivalent plausible.'),
  originalPrice: z
    .string()
    .optional()
    .describe('Prix du produit luxe (ex: "320€"). Optionnel.'),
  dupePrice: z
    .string()
    .optional()
    .describe('Prix du produit dupe (ex: "49€"). Optionnel.'),
  productType: z
    .string()
    .default('Parfum')
    .describe('Type de produit (Parfum, Soin, Cosmétique, etc.)'),
});

export type DupeTextInput = z.infer<typeof DupeTextInputSchema>;

// ── Output Schema ─────────────────────────────────────────────────────────────
const DupeVariantSchema = z.object({
  id: z.enum(['A', 'B', 'C']),
  tone: z.string().describe('Ton de la variante (ex: "Viral", "Humour", "Élégant")'),
  hookTop: z
    .string()
    .describe('Texte accroche haut de l\'image (max 60 caractères). Question/douleur.'),
  solutionBottom: z
    .string()
    .describe('Texte solution bas de l\'image (max 50 caractères).'),
  priceTag: z
    .string()
    .optional()
    .describe('Prix mis en avant (ex: "49€ seulement"). Max 20 caractères.'),
  fullCaption: z
    .string()
    .describe('Légende complète pour la publication (avec emojis + hashtags).'),
});

const DupeTextOutputSchema = z.object({
  detectedOriginal: z
    .string()
    .describe('Produit luxe de référence utilisé (détecté ou suggéré par l\'IA).'),
  variants: z.array(DupeVariantSchema).length(3),
});

export type DupeTextOutput = z.infer<typeof DupeTextOutputSchema>;

// ── Genkit Prompt ─────────────────────────────────────────────────────────────
const dupeTextPrompt = ai.definePrompt({
  name: 'generateDupeTextPrompt',
  input: { schema: DupeTextInputSchema },
  output: { schema: DupeTextOutputSchema },
  prompt: `
# RÔLE
Tu es expert en contenu viral pour TikTok, Instagram Reels et Facebook (marché FR/MA/BE).
Tu maîtrises le "dupe marketing" : présenter un produit abordable comme l'alternative intelligente d'un luxe inaccessible.
Psychologie clé : le client veut LE RÉSULTAT du luxe (statut, plaisir, compliments) — pas forcément la marque. Ton job = lui montrer qu'il peut avoir ce résultat sans le prix.

# DONNÉES PRODUIT
- Produit à promouvoir : {{dupeProductName}}
- Type : {{productType}}
- Prix du dupe : {{dupePrice}}
- Produit luxe de référence : {{originalProductName}} (si vide → choisis le plus iconique du marché pour ce type)
- Prix du luxe : {{originalPrice}} (si vide → invente une fourchette réaliste et crédible)

# RÈGLES ABSOLUES
1. JAMAIS "identique", "copie exacte", "même formule" → dire "inspiré de", "la même inspiration", "même vibe", "l'alternative"
2. Toujours valoriser {{dupeProductName}} positivement — jamais le dévaloriser
3. Traiter l'objection qualité DANS la caption : les gens craignent que le dupe soit inférieur → rassure avec un argument concret (tenue, projection, avis clients)
4. Chaque hook doit ARRÊTER le scroll en 1.5 secondes — chiffre choc, émotion forte, ou pattern interrupt
5. Structure caption obligatoire : HOOK → PROBLÈME (prix inaccessible) → SOLUTION (le dupe) → PREUVE (argument qualité) → CTA

# LES 3 VARIANTES

## VARIANTE A — VIRAL / CHOC DES PRIX
Objectif : déclencher partage et "tag un ami"
hookTop (MAX 60 car.) : chiffre de prix choc + question directe
  ✅ Exemples : "Tu aimes ANGELS' SHARE (280€) mais pas son prix ?" / "Ce parfum à 35€ reçoit plus de compliments que le Dior à 300€ 👀"
  ❌ À éviter : "Découvrez notre super parfum pas cher"
solutionBottom (MAX 55 car.) : SOLUTION claire + nom + prix
  ✅ Exemples : "✅ LA SOLUTION : {{dupeProductName}} — {{dupePrice}}" / "✅ {{dupeProductName}} — Même vibe. Prix réel."
fullCaption (structure AIDA) :
  1. ATTENTION : reprend le hook (indignation du prix luxe)
  2. INTÉRÊT : décrit l'expérience concrète du dupe (sillage, tenue, compliments)
  3. DÉSIR : "Imaginez recevoir des compliments toute la journée pour {{dupePrice}}..."
  4. PREUVE : "Tenue 8h+, sillage puissant" ou "Noté 4.8/5 par nos clients"
  5. ACTION : "Lien en bio 🔗" ou "Commandez maintenant →"
  6-8 hashtags : #dupeParfum #bonplan #parfumsabordables + hashtags spécifiques produit

## VARIANTE B — HUMOUR / POV MÈME
Objectif : engagement maximal (commentaires, partages), cible 18-35 ans
hookTop (MAX 60 car.) : format POV / "Quand tu veux..." / ironie douce
  ✅ Exemples : "POV : tu veux sentir comme la personne la + stylée 🤌" / "Quand tu veux le Kilian mais que ton banquier dit non 😭💅"
solutionBottom (MAX 55 car.) : réponse punchy qui résout avec humour
  ✅ Exemples : "✨ {{dupeProductName}} — Même vibe, budget intact" / "👑 {{dupeProductName}} a tout compris"
fullCaption :
  - Ton conversationnel, abréviations naturelles
  - Question finale pour booster les commentaires : "C'est votre budget parfum ? ⬇️" / "Qui connaît déjà ? 👇"
  - 6-8 hashtags tendance : #fyp #parfumtiktok #dupealert + spécifiques

## VARIANTE C — PREMIUM / CONNAISSEURS
Objectif : valeur perçue élevée, cible 35-55 ans, angle "choix intelligent"
hookTop (MAX 60 car.) : flatte l'intelligence du client
  ✅ Exemples : "Les vrais connaisseurs ont leur secret olfactif... 🌹" / "Pourquoi payer 300€ pour la même expérience ?"
solutionBottom (MAX 55 car.) : positionnement choix raffiné
  ✅ Exemples : "⭐ {{dupeProductName}} — L'excellence à prix juste" / "🌟 Le choix des connaisseurs"
fullCaption :
  - Ton élégant, phrases courtes et directes
  - 1 argument qualité concret (composition, persistance, maison parfumeur)
  - Objection traitée : "Qualité vérifiée, aucun compromis sur la tenue"
  - CTA : "Découvrez-le maintenant →"
  - 5-7 hashtags : #parfumsluxe #fragrancecommunity #nicheperfume + spécifiques

# CONTRAINTES TECHNIQUES
- hookTop : MAX 60 caractères (espaces et emojis comptent)
- solutionBottom : MAX 55 caractères (espaces et emojis comptent)
- priceTag : MAX 20 caractères (affiché uniquement si {{dupePrice}} est fourni)

Génère maintenant les 3 variantes pour {{dupeProductName}}.
`,
});

// ── Genkit Flow ───────────────────────────────────────────────────────────────
const generateDupeTextFlow = ai.defineFlow(
  {
    name: 'generateDupeTextFlow',
    inputSchema: DupeTextInputSchema,
    outputSchema: DupeTextOutputSchema,
  },
  async (input) => {
    const geminiApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey.includes('your_api_key_here')) {
      throw new Error("La clé API Google AI n'est pas configurée.");
    }

    console.log(`🔥 Generating dupe text for "${input.dupeProductName}"...`);

    const { output } = await dupeTextPrompt(input);

    if (!output || !output.variants || output.variants.length === 0) {
      throw new Error('La génération de texte dupe a échoué — réponse vide.');
    }

    console.log(`✅ Dupe text generated. Reference: ${output.detectedOriginal}`);
    return output;
  }
);

// ── Public Export ─────────────────────────────────────────────────────────────
export async function generateDupeText(input: DupeTextInput): Promise<DupeTextOutput> {
  return generateDupeTextFlow(input);
}
