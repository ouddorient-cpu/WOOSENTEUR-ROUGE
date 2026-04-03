'use server';
/**
 * @fileOverview Flow to analyze product images and extract marketing-relevant information.
 *
 * Uses Genkit with Gemini to analyze uploaded product images and
 * extract product details for pre-filling the marketing campaign form.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input Schema
const AnalyzeProductImageInputSchema = z.object({
  imageDataUri: z.string().describe("The product image as a Base64 data URI."),
});

// Output Schema - extracted product info for marketing form
const AnalyzeProductImageOutputSchema = z.object({
  productName: z.string().describe("Suggested name for the product based on image analysis."),
  productType: z.enum(['Parfum', 'Soin', 'Cosmétique', 'parfum d\'intérieur']).describe("The type of cosmetic product."),
  brand: z.string().optional().describe("Brand name if visible on the product."),
  suggestedMessage: z.string().describe("A suggested marketing message for the product in French."),
  suggestedStyle: z.enum(['luxe', 'clean', 'fun', 'science']).describe("Recommended visual style based on product appearance."),
  suggestedGender: z.enum(['Femmes', 'Hommes', 'Tous']).describe("Suggested target gender based on product design."),
  suggestedValues: z.array(z.string()).describe("Suggested audience values that match the product."),
  keyFeatures: z.array(z.string()).describe("Key visual features or selling points detected."),
  colorPalette: z.array(z.string()).describe("Main colors detected in the product/packaging."),
  confidence: z.number().describe("Confidence score (0-100) for the analysis accuracy."),
});

export type AnalyzeProductImageInput = z.infer<typeof AnalyzeProductImageInputSchema>;
export type AnalyzeProductImageOutput = z.infer<typeof AnalyzeProductImageOutputSchema>;

/**
 * Analyzes a product image and extracts marketing-relevant information
 */
export async function analyzeProductImage(input: AnalyzeProductImageInput): Promise<AnalyzeProductImageOutput> {
  const prompt = `
Tu es un expert en marketing cosmétique et en analyse visuelle de produits de beauté.
Analyse cette image de produit cosmétique et extrais les informations suivantes pour créer une campagne publicitaire.

Réponds en JSON avec les champs suivants:
- productName: Nom suggéré pour le produit (en français, professionnel)
- productType: Type de produit parmi: "Parfum", "Soin", "Cosmétique", "parfum d'intérieur"
- brand: Marque si visible sur le produit (optionnel)
- suggestedMessage: Un message marketing accrocheur en français (max 150 caractères) basé sur l'apparence du produit
- suggestedStyle: Style visuel recommandé parmi: "luxe" (doré, noir, premium), "clean" (naturel, pur), "fun" (coloré, énergique), "science" (technique, laboratoire)
- suggestedGender: Cible genre parmi: "Femmes", "Hommes", "Tous" - basé sur le design du produit
- suggestedValues: Tableau de valeurs pertinentes parmi: ["Naturalité", "Efficacité", "Luxe", "Innovation", "Éthique", "Accessibilité", "Durabilité", "Bien-être"]
- keyFeatures: Tableau de 2-4 caractéristiques visuelles clés du produit
- colorPalette: Tableau des 3-5 couleurs principales détectées (en français)
- confidence: Score de confiance 0-100 pour l'analyse

Analyse attentivement:
1. Le packaging et son design (couleurs, matériaux, forme)
2. Les éléments textuels visibles (marque, nom produit)
3. L'ambiance générale (luxe, naturel, moderne, etc.)
4. La cible probable du produit

Sois précis et professionnel dans tes suggestions.
`;

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { text: prompt },
        { media: { url: input.imageDataUri } },
      ],
      output: { schema: AnalyzeProductImageOutputSchema },
    });

    if (!output) {
      throw new Error('L\'analyse d\'image a échoué: le modèle n\'a pas retourné de réponse valide.');
    }

    return output;
  } catch (error: any) {
    if (error.message && (error.message.includes('API key expired') || error.message.includes('API key not valid'))) {
      throw new Error("Clé API expirée ou invalide. Veuillez la renouveler dans Google AI Studio.");
    }
    throw new Error(`Erreur lors de l'analyse d'image: ${error.message || 'Erreur inconnue'}`);
  }
}
