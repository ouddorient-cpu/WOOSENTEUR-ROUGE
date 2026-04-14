'use server';
/**
 * Flow 3: Générer un slogan marketing viral (AIDA)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  originalName: z.string(),
  originalBrand: z.string(),
  originalPrice: z.number().optional().default(200),
  cloneName: z.string(),
  cloneBrand: z.string(),
  clonePrice: z.number(),
  platform: z.enum(['tiktok', 'instagram', 'facebook', 'linkedin']),
  customSlogan: z.string().optional(),
});

const OutputSchema = z.object({
  slogan: z.string(),
  hook: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
});

const AISloganSchema = z.object({
  hook: z.string(),
  mainSlogan: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
});

const PLATFORM_STYLE: Record<string, string> = {
  tiktok: 'Court, viral, fun, émojis, Gen Z vibes',
  instagram: 'Chic, aspirationnel, premium, emojis subtils',
  facebook: 'Convaincant, story-driven, angle bénéfice',
  linkedin: 'Professionnel, business insight, credibility',
};

export const generateMarketingSlogan = ai.defineFlow(
  {
    name: 'generateMarketingSlogan',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { originalName, cloneName, cloneBrand, clonePrice, originalPrice = 200, platform, customSlogan } = input;

    if (customSlogan) {
      return {
        slogan: customSlogan,
        hook: customSlogan.split('\n')[0],
        cta: 'Lien en bio 🔗',
        hashtags: ['#CloneParfum', '#SaveMoney', '#ParfumAffaire'],
      };
    }

    const saving = Math.round(((originalPrice - clonePrice) / originalPrice) * 100);

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Tu es Marc Lefèvre, expert marketing digital français.
Crée un slogan VIRAL pour cette offre:
- Original: ${originalName} (~${originalPrice}$)
- Clone: ${cloneName} par ${cloneBrand} (${clonePrice}$)
- Économie: ${originalPrice - clonePrice}$ (${saving}%)
- Plateforme: ${platform} (${PLATFORM_STYLE[platform]})

Style Marc: Confiant, direct, humain (contractions), questions rhétoriques, focus conversion.
Exemple: "T'as déjà payé 200€ pour une fragrance qui s'envole en 2h? 😤 Moi oui..."`,
      output: { schema: AISloganSchema },
    });

    if (!output) {
      return {
        slogan: `Tu aimes ${originalName} mais pas son prix? Voici ${cloneName} ✨`,
        hook: `${cloneName} - Luxe abordable`,
        cta: 'Découvrir maintenant 🔗',
        hashtags: ['#CloneParfum', '#Luxe', '#SaveMoney'],
      };
    }

    return {
      slogan: [output.hook, output.mainSlogan, output.cta].filter(Boolean).join('\n'),
      hook: output.hook,
      cta: output.cta,
      hashtags: output.hashtags || ['#CloneParfum', '#SaveMoney'],
    };
  }
);
