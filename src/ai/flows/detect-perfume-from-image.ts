'use server';
/**
 * Flow 1: Détection du parfum original via vision IA
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  imageBase64: z.string().describe('Image en base64'),
  imageMediaType: z
    .enum(['image/jpeg', 'image/png', 'image/webp'])
    .default('image/jpeg'),
});

const OutputSchema = z.object({
  perfumeName: z.string(),
  brand: z.string(),
  confidence: z.number().min(0).max(1),
  estimatedNotes: z.object({
    top: z.array(z.string()),
    heart: z.array(z.string()),
    base: z.array(z.string()),
  }),
  estimatedPrice: z.number(),
});

export const detectPerfumeFromImage = ai.defineFlow(
  {
    name: 'detectPerfumeFromImage',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { imageBase64, imageMediaType = 'image/jpeg' } = input;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {
          text: `Tu es un expert en parfumerie. Analyse cette image de flacon de parfum et fournis:
1. Nom exact du parfum
2. Marque du parfum
3. Notes olfactives (top, heart, base)
4. Prix estimé en USD
5. Niveau de confiance (0 à 1)

Si tu ne reconnais pas le parfum, mets confidence < 0.5 et utilise "Unknown".`,
        },
        {
          media: { url: `data:${imageMediaType};base64,${imageBase64}` },
        },
      ],
      output: { schema: OutputSchema },
    });

    if (!output) {
      return {
        perfumeName: 'Unknown',
        brand: 'Unknown',
        confidence: 0,
        estimatedNotes: { top: [], heart: [], base: [] },
        estimatedPrice: 0,
      };
    }

    return output;
  }
);
