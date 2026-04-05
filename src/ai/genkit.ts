import {genkit, GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Prioritize the correct variable name, but fall back to the other one.
const geminiApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

const plugins: GenkitPlugin[] = [];

if (geminiApiKey && !geminiApiKey.includes('your_api_key_here')) {
    plugins.push(googleAI({ apiKey: geminiApiKey }));
    console.log('✅ Google AI plugin loaded. Key prefix:', geminiApiKey.substring(0, 8) + '...');
} else {
    console.error('❌ GOOGLE_GENAI_API_KEY manquante ou invalide — IA désactivée.');
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash-lite',
});
