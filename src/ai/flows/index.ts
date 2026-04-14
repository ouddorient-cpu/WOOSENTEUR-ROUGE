/**
 * Flow Principal: Orchestration complète du système
 * Gère: détection → clone → slogan → éléments olfactifs → image finale
 */

import { defineFlow, runFlow } from "genkit";
import { detectPerfumeFromImage } from "./detect-perfume-from-image";
import { findCloneEquivalent } from "./find-clone-equivalent";
import { generateMarketingSlogan } from "./generate-marketing-slogan";
import { generateOlfactoryVisuals } from "./generate-olfactory-visuals";
import type { MarketingContent, MarketingRequest } from "@/types/marketing";

export const generateCompleteMarketingContent = defineFlow(
  {
    name: "generateCompleteMarketingContent",
    description:
      "Orchestre la génération complète: détection parfum → clone → slogan → visuels",
    inputSchema: {
      type: "object",
      properties: {
        uploadedImageBase64: { type: "string" },
        targetPlatform: {
          type: "string",
          enum: ["tiktok", "instagram", "facebook", "linkedin"],
        },
        customSlogan: { type: "string" },
      },
      required: ["uploadedImageBase64", "targetPlatform"],
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        contentId: { type: "string" },
        originalPerfume: { type: "object" },
        clonePerfume: { type: "object" },
        slogan: { type: "string" },
        visualElements: { type: "array" },
        previewImageUrl: { type: "string" },
      },
    },
  },
  async (input: any) => {
    const { uploadedImageBase64, targetPlatform, customSlogan }: { uploadedImageBase64: string; targetPlatform: 'tiktok' | 'instagram' | 'facebook' | 'linkedin'; customSlogan?: string } = input;
    const contentId = `mk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1️⃣ DÉTECTE le parfum original
      console.log("🔍 Étape 1: Détection du parfum...");
      const detectionResult = await runFlow(detectPerfumeFromImage, {
        imageBase64: uploadedImageBase64.replace(/^data:image\/\w+;base64,/, ""),
        imageMediaType: "image/jpeg",
      });

      if (detectionResult.confidence < 0.3) {
        return {
          success: false,
          error: "Impossible de détecter le parfum. Assurez-vous que l'image montre un flacon clair.",
          contentId,
        };
      }

      // 2️⃣ TROUVE le clone équivalent
      console.log("🧪 Étape 2: Recherche du clone équivalent...");
      const cloneResult = await runFlow(findCloneEquivalent, {
        originalPerfumeName: detectionResult.perfumeName,
        originalBrand: detectionResult.brand,
        originalPrice: detectionResult.estimatedPrice,
        fragranceNotes: detectionResult.estimatedNotes,
      });

      if (!cloneResult.found) {
        return {
          success: false,
          error: "Aucun clone équivalent trouvé pour ce parfum.",
          contentId,
        };
      }

      // 3️⃣ GÉNÈRE le slogan viral
      console.log("📝 Étape 3: Création du slogan...");
      const sloganResult = await runFlow(generateMarketingSlogan, {
        originalName: detectionResult.perfumeName,
        originalBrand: detectionResult.brand,
        originalPrice: detectionResult.estimatedPrice,
        cloneName: cloneResult.clone.name,
        cloneBrand: cloneResult.clone.brand,
        clonePrice: cloneResult.clone.price,
        platform: targetPlatform,
        customSlogan,
      });

      // 4️⃣ GÉNÈRE les éléments olfactifs
      console.log("🎨 Étape 4: Génération des éléments olfactifs...");
      const visualsResult = await runFlow(generateOlfactoryVisuals, {
        fragranceNotes: detectionResult.estimatedNotes,
      });

      // 5️⃣ CONSTRUIT le contenu final
      const marketingContent: MarketingContent = {
        id: contentId,
        originalPerfume: {
          id: `perf_${detectionResult.brand.toLowerCase()}_${detectionResult.perfumeName.toLowerCase().replace(/\s+/g, "_")}`,
          name: detectionResult.perfumeName,
          brand: detectionResult.brand,
          fragranceNotes: detectionResult.estimatedNotes,
          price: detectionResult.estimatedPrice,
        },
        clonePerfume: {
          id: "clone_" + contentId,
          name: cloneResult.clone.name,
          brand: cloneResult.clone.brand,
          fragranceNotes: detectionResult.estimatedNotes, // À améliorer avec notes réelles du clone
          price: cloneResult.clone.price,
          originalPerfumeId: "perf_" + detectionResult.brand,
          priceReduction: cloneResult.clone.priceReduction,
        },
        slogan: sloganResult.slogan,
        visualElements: visualsResult,
        imageUrl: "", // À générer via image generation (Replicate)
        createdAt: new Date(),
        status: "draft",
      };

      /*
      // 6️⃣ GÉNÈRE l'image finale (TODO: via Replicate ou Canvas API)
      console.log("🖼️ Étape 5: Génération de l'image finaleAvec slogan + éléments...");
      const finalImageUrl = await generateFinalImage(uploadedImageBase64, marketingContent);
      marketingContent.imageUrl = finalImageUrl;
      */

      return {
        success: true,
        ...marketingContent,
      };
    } catch (error) {
      console.error("❌ Erreur lors de la génération:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        contentId,
      };
    }
  }
);
