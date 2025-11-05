import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_AI_MODELS, AI_CONFIG } from '@/config/api.config';
import JarvisListenerService from './JarvisListenerService';
import JarvisVoiceService from './JarvisVoiceService';
import JarvisPersonality from './personality/JarvisPersonality';
import FreeAIService from './ai/FreeAIService';

const INITIALIZATION_KEY = '@jarvis_initialized';

/**
 * JarvisInitializationService
 * 
 * Handles the complete initialization of all Jarvis services on app startup.
 * This ensures Jarvis is fully connected and ready to listen from the moment
 * the app starts.
 */
class JarvisInitializationService {
  private static instance: JarvisInitializationService;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): JarvisInitializationService {
    if (!JarvisInitializationService.instance) {
      JarvisInitializationService.instance = new JarvisInitializationService();
    }
    return JarvisInitializationService.instance;
  }

  /**
   * Initialize all Jarvis services and connect API keys
   */
  async initialize(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.initialized) {
      console.log('[JarvisInit] Already initialized');
      return;
    }

    // Create initialization promise
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
      this.initialized = true;
      console.log('[JarvisInit] ✅ Initialization complete');
    } catch (error) {
      console.error('[JarvisInit] ❌ Initialization failed:', error);
      this.initializationPromise = null;
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    console.log('[JarvisInit] 🚀 Starting Jarvis initialization...');

    try {
      // Step 1: Load and save API keys from config to AsyncStorage
      await this.loadAPIKeysFromConfig();

      // Step 2: Initialize Free AI Service with the loaded keys
      await this.initializeFreeAIService();

      // Step 3: Initialize Jarvis Personality
      await this.initializePersonality();

      // Step 4: Initialize Voice Service
      await this.initializeVoiceService();

      // Step 5: Initialize Listener Service
      await this.initializeListenerService();

      // Step 6: Start continuous listening mode
      await this.startContinuousListening();

      // Step 7: Greet the user
      await this.greetUser();

      // Mark as initialized
      await AsyncStorage.setItem(INITIALIZATION_KEY, 'true');

      console.log('[JarvisInit] ✅ All systems operational');
    } catch (error) {
      console.error('[JarvisInit] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load API keys from config and save to AsyncStorage
   */
  private async loadAPIKeysFromConfig(): Promise<void> {
    console.log('[JarvisInit] Loading API keys from configuration...');

    try {
      const keysToLoad: Array<{ id: string; key: string }> = [];

      // Collect all API keys from FREE_AI_MODELS
      Object.entries(FREE_AI_MODELS).forEach(([id, config]) => {
        if (config.apiKey && config.apiKey.trim() !== '') {
          keysToLoad.push({ id, key: config.apiKey });
        }
      });

      // Also check for Gemini key from AI_CONFIG
      if (AI_CONFIG.gemini?.apiKey && AI_CONFIG.gemini.apiKey.trim() !== '') {
        keysToLoad.push({ id: 'gemini', key: AI_CONFIG.gemini.apiKey });
      }

      // Save all keys to AsyncStorage
      const savePromises = keysToLoad.map(({ id, key }) => {
        console.log(`[JarvisInit] Saving API key for ${id}...`);
        return AsyncStorage.setItem(`@free_ai_keys:${id}`, key);
      });

      await Promise.all(savePromises);

      console.log(`[JarvisInit] ✅ Loaded ${keysToLoad.length} API keys`);
    } catch (error) {
      console.error('[JarvisInit] Failed to load API keys:', error);
      // Don't throw - we can still continue with whatever keys are available
    }
  }

  /**
   * Initialize the Free AI Service
   */
  private async initializeFreeAIService(): Promise<void> {
    console.log('[JarvisInit] Initializing Free AI Service...');

    try {
      // Load API keys from AsyncStorage into FreeAIService
      await FreeAIService.loadAPIKeys();

      // Test connections to configured providers
      const providers = FreeAIService.getConfiguredProviders();
      console.log(`[JarvisInit] Found ${providers.length} configured AI providers`);

      // Attempt to connect to each provider
      for (const provider of providers) {
        try {
          await FreeAIService.testProvider(provider.id);
          console.log(`[JarvisInit] ✅ Connected to ${provider.name}`);
        } catch (error) {
          console.warn(`[JarvisInit] ⚠️ Could not connect to ${provider.name}:`, error);
          // Continue with other providers
        }
      }

      console.log('[JarvisInit] ✅ Free AI Service initialized');
    } catch (error) {
      console.error('[JarvisInit] Failed to initialize Free AI Service:', error);
      // Don't throw - we can still use other services
    }
  }

  /**
   * Initialize Jarvis Personality
   */
  private async initializePersonality(): Promise<void> {
    console.log('[JarvisInit] Initializing Jarvis Personality...');

    try {
      // Load any stored personality data
      await JarvisPersonality.loadPersonality();
      
      const stats = JarvisPersonality.getPersonalityStats();
      console.log(`[JarvisInit] ✅ Personality loaded: ${stats.memoriesStored} memories, ${stats.autonomyLevel}% autonomy`);
    } catch (error) {
      console.error('[JarvisInit] Failed to initialize personality:', error);
      // Don't throw - personality will start fresh
    }
  }

  /**
   * Initialize Voice Service
   */
  private async initializeVoiceService(): Promise<void> {
    console.log('[JarvisInit] Initializing Voice Service...');

    try {
      // Voice service is already a singleton and auto-initializes
      const settings = JarvisVoiceService.getSettings();
      console.log(`[JarvisInit] ✅ Voice Service ready: ${settings.language}, ${settings.voice}`);
    } catch (error) {
      console.error('[JarvisInit] Failed to initialize voice service:', error);
      // Don't throw - voice is not critical
    }
  }

  /**
   * Initialize Listener Service
   */
  private async initializeListenerService(): Promise<void> {
    console.log('[JarvisInit] Initializing Listener Service...');

    try {
      // Listener service auto-initializes, just verify config
      const config = JarvisListenerService.getConfig();
      console.log(`[JarvisInit] ✅ Listener Service ready: wake word="${config.wakeWord}"`);
    } catch (error) {
      console.error('[JarvisInit] Failed to initialize listener service:', error);
      // Don't throw - listener can be started manually
    }
  }

  /**
   * Start continuous listening mode
   */
  private async startContinuousListening(): Promise<void> {
    console.log('[JarvisInit] Starting continuous listening mode...');

    try {
      // Check if user wants auto-start (can be configured)
      const autoStart = await AsyncStorage.getItem('@jarvis_auto_listen');
      
      if (autoStart !== 'false') {
        // Start continuous listening for wake word
        await JarvisListenerService.startContinuousListening();
        console.log('[JarvisInit] ✅ Continuous listening activated');
      } else {
        console.log('[JarvisInit] Auto-listen disabled by user preference');
      }
    } catch (error) {
      console.error('[JarvisInit] Failed to start continuous listening:', error);
      // Don't throw - user can start manually
    }
  }

  /**
   * Greet the user on startup
   */
  private async greetUser(): Promise<void> {
    console.log('[JarvisInit] Greeting user...');

    try {
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if this is the first initialization
      const firstTime = await AsyncStorage.getItem(INITIALIZATION_KEY);
      
      if (!firstTime) {
        // First time greeting
        await JarvisVoiceService.speak(
          'Good day, sir. JARVIS systems fully online and operational. All API connections established. Continuous listening mode activated. How may I assist you?'
        );
      } else {
        // Subsequent greeting
        JarvisVoiceService.speakGreeting();
      }

      console.log('[JarvisInit] ✅ User greeted');
    } catch (error) {
      console.error('[JarvisInit] Failed to greet user:', error);
      // Don't throw - greeting is not critical
    }
  }

  /**
   * Check if Jarvis is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Re-initialize Jarvis (useful for reconnecting after errors)
   */
  async reinitialize(): Promise<void> {
    console.log('[JarvisInit] Re-initializing Jarvis...');
    this.initialized = false;
    this.initializationPromise = null;
    await this.initialize();
  }

  /**
   * Get initialization status
   */
  async getStatus(): Promise<{
    initialized: boolean;
    aiProvidersConnected: number;
    listeningMode: boolean;
    memoryCount: number;
  }> {
    const providers = FreeAIService.getConfiguredProviders();
    const stats = JarvisPersonality.getPersonalityStats();
    const listening = JarvisListenerService.isContinuousMode();

    return {
      initialized: this.initialized,
      aiProvidersConnected: providers.filter(p => p.status === 'connected').length,
      listeningMode: listening,
      memoryCount: stats.memoriesStored,
    };
  }
}

export default JarvisInitializationService.getInstance();
