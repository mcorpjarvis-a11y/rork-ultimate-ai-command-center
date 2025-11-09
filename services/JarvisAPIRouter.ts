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

/**
 * Makes a direct call to the HuggingFace Inference API.
 * @param apiKey Optional API key override for testing
 */
async function useHuggingFace(prompt: string, apiKey?: string): Promise<JarvisQueryResult> {
  const config = apiConfig.huggingface;
  const key = apiKey || process.env.EXPO_PUBLIC_HF_API_TOKEN || '';
  if (!key) return { success: false, error: 'HuggingFace API key not found', provider: 'huggingface' };

  try {
    const modelName = config.models.text['mistral-7b'];
    const response = await fetch(`${config.baseURL}/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HuggingFace API Error: ${errorText}`, provider: 'huggingface' };
    }
    const data = await response.json();
    const content = data[0]?.generated_text || data.generated_text;
    if (!content) {
      return { success: false, error: 'Invalid response format from HuggingFace API', provider: 'huggingface' };
    }
    return { success: true, content, provider: 'huggingface' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'huggingface' };
  }
}

/**
 * Makes a direct call to the Together AI API.
 * @param apiKey Optional API key override for testing
 */
async function useTogetherAI(prompt: string, apiKey?: string): Promise<JarvisQueryResult> {
  const config = apiConfig.togetherai;
  const key = apiKey || process.env.EXPO_PUBLIC_TOGETHER_API_KEY || '';
  if (!key) return { success: false, error: 'Together AI API key not found', provider: 'togetherai' };

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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Together AI API Error: ${errorText}`, provider: 'togetherai' };
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'Invalid response format from Together AI API', provider: 'togetherai' };
    }
    return { success: true, content, provider: 'togetherai' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'togetherai' };
  }
}

/**
 * Makes a direct call to the DeepSeek API.
 * @param apiKey Optional API key override for testing
 */
async function useDeepSeek(prompt: string, apiKey?: string): Promise<JarvisQueryResult> {
  const config = apiConfig.deepseek;
  const key = apiKey || process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '';
  if (!key) return { success: false, error: 'DeepSeek API key not found', provider: 'deepseek' };

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.models.code['deepseek-chat'],
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `DeepSeek API Error: ${errorText}`, provider: 'deepseek' };
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'Invalid response format from DeepSeek API', provider: 'deepseek' };
    }
    return { success: true, content, provider: 'deepseek' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', provider: 'deepseek' };
  }
}

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
    case 'huggingface':
      return useHuggingFace(prompt, apiKey);
    case 'togetherai':
      return useTogetherAI(prompt, apiKey);
    case 'deepseek':
      return useDeepSeek(prompt, apiKey);
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

/**
 * Automatically detect and use the first available AI provider.
 * Tries providers in order of preference: google, groq, togetherai, huggingface, deepseek
 * @param prompt The user's query
 * @returns A promise that resolves to the AI's response
 */
export async function queryJarvisAuto(prompt: string): Promise<JarvisQueryResult> {
  const providers: Provider[] = ['google', 'groq', 'togetherai', 'huggingface', 'deepseek'];
  
  for (const provider of providers) {
    const result = await queryJarvis(prompt, provider);
    if (result.success) {
      return result;
    }
  }
  
  return {
    success: false,
    error: 'No AI provider available. Please configure at least one API key in settings.',
    provider: 'google', // default fallback
  };
}

/**
 * Get list of available (configured) providers.
 * Checks for API keys in environment variables.
 * @returns Array of configured provider names
 */
export function getAvailableProviders(): Provider[] {
  const providers: Provider[] = [];
  
  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) providers.push('google');
  if (process.env.EXPO_PUBLIC_GROQ_API_KEY) providers.push('groq');
  if (process.env.EXPO_PUBLIC_TOGETHER_API_KEY) providers.push('togetherai');
  if (process.env.EXPO_PUBLIC_HF_API_TOKEN) providers.push('huggingface');
  if (process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY) providers.push('deepseek');
  
  return providers;
}
