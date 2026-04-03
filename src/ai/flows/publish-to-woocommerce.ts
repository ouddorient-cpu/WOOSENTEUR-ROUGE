
'use server';
/**
 * @fileOverview Flow to publish a product to a WooCommerce store.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Product, UserProfile } from '@/lib/types';
import fetch from 'node-fetch';

// This schema validates only the fields needed for publishing.
// It avoids complex, non-serializable objects like Firestore Timestamps.
const PublishProductSchema = z.object({
  name: z.string(),
  price: z.number().optional(), // Ajout du prix
  imageUrl: z.string().url().optional(), // Ajout de l'URL de l'image
  seo: z.object({
    productTitle: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    category: z.enum(['Homme', 'Femme', 'Unisexe']),
    focusKeyword: z.string(),
    imageAltText: z.string().optional(),
    slug: z.string().optional(),
  }),
});


const WooCommerceCredentialsSchema = z.object({
    storeUrl: z.string().url({ message: "L'URL du magasin doit être une URL valide." }),
    consumerKey: z.string().min(1, { message: "La clé client est requise."}),
    consumerSecret: z.string().min(1, { message: "La clé secrète est requise."}),
});

// 1. Define Input Schema
const PublishToWooCommerceInputSchema = z.object({
  product: PublishProductSchema, // Use the simpler schema
  credentials: WooCommerceCredentialsSchema,
});

export type PublishToWooCommerceInput = z.infer<
  typeof PublishToWooCommerceInputSchema
>;

// 2. Define Output Schema
const PublishToWooCommerceOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  productId: z.number().optional(),
  productUrl: z.string().url().optional(),
});

export type PublishToWooCommerceOutput = z.infer<
  typeof PublishToWooCommerceOutputSchema
>;

// 3. Define the main function that components will call
// The 'product' parameter is typed as 'any' to accept the full Firestore Product object.
// The schema validation will happen inside the flow.
export async function publishToWooCommerce(
  input: { product: any, credentials: any }
): Promise<PublishToWooCommerceOutput> {
  // **Robust URL cleaning happens here, BEFORE the flow is called.**
  if (input.credentials && typeof input.credentials.storeUrl === 'string') {
    input.credentials.storeUrl = input.credentials.storeUrl.trim().replace(/\/+$/, '');
  }
  return publishToWooCommerceFlow(input);
}


// 4. Define the Genkit Flow
const publishToWooCommerceFlow = ai.defineFlow(
  {
    name: 'publishToWooCommerceFlow',
    inputSchema: PublishToWooCommerceInputSchema,
    outputSchema: PublishToWooCommerceOutputSchema,
  },
  async (input) => {
    const { product, credentials } = input;
    
    // The URL is already cleaned, but we do it again as a failsafe.
    const cleanedStoreUrl = credentials.storeUrl;
    const { consumerKey, consumerSecret } = credentials;

    // **Robust validation at the start of the flow**
    if (!cleanedStoreUrl || !consumerKey || !consumerSecret) {
        throw new Error("Les informations d'identification WooCommerce (URL, clé client, clé secrète) sont incomplètes.");
    }
    
    const wooApiUrl = `${cleanedStoreUrl}/wp-json/wc/v3/products`;

    const productPayload = {
      name: product.seo.productTitle,
      slug: product.seo.slug || undefined, // Use the SEO-optimized slug if available
      type: 'simple',
      regular_price: product.price ? product.price.toString() : '0',
      description: product.seo.longDescription,
      short_description: product.seo.shortDescription,
      categories: [
          // Pass the category name as an object
          { name: product.seo.category }
      ],
      // Add the image with alt text if the URL exists
      images: product.imageUrl ? [
          {
            src: product.imageUrl,
            alt: product.seo.imageAltText || product.seo.focusKeyword // Use imageAltText or fallback to focusKeyword
          }
      ] : [],
      meta_data: [
        {
          key: 'rank_math_focus_keyword',
          value: product.seo.focusKeyword,
        },
        {
          key: 'rank_math_title',
          value: product.seo.productTitle,
        },
        {
          key: 'rank_math_description',
          value: product.seo.shortDescription,
        },
      ],
    };

    try {
      const response = await fetch(wooApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        },
        body: JSON.stringify(productPayload),
      });

      // This handles network errors, but also non-OK HTTP statuses below
      if (!response.ok) {
        const responseData: any = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status} - ${response.statusText}`}));
        
        let errorMessage = responseData.message || `Erreur de l'API WooCommerce (${response.status})`;
        
        // Improve error message for the most common permission issue
        if (responseData.code === 'woocommerce_rest_cannot_create') {
             errorMessage = `Publication échouée. Vos clés API n'ont pas les droits d'écriture. Veuillez vérifier dans WooCommerce que les permissions sont sur "Lecture/Écriture".`;
        } else if (responseData.code === 'woocommerce_rest_authentication_error') {
            errorMessage = "Erreur d'authentification. Veuillez vérifier que vos clés API WooCommerce sont correctes dans votre profil.";
        }


        console.error("WooCommerce API Error:", responseData);
        throw new Error(errorMessage);
      }

      const responseData: any = await response.json();

      return {
        success: true,
        message: `Le produit "${product.name}" a été publié avec succès.`,
        productId: responseData.id,
        productUrl: responseData.permalink,
      };

    } catch (error: any) {
        // This will catch fetch errors (e.g., invalid URL, network down) and errors thrown from the !response.ok block
        console.error("Erreur lors de la publication sur WooCommerce:", error);
        throw new Error(error.message || 'Une erreur inattendue est survenue lors de la communication avec WooCommerce.');
    }
  }
);
