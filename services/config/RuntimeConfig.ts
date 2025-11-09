/**
 * RuntimeConfig - Centralized runtime configuration
 * Provides sensible defaults for backend/websocket URLs
 * Supports environment variables, Constants, and AsyncStorage
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RuntimeConfigData {
  backendUrl: string;
  wsUrl: string;
  isDevelopment: boolean;
  platform: string;
}

class RuntimeConfigManager {
  private config: RuntimeConfigData | null = null;
  private readonly STORAGE_KEY = 'jarvis-runtime-config';

  /**
   * Get runtime configuration with sensible defaults
   */
  async getConfig(): Promise<RuntimeConfigData> {
    if (this.config) {
      return this.config;
    }

    // Try to load from AsyncStorage first
    const stored = await this.loadFromStorage();
    if (stored) {
      this.config = stored;
      return stored;
    }

    // Build default config
    this.config = this.buildDefaultConfig();
    
    // Save to storage for next time
    await this.saveToStorage(this.config);
    
    return this.config;
  }

  /**
   * Build default configuration based on environment
   */
  private buildDefaultConfig(): RuntimeConfigData {
    const isDevelopment = __DEV__ || Constants.expoConfig?.extra?.environment === 'development';
    
    // Determine backend URL
    let backendUrl = process.env.EXPO_PUBLIC_API_URL || '';
    
    if (!backendUrl) {
      if (isDevelopment) {
        // Development defaults
        if (Platform.OS === 'android') {
          // Android emulator uses 10.0.2.2 to access host machine
          backendUrl = 'http://10.0.2.2:3000';
        } else if (Platform.OS === 'ios') {
          // iOS simulator can use localhost
          backendUrl = 'http://localhost:3000';
        } else {
          // Web or other platforms
          backendUrl = 'http://localhost:3000';
        }
      } else {
        // Production default (replace with your actual production URL)
        backendUrl = 'https://api.yourapp.com';
      }
    }

    // Determine WebSocket URL (derived from backend URL if not set)
    let wsUrl = process.env.EXPO_PUBLIC_WS_URL || '';
    
    if (!wsUrl) {
      // Derive from backend URL
      wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      
      // Append /ws path if needed
      if (!wsUrl.endsWith('/ws')) {
        wsUrl = `${wsUrl}/ws`;
      }
    }

    const config: RuntimeConfigData = {
      backendUrl,
      wsUrl,
      isDevelopment,
      platform: Platform.OS,
    };

    console.log('[RuntimeConfig] Built default config:', {
      backendUrl: config.backendUrl,
      wsUrl: config.wsUrl,
      isDevelopment: config.isDevelopment,
      platform: config.platform,
    });

    return config;
  }

  /**
   * Get backend URL
   */
  async getBackendUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.backendUrl;
  }

  /**
   * Get WebSocket URL
   */
  async getWsUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.wsUrl;
  }

  /**
   * Update backend URL (persists to storage)
   */
  async setBackendUrl(url: string): Promise<void> {
    const config = await this.getConfig();
    config.backendUrl = url;
    
    // Update WebSocket URL to match
    config.wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://');
    if (!config.wsUrl.endsWith('/ws')) {
      config.wsUrl = `${config.wsUrl}/ws`;
    }
    
    await this.saveToStorage(config);
    console.log('[RuntimeConfig] Updated backend URL:', url);
  }

  /**
   * Update WebSocket URL (persists to storage)
   */
  async setWsUrl(url: string): Promise<void> {
    const config = await this.getConfig();
    config.wsUrl = url;
    await this.saveToStorage(config);
    console.log('[RuntimeConfig] Updated WebSocket URL:', url);
  }

  /**
   * Reset to default configuration
   */
  async reset(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    this.config = null;
    console.log('[RuntimeConfig] Reset to defaults');
  }

  /**
   * Load configuration from AsyncStorage
   */
  private async loadFromStorage(): Promise<RuntimeConfigData | null> {
    try {
      const json = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (json) {
        const config = JSON.parse(json) as RuntimeConfigData;
        console.log('[RuntimeConfig] Loaded from storage:', config.backendUrl);
        return config;
      }
    } catch (error) {
      console.error('[RuntimeConfig] Failed to load from storage:', error);
    }
    return null;
  }

  /**
   * Save configuration to AsyncStorage
   */
  private async saveToStorage(config: RuntimeConfigData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      console.log('[RuntimeConfig] Saved to storage');
    } catch (error) {
      console.error('[RuntimeConfig] Failed to save to storage:', error);
    }
  }

  /**
   * Check if backend is reachable
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      const backendUrl = await this.getBackendUrl();
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const isReachable = response.ok;
      console.log('[RuntimeConfig] Backend reachable:', isReachable);
      return isReachable;
    } catch (error) {
      console.warn('[RuntimeConfig] Backend not reachable:', error);
      return false;
    }
  }
}

export default new RuntimeConfigManager();
