'use server';
/**
 * @fileOverview A Genkit tool to search for beauty products on the web.
 *
 * This tool uses the Google Custom Search API to search for product information
 * on a predefined set of trusted websites (Notino, Fragrantica).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

// Define the input schema for the tool
const SearchInputSchema = z.object({
  query: z.string().describe('The search query, typically "product name + brand".'),
});

// Define the output schema for a single search result item
const SearchResultItemSchema = z.object({
  title: z.string().describe('The title of the search result.'),
  link: z.string().url().describe('The URL of the search result.'),
  snippet: z.string().describe('A small description of the result.'),
  source: z.string().describe('The domain name of the source (e.g., "notino.fr").'),
});

// Define the output schema for the entire tool
const SearchOutputSchema = z.object({
  found: z.boolean().describe('Whether any relevant results were found.'),
  results: z.array(SearchResultItemSchema).describe('A list of relevant search results.'),
});


export const searchProductOnWeb = ai.defineTool(
  {
    name: 'searchProductOnWeb',
    description: 'Searches for a product on trusted websites (Notino, Fragrantica) to verify its existence and gather information. Returns a list of relevant results.',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async ({ query }) => {
    console.log(`🔍 Vérification d'existence sur sources fiables pour : "${query}"...`);

    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !engineId || apiKey === 'your_google_api_key_here' || engineId === 'your_google_search_engine_id_here') {
      console.warn('⚠️ Recherche web désactivée: Clé API ou ID de moteur de recherche Google non configuré.');
      return { found: false, results: [] };
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.json() as any;
        console.error('Erreur API Google Custom Search:', errorBody);
        if (response.status === 429 || response.status === 403) {
          console.warn('⚠️ Quota Google Custom Search API épuisé ou accès refusé. L\'IA utilisera ses connaissances générales.');
          return { found: false, results: [] };
        }
        throw new Error(`Erreur de l'API Google Custom Search: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (!data.items || data.items.length === 0) {
        console.log('❌ Produit non trouvé sur les sources fiables.');
        return { found: false, results: [] };
      }

      const relevantResults = data.items
        .map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          source: new URL(item.link).hostname.replace('www.', ''),
        }))
        .filter((item: { source: string; }) => 
            item.source.includes('notino.') || item.source.includes('fragrantica.')
        );
      
      if(relevantResults.length > 0) {
        console.log(`✅ Produit trouvé sur ${relevantResults[0].source}.`);
      } else {
         console.log('❌ Produit non trouvé sur les sources fiables (Notino, Fragrantica).');
      }

      return {
        found: relevantResults.length > 0,
        results: relevantResults.slice(0, 5), // Return top 5 relevant results
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Google Custom Search:', error);
      // In case of an API call error, we don't want to block the entire flow.
      // We return 'found: false' so the LLM can proceed with its general knowledge.
      return { found: false, results: [] };
    }
  }
);
