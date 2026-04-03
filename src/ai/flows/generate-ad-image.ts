'use server';
/**
 * @fileOverview Flow to generate advertising images using Replicate's FLUX model.
 *
 * This module handles image generation for marketing campaigns,
 * creating professional cosmetics advertising visuals.
 */

import Replicate from 'replicate';
import { MarketingStyle } from '@/lib/types';

// Style-specific prompt modifiers for cosmetics advertising
const STYLE_MODIFIERS: Record<MarketingStyle, string> = {
  luxe: 'opulent, gold accents, black velvet background, premium materials, sophisticated dramatic lighting, haute couture aesthetic, rich textures, elegant composition',
  clean: 'natural soft light, pure white background, minimal composition, organic textures, fresh and pure aesthetic, clean lines, botanical elements, serene atmosphere',
  fun: 'vibrant bold colors, playful composition, dynamic angles, energetic vibe, creative pop styling, confetti elements, joyful mood, modern trendy',
  science: 'clinical white, precision laboratory aesthetic, technical excellence, molecular structures, blue accents, professional credibility, futuristic clean design'
};

// Format dimensions for different platforms
const FORMAT_DIMENSIONS: Record<string, { width: number; height: number; aspectRatio: string }> = {
  instagram_post: { width: 1080, height: 1080, aspectRatio: '1:1' },
  instagram_story: { width: 1080, height: 1920, aspectRatio: '9:16' },
  facebook_ad: { width: 1200, height: 628, aspectRatio: '1200:628' },
};

export interface GenerateAdImageInput {
  productName: string;
  productType: string;
  style: MarketingStyle;
  format: string;
  customPrompt?: string;
}

export interface GenerateAdImageOutput {
  imageUrl: string;
  prompt: string;
  dimensions: { width: number; height: number };
}

/**
 * Builds an optimized prompt for cosmetics advertising image generation
 */
function buildImagePrompt(input: GenerateAdImageInput): string {
  const { productName, productType, style, customPrompt } = input;

  // Product-type specific base prompts
  const productPrompts: Record<string, string> = {
    'Parfum': `luxury perfume bottle of "${productName}", elegant fragrance photography, crystal clear glass, ambient reflections`,
    'Soin': `premium skincare product "${productName}", spa-like setting, clean beauty aesthetic, moisturizing texture visible`,
    'Cosmétique': `high-end cosmetic product "${productName}", professional makeup photography, vibrant colors, artistic composition`,
    'parfum d\'intérieur': `elegant home fragrance "${productName}", lifestyle interior setting, aromatic candle or diffuser, cozy ambiance`,
    'default': `premium beauty product "${productName}", professional product photography, elegant presentation`
  };

  const basePrompt = productPrompts[productType] || productPrompts['default'];
  const styleModifier = STYLE_MODIFIERS[style];

  // Combine all elements into a comprehensive prompt
  const fullPrompt = `${basePrompt}, ${styleModifier}, professional cosmetics advertising photography, 8k ultra high quality, sharp focus, perfect composition, studio lighting, commercial product shot, magazine quality, no text overlay, no watermarks${customPrompt ? `, ${customPrompt}` : ''}`;

  return fullPrompt;
}

/**
 * Generates an advertising image using Replicate's FLUX model
 */
export async function generateAdImage(input: GenerateAdImageInput): Promise<GenerateAdImageOutput> {
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiToken) {
    throw new Error("REPLICATE_API_TOKEN n'est pas configuré. Veuillez l'ajouter dans les variables d'environnement.");
  }

  const replicate = new Replicate({
    auth: replicateApiToken,
  });

  const prompt = buildImagePrompt(input);
  const formatConfig = FORMAT_DIMENSIONS[input.format] || FORMAT_DIMENSIONS['instagram_post'];

  try {
    console.log(`🎨 Generating image for "${input.productName}" with style "${input.style}"...`);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          aspect_ratio: formatConfig.aspectRatio === '1200:628' ? '16:9' : formatConfig.aspectRatio,
          output_format: "png",
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true,
        }
      }
    ) as string[];

    if (!output || output.length === 0) {
      throw new Error("La génération d'image a échoué - aucune image retournée.");
    }

    const imageUrl = output[0];
    console.log(`✅ Image generated successfully: ${imageUrl.substring(0, 50)}...`);

    return {
      imageUrl,
      prompt,
      dimensions: { width: formatConfig.width, height: formatConfig.height },
    };
  } catch (error: any) {
    console.error('Erreur lors de la génération d\'image:', error);

    if (error.message?.includes('Invalid API token')) {
      throw new Error("Token API Replicate invalide. Veuillez vérifier votre REPLICATE_API_TOKEN.");
    }

    if (error.message?.includes('rate limit')) {
      throw new Error("Limite de requêtes Replicate atteinte. Veuillez réessayer dans quelques minutes.");
    }

    throw new Error(`Erreur de génération d'image: ${error.message || 'Erreur inconnue'}`);
  }
}

/**
 * Generates multiple ad images for different style variants
 */
export async function generateAdImageVariants(
  baseInput: Omit<GenerateAdImageInput, 'style'>,
  styles: MarketingStyle[] = ['luxe', 'clean', 'fun']
): Promise<GenerateAdImageOutput[]> {
  const results = await Promise.all(
    styles.map(style => generateAdImage({ ...baseInput, style }))
  );
  return results;
}
