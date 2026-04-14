'use server';
/**
 * Flow Principal: Orchestration complète du système
 * détection → clone → slogan → éléments olfactifs
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { detectPerfumeFromImage } from './detect-perfume-from-image';
import { findCloneEquivalent } from './find-clone-equivalent';
import { generateMarketingSlogan } from './generate-marketing-slogan';
import { generateOlfactoryVisuals } from './generate-olfactory-visuals';
import type { MarketingContent } from '@/types/marketing';

const InputSchema = z.object({
  uploadedImageBase64: z.string(),
  targetPlatform: z.enum(['tiktok', 'instagram', 'facebook', 'linkedin']),
  customSlogan: z.string().optional(),
});

const OutputSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  id: z.string().optional(),
  originalPerfume: z.any().optional(),
  clonePerfume: z.any().optional(),
  slogan: z.string().optional(),
  visualElements: z.array(z.any()).optional(),
  imageUrl: z.string().optional(),
  error: z.string().optional(),
});

export const generateCompleteMarketingContent = ai.defineFlow(
  {
    name: 'generateCompleteMarketingContent',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { uploadedImageBase64, targetPlatform, customSlogan } = input;
    const contentId = `mk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Détection du parfum
      const detectionResult = await detectPerfumeFromImage({
        imageBase64: uploadedImageBase64.replace(/^data:image\/\w+;base64,/, ''),
        imageMediaType: 'image/jpeg',
      });

      if (detectionResult.confidence < 0.3) {
        return {
          success: false,
          contentId,
          error: "Impossible de détecter le parfum. Assurez-vous que l'image montre un flacon clair.",
        };
      }

      // 2. Clone équivalent
      const cloneResult = await findCloneEquivalent({
        originalPerfumeName: detectionResult.perfumeName,
        originalBrand: detectionResult.brand,
        originalPrice: detectionResult.estimatedPrice,
        fragranceNotes: detectionResult.estimatedNotes,
      });

      if (!cloneResult.found || !cloneResult.clone) {
        return {
          success: false,
          contentId,
          error: 'Aucun clone équivalent trouvé pour ce parfum.',
        };
      }

      // 3. Slogan viral
      const sloganResult = await generateMarketingSlogan({
        originalName:  detectionResult.perfumeName,
        originalBrand: detectionResult.brand,
        originalPrice: detectionResult.estimatedPrice,
        cloneName:     cloneResult.clone.name,
        cloneBrand:    cloneResult.clone.brand,
        clonePrice:    cloneResult.clone.price,
        platform:      targetPlatform,
        customSlogan,
      });

      // 4. Éléments olfactifs visuels
      const visualsResult = await generateOlfactoryVisuals({
        fragranceNotes: detectionResult.estimatedNotes,
      });

      // Normalise les notes (champs optionnels Zod → requis dans le type)
      const notes = {
        top:   detectionResult.estimatedNotes.top   ?? [],
        heart: detectionResult.estimatedNotes.heart ?? [],
        base:  detectionResult.estimatedNotes.base  ?? [],
      };

      const marketingContent: MarketingContent = {
        id: contentId,
        originalPerfume: {
          id: `perf_${detectionResult.brand}_${detectionResult.perfumeName}`.toLowerCase().replace(/\s+/g, '_'),
          name: detectionResult.perfumeName,
          brand: detectionResult.brand,
          fragranceNotes: notes,
          price: detectionResult.estimatedPrice,
        },
        clonePerfume: {
          id: `clone_${contentId}`,
          name: cloneResult.clone.name,
          brand: cloneResult.clone.brand,
          fragranceNotes: notes,
          price: cloneResult.clone.price,
          originalPerfumeId: `perf_${detectionResult.brand}`,
          priceReduction: cloneResult.clone.priceReduction,
        },
        slogan: sloganResult.slogan,
        visualElements: visualsResult as import('@/types/marketing').VisualElement[],
        imageUrl: '',
        createdAt: new Date(),
        status: 'draft',
      };

      return {
        success: true,
        contentId,
        ...marketingContent,
      };
    } catch (error) {
      return {
        success: false,
        contentId,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
);
