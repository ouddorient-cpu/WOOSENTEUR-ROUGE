'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DemoInputSchema = z.object({
  productName: z.string(),
  category: z.enum(['Parfum', 'Soin', 'Cosmétique', 'Maison', 'Autres']),
});

const DemoOutputSchema = z.object({
  productTitle: z.string(),
  shortDescription: z.string(),
  longDescriptionExcerpt: z.string(),
  focusKeyword: z.string(),
  slug: z.string(),
});

export type DemoInput = z.infer<typeof DemoInputSchema>;
export type DemoOutput = z.infer<typeof DemoOutputSchema>;

const demoPrompt = ai.definePrompt({
  name: 'generateDemoDescriptionPrompt',
  input: { schema: DemoInputSchema },
  output: { schema: DemoOutputSchema },
  prompt: `
Tu es un expert en rédaction SEO pour e-commerce cosmétique.
Génère une fiche produit professionnelle pour :

Produit : {{productName}}
Catégorie : {{category}}

Génère :
1. **productTitle** : Titre SEO optimisé (50-60 caractères)
2. **shortDescription** : Description courte percutante (2-3 phrases, 150 caractères max)
3. **longDescriptionExcerpt** : Début de la description longue HTML (150-200 mots avec balises <p> et <strong>)
4. **focusKeyword** : Le mot-clé principal SEO
5. **slug** : Slug URL court (20 caractères max, tirets, sans accents)

Ton : Professionnel, sensuel pour les parfums, persuasif. Langue : Français.
`,
});

const demoFlow = ai.defineFlow(
  {
    name: 'generateDemoDescriptionFlow',
    inputSchema: DemoInputSchema,
    outputSchema: DemoOutputSchema,
  },
  async (input) => {
    const { output } = await demoPrompt(input);
    if (!output) throw new Error('Génération échouée');
    return output;
  }
);

export async function generateDemoDescription(input: DemoInput): Promise<DemoOutput> {
  return demoFlow(input);
}
