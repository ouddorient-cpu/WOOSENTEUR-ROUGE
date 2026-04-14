/**
 * API Route: Upload et génération
 * POST /api/marketing/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { runFlow } from "genkit";
import { generateCompleteMarketingContent } from "@/ai/flows";
import type { MarketingRequest, MarketingResponse } from "@/types/marketing";

export async function POST(req: NextRequest) {
  try {
    const body: MarketingRequest = await req.json();
    const { uploadedImageBase64, targetPlatform, customSlogan } = body;

    if (!uploadedImageBase64 || !targetPlatform) {
      return NextResponse.json(
        { success: false, error: "Image et plateforme requises" },
        { status: 400 }
      );
    }

    // Lance la génération via Genkit
    const result = await runFlow(generateCompleteMarketingContent, {
      uploadedImageBase64,
      targetPlatform,
      customSlogan,
    });

    const response: MarketingResponse = {
      success: result.success,
      data: result.success
        ? {
            id: result.id,
            originalPerfume: result.originalPerfume,
            clonePerfume: result.clonePerfume,
            slogan: result.slogan,
            visualElements: result.visualElements,
            imageUrl: result.imageUrl || "", // TODO: générer image finale
            createdAt: new Date(),
            status: "draft",
          }
        : undefined,
      error: result.error,
    };

    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur serveur inconnue",
      },
      { status: 500 }
    );
  }
}
