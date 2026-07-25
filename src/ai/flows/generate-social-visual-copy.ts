'use server';
/**
 * @fileOverview Generates a short slogan and CTA for the "Visuel réseaux sociaux" module.
 * Text only — the product image itself is composed separately (see src/lib/social-visuals/compose-visual.ts)
 * so the AI never touches or regenerates the product photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  category: z.string().optional().describe('Catégorie probable du produit, ex: Parfum, Cosmétique'),
  dominantColorDescription: z.string().optional().describe('Description sommaire des couleurs dominantes de la photo produit'),
});

export type GenerateSocialVisualCopyInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  slogan: z.string().describe('Slogan commercial de 4 à 8 mots, sans prix ni réduction inventés'),
  cta: z.string().describe('Appel à l\'action de 1 à 4 mots'),
});

export type GenerateSocialVisualCopyOutput = z.infer<typeof OutputSchema>;

const PROMPT = `Tu es un expert en copywriting publicitaire pour les réseaux sociaux (marché français).

Produit : {{category}}
{{colorHint}}

Génère un slogan court et un CTA pour un visuel publicitaire.

Règles strictes :
- Slogan : 4 à 8 mots, commercial, naturel, lisible, sans prix, sans réduction inventée, sans promesse médicale, sans superlatif trompeur.
- CTA : 1 à 4 mots, parmi le registre "Découvrir", "Commander maintenant", "Voir le produit", "Disponible maintenant", "J'en profite" ou une variante courte similaire.

Réponds uniquement au format demandé.`;

export async function generateSocialVisualCopy(input: GenerateSocialVisualCopyInput): Promise<GenerateSocialVisualCopyOutput> {
  const prompt = PROMPT
    .replace('{{category}}', input.category || 'Produit')
    .replace('{{colorHint}}', input.dominantColorDescription ? `Ambiance visuelle : ${input.dominantColorDescription}` : '');

  const { output } = await ai.generate({
    prompt,
    output: { schema: OutputSchema },
    config: { temperature: 0.7 },
  });

  if (!output) {
    throw new Error("La génération du texte publicitaire a échoué.");
  }

  return output;
}
