/**
 * Flow 1: Détection du parfum original via vision IA
 * Utilise Google Genkit + Gemini Vision API
 */

import { defineFlow, runFlow } from "genkit";
import { gemini15Flash } from "@genkit-ai/google-genai";

export const detectPerfumeFromImage = defineFlow(
  {
    name: "detectPerfumeFromImage",
    description:
      "Détecte le nom et les notes olfactives d'un parfum à partir d'une image",
    inputSchema: {
      type: "object",
      properties: {
        imageBase64: { type: "string", description: "Image en base64" },
        imageMediaType: {
          type: "string",
          enum: ["image/jpeg", "image/png", "image/webp"],
          description: "Type MIME de l'image",
        },
      },
      required: ["imageBase64"],
    },
    outputSchema: {
      type: "object",
      properties: {
        perfumeName: { type: "string" },
        brand: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        estimatedNotes: {
          type: "object",
          properties: {
            top: { type: "array", items: { type: "string" } },
            heart: { type: "array", items: { type: "string" } },
            base: { type: "array", items: { type: "string" } },
          },
        },
        estimatedPrice: { type: "number" },
      },
    },
  },
  async (input: any) => {
    const { imageBase64, imageMediaType = "image/jpeg" }: { imageBase64: string; imageMediaType?: string } = input;

    const response = await gemini15Flash.generate({
      messages: [
        {
          content: [
            {
              type: "image",
              image: {
                url: `data:${imageMediaType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: `Tu es un expert en parfumerie. Analyse cette image de flacon de parfum et fournis:
1. Nom exact du parfum
2. Marque du parfum
3. Notes olfactives (top, heart, base)
4. Prix estimé en USD

Réponds en JSON strict avec les clés: perfumeName, brand, estimatedNotes, estimatedPrice, confidence (0-1).
Si tu ne reconnais pas le parfum, mets confidence < 0.5 et utilise "Unknown" pour le nom.`,
            },
          ],
        },
      ],
    });

    // Parse la réponse
    const text = response.output?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        perfumeName: "Unknown",
        brand: "Unknown",
        confidence: 0,
        estimatedNotes: { top: [], heart: [], base: [] },
        estimatedPrice: 0,
      };
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        perfumeName: "Unknown",
        brand: "Unknown",
        confidence: 0,
        estimatedNotes: { top: [], heart: [], base: [] },
        estimatedPrice: 0,
      };
    }
  }
);
