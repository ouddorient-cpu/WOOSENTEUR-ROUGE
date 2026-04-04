'use server';
/**
 * @fileOverview Flow to generate visual ad text for multiple platforms.
 *
 * Generates platform-specific copy for:
 *   - Social (TikTok / Instagram / Snapchat): 3-line "dupe" overlay text
 *   - Facebook: big text on solid background (hook + proposition + CTA)
 *   - LinkedIn: detailed article with image caption
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

function checkApiKey() {
  const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_api_key_here')) {
    throw new Error("La clé API Google AI n'est pas configurée.");
  }
}

// ─── Input Schema ───────────────────────────────────────────────────────────

const VisualAdTextInputSchema = z.object({
  platform: z.enum(['social', 'facebook', 'linkedin']),
  originalName: z.string().optional().describe('Nom du parfum/produit original de luxe'),
  originalBrand: z.string().optional().describe('Marque du produit original'),
  originalPrice: z.string().optional().describe('Prix du produit original (ex: 300)'),
  dupeName: z.string().optional().describe('Nom de votre équivalent abordable'),
  dupeBrand: z.string().optional().describe('Marque de votre équivalent'),
  dupePrice: z.string().optional().describe('Votre prix (ex: 49)'),
  keyBenefit: z.string().optional().describe('Avantage clé à mettre en avant'),
});

export type VisualAdTextInput = z.infer<typeof VisualAdTextInputSchema>;

// ─── Output Schema ──────────────────────────────────────────────────────────

const VisualAdTextOutputSchema = z.object({
  // Social overlay (TikTok / Snap / Insta)
  line1: z.string().optional(),
  line2: z.string().optional(),
  line3: z.string().optional(),
  hashtags: z.string().optional(),

  // Facebook (texte sur fond uni)
  fbHook: z.string().optional().describe('Question courte et percutante (ex: T\'as déjà rêvé de sentir le luxe sans te ruiner ?)'),
  fbProposition: z.string().optional().describe('La proposition valeur en 1-2 phrases courtes et percutantes'),
  fbCta: z.string().optional().describe('Texte du bouton CTA (ex: Découvrir maintenant)'),

  // LinkedIn (article détaillé)
  linkedinTitle: z.string().optional(),
  linkedinBody: z.string().optional().describe('Corps de l\'article 200-300 mots structuré en paragraphes'),
  linkedinCaption: z.string().optional().describe('Légende courte pour accompagner l\'image'),
});

export type VisualAdTextOutput = z.infer<typeof VisualAdTextOutputSchema>;

// ─── Prompts ────────────────────────────────────────────────────────────────

const SOCIAL_PROMPT = `Tu es expert en marketing TikTok/Instagram pour e-commerçants parfums.

Style inspiré du compte @dubainegoce : direct, percutant, humain, format "dupe".

Produit original : {{originalName}}{{#if originalBrand}} de {{originalBrand}}{{/if}}{{#if originalPrice}} (~{{originalPrice}}€){{/if}}
Ton équivalent : {{dupeName}}{{#if dupeBrand}} par {{dupeBrand}}{{/if}}{{#if dupePrice}} ({{dupePrice}}€){{/if}}
{{#if keyBenefit}}Avantage clé : {{keyBenefit}}{{/if}}

Génère exactement :
- line1 : "Tu aimes [NomOriginal] de [MarqueCourte] ?" — accroche identification
- line2 : "Mais pas son prix +[Prix]€ ?" — choc du prix
- line3 : "J'ai la solution pour TOI" — toujours cette formule
- hashtags : 6 hashtags TikTok/Insta (mix FR/EN parfum dupe)

IMPORTANT : Gros caractères, phrases COURTES (max 35 char/ligne), ton familier "tu".
Réponds en JSON uniquement.`;

const FACEBOOK_PROMPT = `Tu es expert en publicité Facebook pour e-commerçants français, spécialiste parfums abordables.

Produit original : {{originalName}}{{#if originalBrand}} de {{originalBrand}}{{/if}}{{#if originalPrice}} (~{{originalPrice}}€){{/if}}
Ton équivalent : {{dupeName}}{{#if dupeBrand}} par {{dupeBrand}}{{/if}}{{#if dupePrice}} ({{dupePrice}}€){{/if}}
{{#if keyBenefit}}Message clé : {{keyBenefit}}{{/if}}

Format Facebook : texte GROS sur fond uni. Ce qui marche sur FB = question simple d'accroche + proposition claire.

Génère :
- fbHook : Question courte et percutante max 60 caractères (ex: "T'as déjà envie de sentir YSL sans payer 300€ ?")
- fbProposition : 2 phrases max, très directes, bénéfice immédiat
- fbCta : Texte bouton court (ex: "Je veux la solution", "Voir l'offre", "Commander maintenant")

Réponds en JSON uniquement.`;

const LINKEDIN_PROMPT = `Tu es expert en contenu LinkedIn B2B pour entrepreneurs e-commerce parfums.

Produit original : {{originalName}}{{#if originalBrand}} de {{originalBrand}}{{/if}}
Ton équivalent : {{dupeName}}{{#if dupeBrand}} par {{dupeBrand}}{{/if}}
{{#if keyBenefit}}Angle : {{keyBenefit}}{{/if}}

LinkedIn = articles détaillés, ton professionnel mais accessible, storytelling business.

Génère :
- linkedinTitle : Titre article accrocheur (pas clickbait, professionnel) max 80 car.
- linkedinBody : Corps 200-300 mots structuré. Parle du marché du luxe accessible, du business model "dupe", de ton positionnement. Inclus 2-3 paragraphes avec des sauts de ligne. Ton personnel "j'ai découvert que...".
- linkedinCaption : Légende courte sous l'image (1-2 phrases, max 120 car.)

Réponds en JSON uniquement.`;

// ─── Helper — render simple template ────────────────────────────────────────

function renderTemplate(template: string, vars: Record<string, string | undefined>): string {
  let result = template;
  // Handle {{#if field}}...{{/if}}
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, key, content) => {
    return vars[key] ? content : '';
  });
  // Handle {{field}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key) => vars[key] ?? '');
  return result;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function generateVisualAdText(
  input: VisualAdTextInput
): Promise<VisualAdTextOutput> {
  checkApiKey();

  const vars: Record<string, string | undefined> = {
    originalName: input.originalName,
    originalBrand: input.originalBrand,
    originalPrice: input.originalPrice,
    dupeName: input.dupeName,
    dupeBrand: input.dupeBrand,
    dupePrice: input.dupePrice,
    keyBenefit: input.keyBenefit,
  };

  let promptText: string;
  switch (input.platform) {
    case 'facebook':
      promptText = renderTemplate(FACEBOOK_PROMPT, vars);
      break;
    case 'linkedin':
      promptText = renderTemplate(LINKEDIN_PROMPT, vars);
      break;
    default:
      promptText = renderTemplate(SOCIAL_PROMPT, vars);
  }

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: promptText,
    output: { schema: VisualAdTextOutputSchema },
    config: { temperature: 0.7 },
  });

  if (!output) {
    throw new Error("Erreur lors de la génération du texte. Réessaie.");
  }

  return output;
}
