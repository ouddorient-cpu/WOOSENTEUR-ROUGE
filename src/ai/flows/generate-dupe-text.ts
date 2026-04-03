'use server';
/**
 * @fileOverview Flow to generate viral "dupe" comparison marketing text.
 *
 * Generates catchy comparison copy for white-label / dropshipping sellers
 * who sell affordable alternatives to luxury products.
 * Example output: "Tu aimes Sauvage d'YSL mais pas son prix 320€ ? LA SOLUTION : Salvo de Alhambra 49€"
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
# IDENTITÉ
Tu es un expert en marketing viral pour les réseaux sociaux (TikTok, Instagram, Snapchat).
Tu maîtrises le format "dupe marketing" — présenter un produit abordable comme alternative d'un produit de luxe.
Ce format est extrêmement populaire : il génère de l'engagement massif car il touche à la fois au désir (le luxe) et à la rationalité (le prix).

# PRODUIT CIBLE
- Produit à promouvoir: {{dupeProductName}}
- Type: {{productType}}
- Prix du dupe: {{dupePrice}} (optionnel — affiche uniquement si fourni)
- Produit de référence luxe: {{originalProductName}} (laisse vide si absent — invente alors le plus connu du marché pour ce type de produit)
- Prix du luxe: {{originalPrice}} (optionnel — invente une fourchette réaliste si absent)

# RÈGLES IMPORTANTES
1. NE JAMAIS écrire que le produit est "identique" ou "copie exacte" — utiliser : "l'alternative", "la version accessible", "la même inspiration", "inspiré de"
2. Toujours rester positif sur le produit promu — valoriser son rapport qualité/prix
3. Le hookTop doit déclencher une réaction émotionnelle IMMÉDIATE (surprise, identification, humour)
4. Le solutionBottom doit être court, fort, mémorable
5. La légende complète doit inclure des emojis pertinents et 5-8 hashtags

# FORMAT DE SORTIE

**detectedOriginal**: le produit luxe utilisé comme référence

**3 VARIANTES** :

### Variante A — Viral / Direct
- hookTop: Question directe avec le nom du luxe et le prix choc
  Exemples:
  - "Tu aimes SAUVAGE d'YSL mais pas son prix 320€ ?"
  - "Le parfum qui fait croire que tu dépenses 400€ 👀"
- solutionBottom: LA SOLUTION + nom produit + prix si dispo
  Exemples:
  - "✅ LA SOLUTION : SALVO DE ALHAMBRA"
  - "✅ SALVO DE ALHAMBRA — 49€ seulement"
- fullCaption: légende complète avec storytelling, emojis, hashtags

### Variante B — Humour / Meme
- hookTop: Format "POV" ou "Quand tu veux..." ou comparaison amusante
  Exemples:
  - "POV : tu veux sentir comme la personne la plus stylée de la pièce 🤌"
  - "Quand tu veux le parfum du riche mais le budget du sage 😭💅"
- solutionBottom: réponse humoristique mais valorisante
  Exemples:
  - "✨ SALVO DE ALHAMBRA a tout compris"
  - "👑 Entre SALVO DE ALHAMBRA — Même vibe, prix différent"
- fullCaption: légende fun, jeune, avec mots tendance (vibe, main character, slay, etc.)

### Variante C — Élégant / Premium
- hookTop: Angle "l'alternative intelligente" sans mentionner le concurrent directement
  Exemples:
  - "Pourquoi dépenser 400€ pour la même expérience olfactive ?"
  - "Les connaisseurs ont leur secret. Le voici."
- solutionBottom: positionner le produit comme choix des experts
  Exemples:
  - "⭐ SALVO DE ALHAMBRA — Le choix des connaisseurs"
  - "🌟 SALVO DE ALHAMBRA — L'excellence accessible"
- fullCaption: légende sophistiquée, ton expert, hashtags premium

# CONTRAINTES FORMAT TEXTE SUR IMAGE
- hookTop: MAX 60 caractères (sera affiché en GRAND sur l'image)
- solutionBottom: MAX 55 caractères (sera affiché en GRAND sur l'image)
- priceTag: MAX 20 caractères (optionnel, affiché si prix dupe fourni)

Génère les 3 variantes maintenant pour {{dupeProductName}}.
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
