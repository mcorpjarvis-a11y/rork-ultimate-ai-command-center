/**
 * ConfigValidator - Validates application configuration at startup
 * Ensures the app can handle missing or invalid configurations gracefully
 */

import { API_CONFIG, WEBSOCKET_CONFIG, AI_CONFIG } from '@/config/api.config';

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NetworkConfigStatus {
  apiUrl: string;
  apiUrlValid: boolean;
  wsUrl: string;
  wsUrlValid: boolean;
  canConnectToBackend: boolean;
}

class ConfigValidator {
  /**
   * Validate all critical configurations
   */
  validateConfig(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate API configuration
    const apiValidation = this.validateApiConfig();
    errors.push(...apiValidation.errors);
    warnings.push(...apiValidation.warnings);

    // Validate WebSocket configuration
    const wsValidation = this.validateWebSocketConfig();
    errors.push(...wsValidation.errors);
    warnings.push(...wsValidation.warnings);

    // Validate AI configurations
    const aiValidation = this.validateAIConfig();
    warnings.push(...aiValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate API configuration
   */
  private validateApiConfig(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!API_CONFIG.baseURL) {
      errors.push('API base URL is not configured');
    } else if (!this.isValidUrl(API_CONFIG.baseURL)) {
      errors.push(`Invalid API URL format: ${API_CONFIG.baseURL}`);
    }

    if (API_CONFIG.timeout <= 0) {
      warnings.push('API timeout is set to an invalid value');
    }

    return { errors, warnings };
  }

  /**
   * Validate WebSocket configuration
   */
  private validateWebSocketConfig(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!WEBSOCKET_CONFIG.url) {
      warnings.push('WebSocket URL is not configured - real-time features will be disabled');
    } else if (!this.isValidWebSocketUrl(WEBSOCKET_CONFIG.url)) {
      warnings.push(`Invalid WebSocket URL format: ${WEBSOCKET_CONFIG.url}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate AI service configurations
   */
  private validateAIConfig(): { errors: string[]; warnings: string[] } {
    const warnings: string[] = [];

    // Check if at least one AI service is configured
    const hasOpenAI = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const hasAnthropic = !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const hasGroq = !!process.env.EXPO_PUBLIC_GROQ_API_KEY;
    const hasHuggingFace = !!process.env.EXPO_PUBLIC_HF_API_TOKEN;

    if (!hasOpenAI && !hasAnthropic && !hasGemini && !hasGroq && !hasHuggingFace) {
      warnings.push('No AI service API keys configured - AI features will be limited');
    }

    return { errors: [], warnings };
  }

  /**
   * Get network configuration status
   */
  async getNetworkConfigStatus(): Promise<NetworkConfigStatus> {
    const apiUrl = API_CONFIG.baseURL;
    const wsUrl = WEBSOCKET_CONFIG.url;

    return {
      apiUrl,
      apiUrlValid: this.isValidUrl(apiUrl),
      wsUrl,
      wsUrlValid: this.isValidWebSocketUrl(wsUrl),
      canConnectToBackend: await this.canConnectToBackend(),
    };
  }

  /**
   * Test if we can connect to the backend API
   */
  private async canConnectToBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_CONFIG.baseURL, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 404; // 404 is ok, means server exists
    } catch (error) {
      console.warn('[ConfigValidator] Cannot connect to backend:', error);
      return false;
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate WebSocket URL format
   */
  private isValidWebSocketUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  /**
   * Get a user-friendly error message for configuration issues
   */
  getErrorMessage(validation: ConfigValidationResult): string {
    const messages: string[] = [];

    if (validation.errors.length > 0) {
      messages.push('Configuration Errors:');
      validation.errors.forEach(error => messages.push(`  • ${error}`));
    }

    if (validation.warnings.length > 0) {
      if (messages.length > 0) {
        messages.push('');
      }
      messages.push('Warnings:');
      validation.warnings.forEach(warning => messages.push(`  • ${warning}`));
    }

    return messages.join('\n');
  }

  /**
   * Check if the app can run with current configuration
   */
  canRunApp(validation: ConfigValidationResult): boolean {
    // App can run even with warnings, but not with critical errors
    return validation.errors.length === 0;
  }
}

export default new ConfigValidator();
