'use server';
/**
 * @fileOverview Flow to recognize a luxury perfume from an image and suggest its dupe.
 *
 * Uses Gemini vision to identify the original fragrance (brand, name, market price)
 * and maps it to a known affordable equivalent (Lattafa, Pendora, Afnan, Al Haramain…).
 * Also generates the 3-line TikTok-style "dupe marketing" text overlay.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

function checkApiKey() {
  const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_api_key_here')) {
    throw new Error("La clé API Google AI n'est pas configurée.");
  }
}

// ─── Input Schema ───────────────────────────────────────────────────────────

const RecognizeDupeInputSchema = z.object({
  originalImageDataUri: z
    .string()
    .describe('Image du parfum original en base64 data URI (ex: data:image/jpeg;base64,...)'),
  dupeImageDataUri: z
    .string()
    .optional()
    .describe('Image du parfum équivalent en base64 (optionnel)'),
  manualOriginalName: z
    .string()
    .optional()
    .describe('Nom du parfum original saisi manuellement (optionnel)'),
  manualDupeName: z
    .string()
    .optional()
    .describe('Nom de l\'équivalent saisi manuellement (optionnel)'),
});

export type RecognizeDupeInput = z.infer<typeof RecognizeDupeInputSchema>;

// ─── Output Schema ──────────────────────────────────────────────────────────

const RecognizeDupeOutputSchema = z.object({
  originalName: z.string().describe('Nom du parfum original identifié (ex: Tuxedo)'),
  originalBrand: z.string().describe('Marque du parfum original (ex: Yves Saint Laurent)'),
  originalBrandShort: z.string().describe('Abréviation courte de la marque (ex: YSL, TF, Dior)'),
  estimatedPrice: z.string().describe('Prix estimé du parfum original en euros (ex: 300)'),
  dupeName: z.string().describe('Nom du parfum équivalent abordable (ex: Tudor)'),
  dupeBrand: z.string().describe('Marque de l\'équivalent (ex: Pendora Scents)'),
  dupePrice: z.string().optional().describe('Prix indicatif de l\'équivalent (ex: 49)'),
  line1: z.string().describe('Ligne 1 du texte overlay (ex: Tu aimes Tuxedo de YSL ?)'),
  line2: z.string().describe('Ligne 2 du texte overlay (ex: Mais pas son prix +300€ ?)'),
  line3: z.string().describe('Ligne 3 du texte overlay (ex: J\'ai la solution pour TOI)'),
  hashtags: z.string().describe('5-7 hashtags pertinents pour TikTok/Instagram'),
  confidence: z.number().min(0).max(100).describe('Score de confiance 0-100'),
});

export type RecognizeDupeOutput = z.infer<typeof RecognizeDupeOutputSchema>;

// ─── Flow ───────────────────────────────────────────────────────────────────

export async function recognizeDupePerfume(
  input: RecognizeDupeInput
): Promise<RecognizeDupeOutput> {
  checkApiKey();

  const manualContext = [
    input.manualOriginalName ? `Parfum original indiqué par l'utilisateur : ${input.manualOriginalName}` : '',
    input.manualDupeName ? `Équivalent indiqué par l'utilisateur : ${input.manualDupeName}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const hasDupeImage = !!input.dupeImageDataUri;

  const promptText = `Tu es un expert en parfumerie de luxe et en marketing e-commerce spécialisé dans les dupes et alternatives abordables.

${manualContext ? `Contexte fourni par l'utilisateur :\n${manualContext}\n` : ''}
MISSION :
1. Analyse l'image du parfum original (à gauche ou seule).
${hasDupeImage ? "2. Analyse l'image du parfum équivalent/dupe (à droite)." : "2. Propose un équivalent abordable connu de ta base de connaissances (Lattafa, Pendora Scents, Afnan, Al Haramain, Khadlaj, Armaf)."}
3. Génère le texte marketing "dupe" au format TikTok/Instagram en 3 lignes.

RÈGLES IMPORTANTES :
- Identifie clairement le parfum original : marque (ex: Tom Ford, Chanel, YSL, Dior, Creed) et nom.
- Pour les dupes : propose des équivalents RÉELS connus sur le marché.
- Les 3 lignes doivent être percutantes, en français, avec le ton @dubainegoce TikTok.
- Format ligne 1 : "Tu aimes [Nom] de [MarqueCourte] ?"
- Format ligne 2 : "Mais pas son prix +[Prix]€ ?"
- Format ligne 3 : "J'ai la solution pour TOI" (toujours cette formule)
- Hashtags : mix français/anglais, niché parfum dupe.

Réponds en JSON valide uniquement avec les champs demandés.`;

  const promptParts: Array<{ text: string } | { media: { url: string } }> = [
    { text: promptText },
    { media: { url: input.originalImageDataUri } },
  ];

  if (hasDupeImage) {
    promptParts.push({ media: { url: input.dupeImageDataUri! } });
  }

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: promptParts,
    output: { schema: RecognizeDupeOutputSchema },
    config: { temperature: 0.4 },
  });

  if (!output) {
    throw new Error("L'IA n'a pas pu analyser l'image. Réessaie avec une image plus nette.");
  }

  return output;
}
