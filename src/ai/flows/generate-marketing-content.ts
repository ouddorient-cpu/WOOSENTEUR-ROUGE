'use server';
/**
 * @fileOverview Flow to generate marketing content (text) for cosmetics advertising.
 *
 * This module uses Genkit/Gemini to generate headlines, body copy, CTAs, and hashtags
 * for various advertising formats and styles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MarketingStyle, MarketingFormat, MarketingVariant } from '@/lib/types';

// Input Schema
const GenerateMarketingContentInputSchema = z.object({
  productName: z.string().describe('Le nom du produit.'),
  productType: z.string().describe('Le type de produit (Parfum, Soin, Cosmétique, etc.).'),
  brand: z.string().optional().describe('La marque du produit.'),
  message: z.string().describe('Le message clé à communiquer.'),
  style: z.enum(['luxe', 'clean', 'fun', 'science']).describe('Le style de communication.'),
  targetAudience: z.object({
    ageRange: z.string().describe('Tranche d\'âge cible (ex: "25-45").'),
    gender: z.enum(['Femmes', 'Hommes', 'Tous']).describe('Genre cible.'),
    values: z.array(z.string()).describe('Valeurs de l\'audience (ex: naturalité, efficacité).'),
  }),
  cta: z.string().describe('Call-to-action souhaité.'),
  format: z.enum(['instagram_post', 'instagram_story', 'facebook_ad']).describe('Format publicitaire.'),
});

export type GenerateMarketingContentInput = z.infer<typeof GenerateMarketingContentInputSchema>;

// Output Schema for a single variant
const MarketingVariantOutputSchema = z.object({
  variant: z.enum(['A', 'B', 'C']).describe('Identifiant de la variante.'),
  styleName: z.enum(['luxe', 'clean', 'fun', 'science']).describe('Style appliqué.'),
  headline: z.string().describe('Accroche publicitaire (max 40 caractères).'),
  body: z.string().describe('Texte principal (max 125 caractères).'),
  cta: z.string().describe('Call-to-action formaté (max 20 caractères).'),
  hashtags: z.array(z.string()).describe('5-8 hashtags pertinents.'),
});

// Output Schema for all variants
const GenerateMarketingContentOutputSchema = z.object({
  variants: z.array(MarketingVariantOutputSchema).describe('Les 3 variantes générées.'),
});

export type GenerateMarketingContentOutput = z.infer<typeof GenerateMarketingContentOutputSchema>;
export type MarketingVariantOutput = z.infer<typeof MarketingVariantOutputSchema>;

// Format-specific character limits
const FORMAT_LIMITS: Record<MarketingFormat, { headline: number; body: number; cta: number }> = {
  instagram_post: { headline: 40, body: 125, cta: 20 },
  instagram_story: { headline: 30, body: 80, cta: 15 },
  facebook_ad: { headline: 50, body: 150, cta: 25 },
};

// Define the Genkit Prompt
const marketingContentPrompt = ai.definePrompt({
  name: 'generateMarketingContentPrompt',
  input: { schema: GenerateMarketingContentInputSchema },
  output: { schema: GenerateMarketingContentOutputSchema },
  prompt: `
# IDENTITÉ
Tu es un EXPERT en marketing cosmétique avec 15 ans d'expérience en copywriting publicitaire.
Tu maîtrises parfaitement les codes du luxe, du clean beauty, et de la communication sur les réseaux sociaux.
Tu respectes scrupuleusement les réglementations cosmétiques européennes.

# MISSION
Créer 3 variantes de contenu publicitaire pour "{{productName}}" ({{productType}}).

# DONNÉES D'ENTRÉE
- Produit: {{productName}}
- Type: {{productType}}
- Marque: {{brand}}
- Message clé: {{message}}
- Style principal demandé: {{style}}
- Audience: {{targetAudience.gender}}, {{targetAudience.ageRange}} ans
- Valeurs audience: {{targetAudience.values}}
- CTA souhaité: {{cta}}
- Format: {{format}}

# STYLES DE COMMUNICATION

**LUXE**:
- Ton: élégant, sophistiqué, exclusif, aspirationnel
- Vocabulaire: raffinement, excellence, prestige, exception, signature
- Émotions: désir, exclusivité, distinction

**CLEAN**:
- Ton: authentique, transparent, naturel, bienveillant
- Vocabulaire: pureté, naturalité, sincérité, respect, équilibre
- Émotions: confiance, sérénité, bien-être

**FUN**:
- Ton: playful, énergique, bold, décomplexé
- Vocabulaire: éclat, audace, fun, vibes, glow
- Émotions: joie, liberté, spontanéité

**SCIENCE**:
- Ton: autoritaire, précis, factuel, rassurant
- Vocabulaire: innovation, efficacité, résultats, technologie, formule
- Émotions: confiance, expertise, efficacité

# CONTRAINTES RÉGLEMENTAIRES UE
- PAS de promesses médicales ("guérit", "traite", "soigne")
- PAS de superlatifs absolus non prouvés ("le meilleur", "le plus efficace")
- PAS de résultats garantis ("100% efficace", "résultats garantis")
- Ton honnête et responsable

# FORMAT DE SORTIE REQUIS

Génère EXACTEMENT 3 variantes:
- Variante A: Style LUXE
- Variante B: Style CLEAN
- Variante C: Style FUN

Pour chaque variante:
1. **headline**: Accroche percutante (MAX 40 caractères pour Instagram Post)
   - Doit capter l'attention immédiatement
   - Inclure le bénéfice principal

2. **body**: Texte principal (MAX 125 caractères pour Instagram Post)
   - Développer la promesse
   - Créer le désir
   - Rester concis et impactant

3. **cta**: Call-to-action (MAX 20 caractères)
   - Basé sur "{{cta}}" mais adapté au style
   - Inciter à l'action

4. **hashtags**: 5-8 hashtags pertinents
   - Mix de populaires et spécifiques
   - Inclure #{{productType}} et variations
   - Hashtags tendance beauté

# EXEMPLES DE QUALITÉ

**LUXE** (Parfum):
- headline: "L'essence du raffinement"
- body: "Révélez votre signature olfactive avec cette création d'exception. Une fragrance qui transcende l'ordinaire."
- cta: "Découvrir"
- hashtags: ["#parfum", "#luxe", "#fragrance", "#beauté", "#élégance", "#soin", "#rituel"]

**CLEAN** (Soin):
- headline: "Votre peau mérite le naturel"
- body: "Des ingrédients purs pour une beauté authentique. Votre rituel bien-être au quotidien."
- cta: "Essayer"
- hashtags: ["#cleanbeauty", "#skincare", "#naturel", "#soinvisage", "#beauty", "#selfcare"]

**FUN** (Cosmétique):
- headline: "Glow up instantané!"
- body: "Prête à briller? Ce must-have va devenir votre BFF beauté. Ose l'éclat!"
- cta: "Je craque"
- hashtags: ["#makeup", "#glowup", "#beautytips", "#maquillage", "#vibes", "#musthave"]
`,
});

// Define the Genkit Flow
const generateMarketingContentFlow = ai.defineFlow(
  {
    name: 'generateMarketingContentFlow',
    inputSchema: GenerateMarketingContentInputSchema,
    outputSchema: GenerateMarketingContentOutputSchema,
  },
  async (input) => {
    try {
      const geminiApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
      if (!geminiApiKey || geminiApiKey.includes('your_api_key_here')) {
        throw new Error("La clé API Google AI (GOOGLE_GENAI_API_KEY) n'est pas configurée.");
      }

      console.log(`📝 Generating marketing content for "${input.productName}"...`);

      const { output } = await marketingContentPrompt(input);

      if (!output || !output.variants || output.variants.length === 0) {
        throw new Error('La génération de contenu marketing a échoué - réponse vide.');
      }

      // Validate and truncate if necessary
      const limits = FORMAT_LIMITS[input.format as MarketingFormat];
      const validatedVariants = output.variants.map(variant => ({
        ...variant,
        headline: variant.headline.substring(0, limits.headline),
        body: variant.body.substring(0, limits.body),
        cta: variant.cta.substring(0, limits.cta),
      }));

      console.log(`✅ Generated ${validatedVariants.length} marketing variants successfully.`);

      return { variants: validatedVariants };
    } catch (error: any) {
      console.error('Erreur lors de la génération du contenu marketing:', error);

      const errorMessage = error?.message || String(error);

      if (errorMessage.includes('API key expired') || errorMessage.includes('API key not valid')) {
        throw new Error("Votre clé API Google AI a expiré ou est invalide.");
      }

      if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("Quota API dépassé. Veuillez réessayer plus tard.");
      }

      throw new Error(`Erreur de génération: ${errorMessage.substring(0, 200)}`);
    }
  }
);

/**
 * Main export function for generating marketing content
 */
export async function generateMarketingContent(
  input: GenerateMarketingContentInput
): Promise<GenerateMarketingContentOutput> {
  return generateMarketingContentFlow(input);
}

/**
 * Generate a single variant with a specific style
 */
export async function generateSingleVariant(
  input: Omit<GenerateMarketingContentInput, 'style'>,
  style: MarketingStyle
): Promise<MarketingVariantOutput> {
  const result = await generateMarketingContent({ ...input, style });
  // Return the variant that matches the requested style
  const variant = result.variants.find(v => v.styleName === style);
  if (!variant) {
    return result.variants[0]; // Fallback to first variant
  }
  return variant;
}
