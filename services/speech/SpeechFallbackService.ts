/**
 * Speech Fallback Service
 * 
 * Provides graceful fallback mechanisms for speech recognition
 * when native services are unavailable
 */

import { Platform } from 'react-native';

export interface SpeechFallbackConfig {
  enableTextInput: boolean;
  enableWebSpeech: boolean;
  notifyUser: boolean;
}

class SpeechFallbackService {
  private static instance: SpeechFallbackService;
  private config: SpeechFallbackConfig = {
    enableTextInput: true,
    enableWebSpeech: Platform.OS === 'web',
    notifyUser: true,
  };

  private fallbackActive: boolean = false;
  private fallbackReason: string = '';

  private constructor() {}

  static getInstance(): SpeechFallbackService {
    if (!SpeechFallbackService.instance) {
      SpeechFallbackService.instance = new SpeechFallbackService();
    }
    return SpeechFallbackService.instance;
  }

  /**
   * Check if speech recognition is available
   */
  async checkSpeechAvailability(): Promise<{
    available: boolean;
    reason?: string;
    fallbackOptions: string[];
  }> {
    const fallbackOptions: string[] = [];

    // Check for expo-speech-recognition on native platforms
    if (Platform.OS !== 'web') {
      try {
        const ExpoSpeechRecognition = require('expo-speech-recognition');
        const { getStateAsync } = ExpoSpeechRecognition;
        
        if (getStateAsync) {
          return {
            available: true,
            fallbackOptions: [],
          };
        }
      } catch (error) {
        const reason = 'expo-speech-recognition not available';
        console.warn('[SpeechFallback]', reason);
        
        if (this.config.enableTextInput) {
          fallbackOptions.push('text-input');
        }

        return {
          available: false,
          reason,
          fallbackOptions,
        };
      }
    }

    // Check for Web Speech API on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        return {
          available: true,
          fallbackOptions: [],
        };
      }

      fallbackOptions.push('text-input');
      return {
        available: false,
        reason: 'Web Speech API not supported in this browser',
        fallbackOptions,
      };
    }

    // Default fallback
    if (this.config.enableTextInput) {
      fallbackOptions.push('text-input');
    }

    return {
      available: false,
      reason: 'Speech recognition not available on this platform',
      fallbackOptions,
    };
  }

  /**
   * Activate fallback mode
   */
  activateFallback(reason: string): void {
    this.fallbackActive = true;
    this.fallbackReason = reason;

    console.log('[SpeechFallback] Fallback mode activated:', reason);

    if (this.config.notifyUser) {
      // Can be extended to show user notification
      console.info('[SpeechFallback] Speech recognition unavailable. Text input available.');
    }
  }

  /**
   * Deactivate fallback mode
   */
  deactivateFallback(): void {
    this.fallbackActive = false;
    this.fallbackReason = '';
  }

  /**
   * Check if fallback mode is active
   */
  isFallbackActive(): boolean {
    return this.fallbackActive;
  }

  /**
   * Get fallback reason
   */
  getFallbackReason(): string {
    return this.fallbackReason;
  }

  /**
   * Get text input handler (for UI integration)
   */
  getTextInputHandler(): (text: string) => Promise<void> {
    return async (text: string) => {
      console.log('[SpeechFallback] Text input received:', text);
      // This can be connected to the command processing pipeline
    };
  }

  /**
   * Configure fallback service
   */
  configure(config: Partial<SpeechFallbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SpeechFallbackConfig {
    return { ...this.config };
  }
}

export default SpeechFallbackService.getInstance();
