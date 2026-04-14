/**
 * Flow 3: Générer un slogan marketing viral (AIDA)
 * Crée un texte viral adapté à la plateforme
 */

import { defineFlow } from "genkit";
import { gemini15Flash } from "@genkit-ai/google-genai";

export const generateMarketingSlogan = defineFlow(
  {
    name: "generateMarketingSlogan",
    description:
      "Génère un slogan viral style Marc Lefèvre pour un clone parfum",
    inputSchema: {
      type: "object",
      properties: {
        originalName: { type: "string" },
        originalBrand: { type: "string" },
        originalPrice: { type: "number" },
        cloneName: { type: "string" },
        cloneBrand: { type: "string" },
        clonePrice: { type: "number" },
        platform: {
          type: "string",
          enum: ["tiktok", "instagram", "facebook", "linkedin"],
        },
        customSlogan: { type: "string" },
      },
      required: [
        "originalName",
        "originalBrand",
        "cloneName",
        "cloneBrand",
        "platform",
      ],
    },
    outputSchema: {
      type: "object",
      properties: {
        slogan: { type: "string" },
        hook: { type: "string" },
        cta: { type: "string" },
        hashtags: { type: "array", items: { type: "string" } },
      },
    },
  },
  async (input: any) => {
    const {
      originalName,
      cloneName,
      cloneBrand,
      clonePrice,
      originalPrice = 200,
      platform,
      customSlogan,
    }: {
      originalName: string;
      cloneName: string;
      cloneBrand: string;
      clonePrice: number;
      originalPrice?: number;
      platform: 'tiktok' | 'instagram' | 'facebook' | 'linkedin';
      customSlogan?: string;
    } = input;

    if (customSlogan) {
      return {
        slogan: customSlogan,
        hook: customSlogan.split("\n")[0],
        cta: "Lien en bio 🔗",
        hashtags: ["#CloneParfum", "#SaveMoney", "#ParfumAffaire"],
      };
    }

    const platformPrompt = {
      tiktok: "Court, viral, fun, émojis, Gen Z vibes",
      instagram: "Chic, aspirationnel, premium, emojis subtils",
      facebook: "Convaincant, story-driven, angle bénéfice",
      linkedin: "Professionnel, business insight, credibility",
    };

    const platformKey = platform as 'tiktok' | 'instagram' | 'facebook' | 'linkedin';

    const response = await gemini15Flash.generate({
      messages: [
        {
          content: [
            {
              type: "text",
              text: `Tu es Marc Lefèvre, expert marketing digital français.
Crée un slogan VIRAL pour cette offre:
- Original: ${originalName} (~${originalPrice}$)
- Clone: ${cloneName} (${clonePrice}$)
- Économie: ${originalPrice - clonePrice}$ (${Math.round(((originalPrice - clonePrice) / originalPrice) * 100)}%)
- Platform: ${platform} (${platformPrompt[platformKey]})

Format JSON:
{
  "hook": "Phrase d'accroche 3s (attention)",
  "mainSlogan": "Texte principal (intérêt + désir)",
  "cta": "Call-to-action (action)",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}

Style Marc: Confiant, direct, humain (contractions), questions rhétoriques, focus conversion.
Exemple: "T'as déjà payé 200€ pour une fragrance qui s'envole en 2h? 😤 Moi oui..."`,
            },
          ],
        },
      ],
    });

    const text = response.output?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        slogan: `Tu aimes ${originalName} mais pas son prix? Voici ${cloneName} ✨`,
        hook: `${cloneName} - Luxe abordable`,
        cta: "Découvrir maintenant 🔗",
        hashtags: ["#CloneParfum", "#Luxe", "#SaveMoney"],
      };
    }

    try {
      const parsedData = JSON.parse(jsonMatch[0]);
      const fullSlogan = [
        parsedData.hook,
        parsedData.mainSlogan,
        parsedData.cta,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        slogan: fullSlogan,
        hook: parsedData.hook,
        cta: parsedData.cta,
        hashtags: parsedData.hashtags || ["#CloneParfum", "#SaveMoney"],
      };
    } catch {
      return {
        slogan: `Tu aimes ${originalName} mais pas son prix? Voici ${cloneName} ✨`,
        hook: `${cloneName} - Le choix smart`,
        cta: "Essayer maintenant",
        hashtags: ["#CloneParfum", "#ParfumAffaire"],
      };
    }
  }
);
