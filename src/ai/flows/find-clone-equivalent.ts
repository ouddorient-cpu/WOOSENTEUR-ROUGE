'use server';
/**
 * Flow 2: Trouver le clone équivalent moins cher
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ClonePerfume } from '@/types/marketing';

const PERFUME_CLONES_DB: Record<string, ClonePerfume> = {
  'tom-ford-black-orchid': {
    id: 'lattafa-asad',
    name: 'Lattafa Asad',
    brand: 'Lattafa',
    fragranceNotes: {
      top: ['Bergamote', 'Agrumes épicés'],
      heart: ['Orchidée noire', 'Rose', 'Ambroxan'],
      base: ['Vétiver', 'Cèdre', 'Musc'],
    },
    price: 35,
    originalPerfumeId: 'tom-ford-black-orchid',
    priceReduction: 82,
  },
  'dior-sauvage': {
    id: 'lattafa-silver',
    name: 'Lattafa Silver',
    brand: 'Lattafa',
    fragranceNotes: {
      top: ['Ambroxan', 'Épices'],
      heart: ['Ambrox', 'Cèdre'],
      base: ['Bois de Cèdre', 'Ambre'],
    },
    price: 25,
    originalPerfumeId: 'dior-sauvage',
    priceReduction: 87,
  },
  'creed-aventus': {
    id: 'armaf-club-de-nuit',
    name: 'Armaf Club de Nuit Intense',
    brand: 'Armaf',
    fragranceNotes: {
      top: ['Pêche', 'Bergamote', 'Cardamome'],
      heart: ['Rose bulgare', 'Ambrox'],
      base: ['Ambre', 'Musc blanc', 'Cèdre'],
    },
    price: 40,
    originalPerfumeId: 'creed-aventus',
    priceReduction: 95,
  },
};

const InputSchema = z.object({
  originalPerfumeName: z.string(),
  originalBrand: z.string(),
  originalPrice: z.number().optional(),
  fragranceNotes: z
    .object({
      top: z.array(z.string()),
      heart: z.array(z.string()),
      base: z.array(z.string()),
    })
    .optional(),
});

const CloneResultSchema = z.object({
  found: z.boolean(),
  clone: z
    .object({
      name: z.string(),
      brand: z.string(),
      price: z.number(),
      priceReduction: z.number(),
    })
    .nullable(),
  matchScore: z.number().min(0).max(1),
});

const AISuggestionSchema = z.object({
  suggestedClone: z.string(),
  suggestedBrand: z.string(),
  estimatedPrice: z.number(),
  matchScore: z.number(),
});

export const findCloneEquivalent = ai.defineFlow(
  {
    name: 'findCloneEquivalent',
    inputSchema: InputSchema,
    outputSchema: CloneResultSchema,
  },
  async (input) => {
    const { originalPerfumeName, originalBrand, originalPrice = 200 } = input;

    const searchKey = `${originalBrand}-${originalPerfumeName}`
      .toLowerCase()
      .replace(/\s+/g, '-');

    const clone = PERFUME_CLONES_DB[searchKey];

    if (clone) {
      return {
        found: true,
        clone: {
          name: clone.name,
          brand: clone.brand,
          price: clone.price,
          priceReduction: clone.priceReduction,
        },
        matchScore: 0.95,
      };
    }

    // Fallback IA
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Suggère un clone parfum équivalent et moins cher pour "${originalPerfumeName}" de "${originalBrand}" (prix ~${originalPrice}$).`,
      output: { schema: AISuggestionSchema },
    });

    if (!output) {
      return { found: false, clone: null, matchScore: 0 };
    }

    return {
      found: true,
      clone: {
        name: output.suggestedClone,
        brand: output.suggestedBrand,
        price: output.estimatedPrice,
        priceReduction: Math.round(
          ((originalPrice - output.estimatedPrice) / originalPrice) * 100
        ),
      },
      matchScore: output.matchScore,
    };
  }
);
