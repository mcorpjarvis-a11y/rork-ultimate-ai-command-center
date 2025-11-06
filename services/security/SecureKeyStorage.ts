import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecureKeyOptions {
  userId?: string;
  requireAuthentication?: boolean;
}

/**
 * SecureKeyStorage - Hardware-encrypted storage for sensitive data
 * Uses Expo SecureStore (iOS Keychain / Android Keystore)
 * Falls back to AsyncStorage for web platform
 */
class SecureKeyStorage {
  private readonly prefix: string = '@jarvis:secure:';
  private readonly isSecureStoreAvailable: boolean;

  constructor() {
    // SecureStore is only available on native platforms
    this.isSecureStoreAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
    
    if (!this.isSecureStoreAvailable) {
      console.warn('[SecureKeyStorage] SecureStore not available on this platform. Using AsyncStorage fallback.');
    }
  }

  /**
   * Save a key securely with optional user-specific prefix
   */
  async saveKey(key: string, value: string, options: SecureKeyOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.userId);
      
      if (this.isSecureStoreAvailable) {
        const secureOptions: SecureStore.SecureStoreOptions = {};
        
        if (options.requireAuthentication && Platform.OS === 'ios') {
          secureOptions.requireAuthentication = true;
        }
        
        await SecureStore.setItemAsync(fullKey, value, secureOptions);
        console.log(`[SecureKeyStorage] Saved ${key} securely`);
      } else {
        // Fallback to AsyncStorage for web
        await AsyncStorage.setItem(fullKey, value);
        console.log(`[SecureKeyStorage] Saved ${key} to AsyncStorage (fallback)`);
      }
    } catch (error) {
      console.error(`[SecureKeyStorage] Error saving ${key}:`, error);
      throw new Error(`Failed to save secure key: ${key}`);
    }
  }

  /**
   * Get a securely stored key
   */
  async getKey(key: string, options: SecureKeyOptions = {}): Promise<string | null> {
    try {
      const fullKey = this.buildKey(key, options.userId);
      
      if (this.isSecureStoreAvailable) {
        const secureOptions: SecureStore.SecureStoreOptions = {};
        
        if (options.requireAuthentication && Platform.OS === 'ios') {
          secureOptions.requireAuthentication = true;
        }
        
        const value = await SecureStore.getItemAsync(fullKey, secureOptions);
        
        if (value) {
          console.log(`[SecureKeyStorage] Retrieved ${key} securely`);
        }
        
        return value;
      } else {
        // Fallback to AsyncStorage for web
        const value = await AsyncStorage.getItem(fullKey);
        
        if (value) {
          console.log(`[SecureKeyStorage] Retrieved ${key} from AsyncStorage (fallback)`);
        }
        
        return value;
      }
    } catch (error) {
      console.error(`[SecureKeyStorage] Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a securely stored key
   */
  async deleteKey(key: string, options: SecureKeyOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.userId);
      
      if (this.isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(fullKey);
        console.log(`[SecureKeyStorage] Deleted ${key} securely`);
      } else {
        // Fallback to AsyncStorage for web
        await AsyncStorage.removeItem(fullKey);
        console.log(`[SecureKeyStorage] Deleted ${key} from AsyncStorage (fallback)`);
      }
    } catch (error) {
      console.error(`[SecureKeyStorage] Error deleting ${key}:`, error);
    }
  }

  /**
   * Get all keys stored for a specific user
   * Note: SecureStore doesn't support listing keys, so we maintain a key registry
   */
  async getAllKeys(userId?: string): Promise<Record<string, string>> {
    try {
      const registryKey = this.buildKey('__key_registry__', userId);
      const registryJson = await this.getKey('__key_registry__', { userId });
      
      if (!registryJson) {
        return {};
      }
      
      const registry: string[] = JSON.parse(registryJson);
      const keys: Record<string, string> = {};
      
      for (const key of registry) {
        const value = await this.getKey(key, { userId });
        if (value) {
          keys[key] = value;
        }
      }
      
      return keys;
    } catch (error) {
      console.error('[SecureKeyStorage] Error getting all keys:', error);
      return {};
    }
  }

  /**
   * Register a key in the registry for later retrieval
   */
  private async registerKey(key: string, userId?: string): Promise<void> {
    try {
      const registryJson = await this.getKey('__key_registry__', { userId });
      let registry: string[] = registryJson ? JSON.parse(registryJson) : [];
      
      if (!registry.includes(key)) {
        registry.push(key);
        await this.saveKey('__key_registry__', JSON.stringify(registry), { userId });
      }
    } catch (error) {
      console.error('[SecureKeyStorage] Error registering key:', error);
    }
  }

  /**
   * Unregister a key from the registry
   */
  private async unregisterKey(key: string, userId?: string): Promise<void> {
    try {
      const registryJson = await this.getKey('__key_registry__', { userId });
      if (!registryJson) return;
      
      let registry: string[] = JSON.parse(registryJson);
      registry = registry.filter(k => k !== key);
      
      await this.saveKey('__key_registry__', JSON.stringify(registry), { userId });
    } catch (error) {
      console.error('[SecureKeyStorage] Error unregistering key:', error);
    }
  }

  /**
   * Save API key with automatic registration
   */
  async saveAPIKey(service: string, apiKey: string, userId?: string): Promise<void> {
    const key = `api_key_${service}`;
    await this.saveKey(key, apiKey, { userId });
    await this.registerKey(key, userId);
  }

  /**
   * Get API key
   */
  async getAPIKey(service: string, userId?: string): Promise<string | null> {
    const key = `api_key_${service}`;
    return await this.getKey(key, { userId });
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(service: string, userId?: string): Promise<void> {
    const key = `api_key_${service}`;
    await this.deleteKey(key, { userId });
    await this.unregisterKey(key, userId);
  }

  /**
   * Get all API keys for a user
   */
  async getAllAPIKeys(userId?: string): Promise<Record<string, string>> {
    const allKeys = await this.getAllKeys(userId);
    const apiKeys: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(allKeys)) {
      if (key.startsWith('api_key_')) {
        const service = key.replace('api_key_', '');
        apiKeys[service] = value;
      }
    }
    
    return apiKeys;
  }

  /**
   * Migrate keys from AsyncStorage to SecureStore
   */
  async migrateFromAsyncStorage(keys: string[], userId?: string): Promise<void> {
    if (!this.isSecureStoreAvailable) {
      console.log('[SecureKeyStorage] Migration not needed on this platform');
      return;
    }
    
    console.log(`[SecureKeyStorage] Starting migration of ${keys.length} keys`);
    
    for (const key of keys) {
      try {
        // Try to get value from AsyncStorage
        const asyncKey = `@jarvis:${key}`;
        const value = await AsyncStorage.getItem(asyncKey);
        
        if (value) {
          // Save to SecureStore
          await this.saveKey(key, value, { userId });
          
          // Remove from AsyncStorage
          await AsyncStorage.removeItem(asyncKey);
          
          console.log(`[SecureKeyStorage] Migrated ${key}`);
        }
      } catch (error) {
        console.error(`[SecureKeyStorage] Error migrating ${key}:`, error);
      }
    }
    
    console.log('[SecureKeyStorage] Migration complete');
  }

  /**
   * Clear all secure storage for a user
   */
  async clearAll(userId?: string): Promise<void> {
    try {
      const allKeys = await this.getAllKeys(userId);
      
      for (const key of Object.keys(allKeys)) {
        await this.deleteKey(key, { userId });
      }
      
      // Clear the registry
      await this.deleteKey('__key_registry__', { userId });
      
      console.log('[SecureKeyStorage] Cleared all keys');
    } catch (error) {
      console.error('[SecureKeyStorage] Error clearing all keys:', error);
    }
  }

  /**
   * Build full key with optional user prefix
   */
  private buildKey(key: string, userId?: string): string {
    if (userId) {
      return `${this.prefix}${userId}:${key}`;
    }
    return `${this.prefix}${key}`;
  }

  /**
   * Check if SecureStore is available
   */
  isAvailable(): boolean {
    return this.isSecureStoreAvailable;
  }
}

export default new SecureKeyStorage();
