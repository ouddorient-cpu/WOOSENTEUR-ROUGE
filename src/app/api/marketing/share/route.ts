/**
 * API Route: Partage sur réseaux sociaux
 * POST /api/marketing/share
 */

import { NextRequest, NextResponse } from "next/server";
import type { SocialSharePayload } from "@/types/marketing";

// TODO: Intégrer avec APIs réelles des réseaux sociaux
// Pour maintenant, génère des URLs de partage

export async function POST(req: NextRequest) {
  try {
    const body: SocialSharePayload = await req.json();
    const { contentId, platform, caption } = body;

    if (!contentId || !platform) {
      return NextResponse.json(
        { success: false, error: "contentId et platform requises" },
        { status: 400 }
      );
    }

    // Génère les URLs de partage en fonction de la plateforme
    const shareUrls = generateShareUrls(contentId, platform, caption);

    return NextResponse.json({
      success: true,
      shareUrls,
      message: `Redirection vers ${platform} pour partage`,
    });
  } catch (error) {
    console.error("Share API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur partage",
      },
      { status: 500 }
    );
  }
}

function generateShareUrls(
  contentId: string,
  platform: string,
  caption?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://woosenteur.fr";
  const contentUrl = `${baseUrl}/content/${contentId}`;
  const shareCaption =
    caption || "Regarde ce clone parfum! 💎 100% équivalent, 80% moins cher!";

  const urls: Record<string, string> = {
    tiktok: `https://www.tiktok.com/upload?text=${encodeURIComponent(shareCaption)}&link=${contentUrl}`,
    instagram: `https://www.instagram.com/create/`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${contentUrl}&quote=${encodeURIComponent(shareCaption)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${contentUrl}`,
  };

  return urls[platform] || urls.facebook;
}
