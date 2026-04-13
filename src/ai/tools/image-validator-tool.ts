
'use server';
/**
 * @fileOverview A Genkit tool to validate product images using AI.
 *
 * This tool uses the Gemini model to analyze a product image and ensure it
 * adheres to professional e-commerce standards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input Schema
const ValidateImageInputSchema = z.object({
  imageDataUri: z.string().describe("The product image as a Base64 data URI."),
});

// 2. Define Output Schema
const ValidateImageOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the image meets the e-commerce criteria.'),
  confidenceScore: z.number().describe('A confidence score (0-100) on how well the image fits the professional aesthetic.'),
  feedback: z.string().describe('Constructive feedback for improving the image if it is not valid.'),
});

export type ValidateImageOutput = z.infer<typeof ValidateImageOutputSchema>;

// 3. Define the Genkit Tool
export const validateProductImage = ai.defineTool(
  {
    name: 'validateProductImage',
    description: 'Analyzes a product image to ensure it meets professional e-commerce standards (clean, well-lit, professional background).',
    inputSchema: ValidateImageInputSchema,
    outputSchema: ValidateImageOutputSchema,
  },
  async ({ imageDataUri }) => {
    try {
      const prompt = `
        You are an expert art director for a major e-commerce marketplace.
        Your task is to evaluate a product image to ensure it is suitable for online sales based on the following criteria: clear, well-lit, clean background, and professional.

        Analyze the provided image. Your evaluation should be helpful and practical, not overly strict.

        - If the image is suitable for e-commerce (clear photo, good lighting, professional), return a confidence score between 60 and 100, set isValid to true, and provide positive feedback in French.
        - If the image has major flaws (blurry, very bad lighting, cluttered background, unprofessional), return a confidence score between 0 and 59, set isValid to false, and provide a concise, actionable suggestion for improvement in French.
        
        The goal is to maintain a high-quality, trustworthy appearance across all product categories.

        Example of feedback (if invalid): "L'image est un peu floue. Essayez de refaire la photo avec une meilleure mise au point et un fond plus neutre."
        Example of feedback (if valid): "Bonne composition et éclairage. L'image est prête pour la publication."
      `;

      const { output } = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: [
              { text: prompt },
              { media: { url: imageDataUri } },
          ],
          output: { schema: ValidateImageOutputSchema },
      });
      
      if (!output) {
        throw new Error('Image validation failed: The AI model did not return a valid response.');
      }

      return output;
    } catch (error: any) {
        if (error.message && (error.message.includes('API key expired') || error.message.includes('API key not valid'))) {
            throw new Error("Votre clé API pour le service IA a expiré ou est invalide. Veuillez la renouveler dans Google AI Studio et redémarrer le serveur de développement.");
        }
        // Re-throw other errors to be handled by the client
        throw error;
    }
  }
);
