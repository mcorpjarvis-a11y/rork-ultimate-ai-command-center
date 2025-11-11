import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_AI_MODELS, AI_CONFIG } from '@/config/api.config';
import JarvisListenerService from './JarvisListenerService';
import JarvisVoiceService from './JarvisVoiceService';
import JarvisPersonality from './personality/JarvisPersonality';
import FreeAIService from './ai/FreeAIService';
import JarvisLogger from './JarvisLoggerService';

const INITIALIZATION_KEY = '@jarvis_initialized';

// Configuration constants
const FIRST_TIME_GREETING = 'Good day, sir. JARVIS systems fully online and operational. All API connections established. Continuous listening mode activated. How may I assist you?';
const GREETING_DELAY_MS = 1000;

// API key validation patterns
const API_KEY_PATTERNS: Record<string, RegExp> = {
  groq: /^gsk_[a-zA-Z0-9]{40,}$/,
  huggingface: /^hf_[a-zA-Z0-9]{30,}$/,
  gemini: /^[A-Za-z0-9_-]{30,}$/,
  togetherai: /^[a-zA-Z0-9]{20,}$/,
  deepseek: /^[a-zA-Z0-9]{20,}$/,
  replicate: /^r8_[a-zA-Z0-9]{20,}$/,
};

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
  private cachedStatus: {
    initialized: boolean;
    aiProvidersConnected: number;
    listeningMode: boolean;
    memoryCount: number;
  } | null = null;
  private statusCacheExpiry: number = 0;
  private readonly STATUS_CACHE_TTL = 2000; // 2 seconds

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
      JarvisLogger.info('Already initialized');
      return;
    }

    // Create initialization promise
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
      this.initialized = true;
      JarvisLogger.success('Initialization complete');
    } catch (error) {
      JarvisLogger.error('Initialization failed:', error);
      this.initializationPromise = null;
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    JarvisLogger.stage('JarvisInit', 'Starting Jarvis initialization...');

    try {
      // Step 1: Skip loading API keys from config (lazy-load later)
      // API keys will be loaded only when user adds them in Settings
      JarvisLogger.info('Skipping API key loading - clean slate mode');

      // Step 2: Skip initializing Free AI Service (lazy-load later)
      // AI service will be initialized only when user provides keys
      JarvisLogger.info('Skipping AI service initialization - will initialize when keys provided');

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

      JarvisLogger.success('All systems operational (local mode)');
    } catch (error) {
      JarvisLogger.error('Initialization error:', error);
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
        if (config.apiKey && config.apiKey.trim() !== '' && this.validateAPIKey(id, config.apiKey)) {
          keysToLoad.push({ id, key: config.apiKey });
        }
      });

      // Also check for Gemini key from AI_CONFIG
      if (AI_CONFIG.gemini?.apiKey && AI_CONFIG.gemini.apiKey.trim() !== '' && this.validateAPIKey('gemini', AI_CONFIG.gemini.apiKey)) {
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
   * Validate API key format based on provider
   */
  private validateAPIKey(providerId: string, key: string): boolean {
    const pattern = API_KEY_PATTERNS[providerId];
    if (!pattern) {
      // No pattern defined, accept any non-empty key
      console.warn(`[JarvisInit] No validation pattern for ${providerId}, accepting key`);
      return true;
    }

    const isValid = pattern.test(key);
    if (!isValid) {
      console.warn(`[JarvisInit] Invalid API key format for ${providerId}`);
    }
    return isValid;
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
      // Personality is automatically loaded on first getInstance call
      // No need to call loadPersonality() explicitly as it's private and called in constructor
      
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
      await new Promise(resolve => setTimeout(resolve, GREETING_DELAY_MS));

      // Check if this is the first initialization
      const firstTime = await AsyncStorage.getItem(INITIALIZATION_KEY);
      
      if (!firstTime) {
        // First time greeting (awaited for sequencing)
        await JarvisVoiceService.speak(FIRST_TIME_GREETING);
      } else {
        // Subsequent greeting (fire and forget - speakGreeting is synchronous)
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
   * Get initialization status (with caching)
   */
  async getStatus(): Promise<{
    initialized: boolean;
    aiProvidersConnected: number;
    listeningMode: boolean;
    memoryCount: number;
  }> {
    const now = Date.now();
    
    // Return cached status if still valid
    if (this.cachedStatus && now < this.statusCacheExpiry) {
      return this.cachedStatus;
    }

    // Compute fresh status
    const providers = FreeAIService.getConfiguredProviders();
    const stats = JarvisPersonality.getPersonalityStats();
    const listening = JarvisListenerService.isContinuousMode();

    this.cachedStatus = {
      initialized: this.initialized,
      aiProvidersConnected: providers.filter(p => p.status === 'connected').length,
      listeningMode: listening,
      memoryCount: stats.memoriesStored,
    };
    
    this.statusCacheExpiry = now + this.STATUS_CACHE_TTL;

    return this.cachedStatus;
  }

  /**
   * Invalidate status cache (call when status changes)
   */
  invalidateStatusCache(): void {
    this.cachedStatus = null;
    this.statusCacheExpiry = 0;
  }

  /**
   * Lazy-load and initialize API keys from config (called from Settings)
   * This allows API keys to be configured after app startup
   */
  async initializeAPIKeys(): Promise<void> {
    console.log('[JarvisInit] Lazy-loading API keys from configuration...');
    try {
      await this.loadAPIKeysFromConfig();
      await this.initializeFreeAIService();
      this.invalidateStatusCache();
      console.log('[JarvisInit] ✅ API keys initialized');
    } catch (error) {
      console.error('[JarvisInit] Failed to initialize API keys:', error);
      throw error;
    }
  }

  /**
   * Test and save a specific API key (called from Settings)
   */
  async testAndSaveAPIKey(providerId: string, apiKey: string): Promise<boolean> {
    console.log(`[JarvisInit] Testing API key for ${providerId}...`);
    
    // Validate format first
    if (!this.validateAPIKey(providerId, apiKey)) {
      throw new Error(`Invalid API key format for ${providerId}`);
    }

    // Save to AsyncStorage
    await AsyncStorage.setItem(`@free_ai_keys:${providerId}`, apiKey);

    // Test the provider
    try {
      // Reload keys in FreeAIService
      await FreeAIService.loadAPIKeys();
      await FreeAIService.testProvider(providerId);
      
      this.invalidateStatusCache();
      console.log(`[JarvisInit] ✅ API key for ${providerId} validated and saved`);
      return true;
    } catch (error) {
      // Remove the invalid key
      await AsyncStorage.removeItem(`@free_ai_keys:${providerId}`);
      console.error(`[JarvisInit] API key test failed for ${providerId}:`, error);
      throw error;
    }
  }
}

export default JarvisInitializationService.getInstance();
