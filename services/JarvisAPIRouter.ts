import { apiConfig } from '../config/api.config';
import { API_KEYS } from '../config/apiKeys';

type Provider = 'google' | 'groq' | 'huggingface' | 'togetherai' | 'deepseek';

interface JarvisQueryResult {
  success: boolean;
  content?: string;
  error?: string;
  provider: Provider;
}

/**
 * Makes a direct call to the Google Gemini API.
 */
async function useGemini(prompt: string): Promise<JarvisQueryResult> {
  const config = apiConfig.google;
  const apiKey = API_KEYS.GOOGLE_GEMINI;
  if (!apiKey) return { success: false, error: 'Google Gemini API key not found', provider: 'google' };

  try {
    const response = await fetch(`${config.baseURL}/${config.models.text['gemini-1.5-pro']}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Google API Error: ${errorText}`, provider: 'google' };
    }
    const data = await response.json();
    return { success: true, content: data.candidates[0].content.parts[0].text, provider: 'google' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'google' };
  }
}

/**
 * Makes a direct call to the Groq API.
 */
async function useGroq(prompt: string): Promise<JarvisQueryResult> {
  const config = apiConfig.groq;
  const apiKey = API_KEYS.GROQ;
  if (!apiKey) return { success: false, error: 'Groq API key not found', provider: 'groq' };

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    return { success: true, content: data.choices[0].message.content, provider: 'groq' };
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
 * @returns A promise that resolves to the AI's response.
 */
export async function queryJarvis(prompt: string, provider: Provider): Promise<JarvisQueryResult> {
  switch (provider) {
    case 'google':
      return useGemini(prompt);
    case 'groq':
      return useGroq(prompt);
    // Add other providers here
    // case 'huggingface':
    //   return useHuggingFace(prompt);
    default:
      return { success: false, error: `Provider '${provider}' is not supported.`, provider };
  }
}
