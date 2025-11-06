/**
 * Auto-Initialize API Keys Service
 * 
 * This service automatically initializes all hardcoded testing API keys
 * so the program works out-of-the-box during development without requiring
 * manual key entry for every build/test.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEYS } from '../config/apiKeys';

const STORAGE_KEY = 'jarvis_api_keys';

interface APIKey {
  id: string;
  service: string;
  displayName: string;
  key: string;
  isActive: boolean;
  isTested: boolean;
  tier: 'Free' | 'Paid' | 'Free Tier';
  addedAt: number;
  autoInitialized?: boolean;
}

/**
 * Auto-initialize hardcoded testing API keys on first run
 * or when no keys are configured.
 */
export async function autoInitializeAPIKeys(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const existingKeys: APIKey[] = stored ? JSON.parse(stored) : [];

    // Check if we already have any keys
    const hasGroq = existingKeys.some(k => k.service === 'groq');
    const hasGemini = existingKeys.some(k => k.service === 'gemini');
    const hasHF = existingKeys.some(k => k.service === 'huggingface');

    const keysToAdd: APIKey[] = [];

    // Auto-add Groq if not present and we have a key
    if (!hasGroq && API_KEYS.GROQ) {
      keysToAdd.push({
        id: `groq_auto_${Date.now()}`,
        service: 'groq',
        displayName: 'Groq',
        key: API_KEYS.GROQ,
        isActive: true,
        isTested: false,
        tier: 'Free',
        addedAt: Date.now(),
        autoInitialized: true,
      });
    }

    // Auto-add Gemini if not present and we have a key
    if (!hasGemini && API_KEYS.GOOGLE_GEMINI) {
      keysToAdd.push({
        id: `gemini_auto_${Date.now()}`,
        service: 'gemini',
        displayName: 'Google Gemini',
        key: API_KEYS.GOOGLE_GEMINI,
        isActive: true,
        isTested: false,
        tier: 'Free Tier',
        addedAt: Date.now(),
        autoInitialized: true,
      });
    }

    // Auto-add HuggingFace if not present and we have a key
    if (!hasHF && API_KEYS.HUGGING_FACE) {
      keysToAdd.push({
        id: `huggingface_auto_${Date.now()}`,
        service: 'huggingface',
        displayName: 'HuggingFace',
        key: API_KEYS.HUGGING_FACE,
        isActive: true,
        isTested: false,
        tier: 'Free',
        addedAt: Date.now(),
        autoInitialized: true,
      });
    }

    // Save if we added any keys
    if (keysToAdd.length > 0) {
      const updatedKeys = [...existingKeys, ...keysToAdd];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedKeys));
      console.log(`[AutoInit] Added ${keysToAdd.length} testing API keys automatically`);
      
      // Also set them in process.env for immediate use
      if (API_KEYS.GROQ) {
        // @ts-ignore - Setting env vars at runtime for testing
        process.env.EXPO_PUBLIC_GROQ_API_KEY = API_KEYS.GROQ;
      }
      if (API_KEYS.GOOGLE_GEMINI) {
        // @ts-ignore - Setting env vars at runtime for testing
        process.env.EXPO_PUBLIC_GEMINI_API_KEY = API_KEYS.GOOGLE_GEMINI;
      }
      if (API_KEYS.HUGGING_FACE) {
        // @ts-ignore - Setting env vars at runtime for testing
        process.env.EXPO_PUBLIC_HF_API_TOKEN = API_KEYS.HUGGING_FACE;
      }
    }
  } catch (error) {
    console.error('[AutoInit] Failed to auto-initialize API keys:', error);
  }
}

/**
 * Get the current status of API key initialization
 */
export async function getAPIKeyStatus(): Promise<{
  hasKeys: boolean;
  autoInitialized: boolean;
  keyCount: number;
  services: string[];
}> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const keys: APIKey[] = stored ? JSON.parse(stored) : [];
    
    return {
      hasKeys: keys.length > 0,
      autoInitialized: keys.some(k => k.autoInitialized),
      keyCount: keys.length,
      services: keys.map(k => k.service),
    };
  } catch (error) {
    console.error('[AutoInit] Failed to get API key status:', error);
    return {
      hasKeys: false,
      autoInitialized: false,
      keyCount: 0,
      services: [],
    };
  }
}
