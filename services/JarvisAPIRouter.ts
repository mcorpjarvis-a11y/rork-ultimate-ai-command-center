import { apiConfig } from '../config/api.config';

type Provider = 'google' | 'groq' | 'huggingface' | 'togetherai' | 'deepseek';

interface JarvisQueryResult {
  success: boolean;
  content?: string;
  error?: string;
  provider: Provider;
}

/**
 * Makes a direct call to the Google Gemini API.
 * @param apiKey Optional API key override for testing
 */
async function useGemini(prompt: string, apiKey?: string): Promise<JarvisQueryResult> {
  const config = apiConfig.google;
  // TODO: replace process.env fallback with AuthManager.getAccessToken('google') when available
  const key = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  if (!key) return { success: false, error: 'Google Gemini API key not found', provider: 'google' };

  try {
    const response = await fetch(`${config.baseURL}/${config.models.text['gemini-1.5-pro']}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Google API Error: ${errorText}`, provider: 'google' };
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return { success: false, error: 'Invalid response format from Google API', provider: 'google' };
    }
    return { success: true, content, provider: 'google' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'google' };
  }
}

/**
 * Makes a direct call to the Groq API.
 * @param apiKey Optional API key override for testing
 */
async function useGroq(prompt: string, apiKey?: string): Promise<JarvisQueryResult> {
  const config = apiConfig.groq;
  // TODO: replace process.env fallback with AuthManager.getAccessToken('groq') when available
  const key = apiKey || process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
  if (!key) return { success: false, error: 'Groq API key not found', provider: 'groq' };

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.models.text['llama-3.1-8b'],
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Groq API Error: ${errorText}`, provider: 'groq' };
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'Invalid response format from Groq API', provider: 'groq' };
    }
    return { success: true, content, provider: 'groq' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'groq' };
  }
}

// NOTE: Add useHuggingFace, useTogetherAI etc. here following the same pattern when ready.

/**
 * The single, unified router function for all AI queries.
 * It dynamically calls the correct AI provider based on the 'provider' argument.
 *
 * @param prompt The user's query.
 * @param provider The AI provider to use ('google', 'groq', etc.).
 * @param apiKey Optional API key override (useful for testing keys)
 * @returns A promise that resolves to the AI's response.
 */
export async function queryJarvis(prompt: string, provider: Provider, apiKey?: string): Promise<JarvisQueryResult> {
  switch (provider) {
    case 'google':
      return useGemini(prompt, apiKey);
    case 'groq':
      return useGroq(prompt, apiKey);
    // Add other providers here
    // case 'huggingface':
    //   return useHuggingFace(prompt, apiKey);
    default:
      return { success: false, error: `Provider '${provider}' is not supported.`, provider };
  }
}

/**
 * Test an API key by making a simple query.
 * @param provider The AI provider to test
 * @param apiKey The API key to test
 * @returns A promise that resolves to whether the key is valid
 */
export async function testAPIKey(provider: Provider, apiKey: string): Promise<boolean> {
  const result = await queryJarvis('Hello', provider, apiKey);
  return result.success;
}
