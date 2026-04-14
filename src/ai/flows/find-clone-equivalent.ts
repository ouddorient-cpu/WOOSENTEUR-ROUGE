/**
 * Flow 2: Trouver le clone équivalent moins cher
 * Cherche dans Firestore/DB une alternative moins chère
 */

import { defineFlow } from "genkit";
import { gemini15Flash } from "@genkit-ai/google-genai";
import type { PerfumeData, ClonePerfume } from "@/types/marketing";

// Mock pour la démo - À remplacer par une vraie query Firestore
const PERFUME_CLONES_DB: Record<string, ClonePerfume> = {
  "tom-ford-black-orchid": {
    id: "lattafa-asad",
    name: "Lattafa Asad",
    brand: "Lattafa",
    fragranceNotes: {
      top: ["Bergamote", "Agrumes épicés"],
      heart: ["Orchidée noire", "Rose", "Ambroxan"],
      base: ["Vétiver", "Cèdre", "Musc"],
    },
    price: 35,
    originalPerfumeId: "tom-ford-black-orchid",
    priceReduction: 82, // 82% moins cher (Tom Ford ~200$, Lattafa ~35$)
  },
  "dior-sauvage": {
    id: "lattafa-silver",
    name: "Lattafa Silver",
    brand: "Lattafa",
    fragranceNotes: {
      top: ["Ambroxan", "Épices"],
      heart: ["Ambrox", "Cèdre"],
      base: ["Bois de Cèdre", "Ambre"],
    },
    price: 25,
    originalPerfumeId: "dior-sauvage",
    priceReduction: 87,
  },
  "creed-aventus": {
    id: "armaf-club-de-nuit",
    name: "Armaf Club de Nuit Intense",
    brand: "Armaf",
    fragranceNotes: {
      top: ["Pêche", "Bergamote", "Cardamome"],
      heart: ["Rose bulgare", "Ambrox"],
      base: ["Ambre", "Musc blanc", "Cèdre"],
    },
    price: 40,
    originalPerfumeId: "creed-aventus",
    priceReduction: 95,
  },
};

export const findCloneEquivalent = defineFlow(
  {
    name: "findCloneEquivalent",
    description:
      "Trouve un clone parfum équivalent moins cher pour un original détecté",
    inputSchema: {
      type: "object",
      properties: {
        originalPerfumeName: { type: "string" },
        originalBrand: { type: "string" },
        originalPrice: { type: "number" },
        fragranceNotes: {
          type: "object",
          properties: {
            top: { type: "array", items: { type: "string" } },
            heart: { type: "array", items: { type: "string" } },
            base: { type: "array", items: { type: "string" } },
          },
        },
      },
      required: ["originalPerfumeName", "originalBrand"],
    },
    outputSchema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        clone: {
          type: "object",
          properties: {
            name: { type: "string" },
            brand: { type: "string" },
            price: { type: "number" },
            priceReduction: { type: "number" },
          },
        },
        matchScore: { type: "number", minimum: 0, maximum: 1 },
      },
    },
  },
  async (input: any) => {
    const { originalPerfumeName, originalBrand, originalPrice }: { originalPerfumeName: string; originalBrand: string; originalPrice: number } = input;

    // Normalise le nom pour la recherche
    const searchKey = `${originalBrand}-${originalPerfumeName}`
      .toLowerCase()
      .replace(/\s+/g, "-");

    // Recherche dans la DB
    const clone = PERFUME_CLONES_DB[searchKey];

    if (!clone) {
      // Fallback: demander à l'IA de suggérer un équivalent
      const response = await gemini15Flash.generate({
        messages: [
          {
            content: [
              {
                type: "text",
                text: `Suggère un clone parfum équivalent et moins cher pour "${originalPerfumeName}" de "${originalBrand}" (prix ~${originalPrice}$).
Réponds en JSON: { suggestedClone: "Nom", suggestedBrand: "Brand", estimatedPrice: number, matchScore: 0.0-1.0 }`,
              },
            ],
          },
        ],
      });

      const text = response.output?.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          found: false,
          clone: null,
          matchScore: 0,
        };
      }

      try {
        const suggestion = JSON.parse(jsonMatch[0]);
        return {
          found: true,
          clone: {
            name: suggestion.suggestedClone,
            brand: suggestion.suggestedBrand,
            price: suggestion.estimatedPrice,
            priceReduction: Math.round(
              ((originalPrice - suggestion.estimatedPrice) / originalPrice) * 100
            ),
          },
          matchScore: suggestion.matchScore,
        };
      } catch {
        return { found: false, clone: null, matchScore: 0 };
      }
    }

    return {
      found: true,
      clone: {
        name: clone.name,
        brand: clone.brand,
        price: clone.price,
        priceReduction: clone.priceReduction,
      },
      matchScore: 0.95, // Haute confiance pour la DB
    };
  }
);
