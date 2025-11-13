/**
 * TokenVault - Secure token storage for OAuth providers
 * Uses SecureKeyStorage for hardware-encrypted on-device storage
 * Android/Expo/Termux only - NO iOS support
 */

import SecureKeyStorage from '@/services/security/SecureKeyStorage.js';
import { TokenData } from './types.js';

const TOKEN_PREFIX = 'auth_token_';

class TokenVault {
  /**
   * Save tokens securely for a provider
   */
  async saveToken(provider: string, tokenData: TokenData): Promise<void> {
    try {
      // Compute expires_at if not provided but expires_in is available
      if (!tokenData.expires_at && tokenData.expires_in) {
        tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000);
      }

      // Parse scopes from scope string if needed
      if (!tokenData.scopes && tokenData.scope) {
        tokenData.scopes = tokenData.scope.split(' ').filter(s => s.length > 0);
      }

      const key = this.getTokenKey(provider);
      const tokenJson = JSON.stringify(tokenData);
      
      await SecureKeyStorage.saveKey(key, tokenJson);
      console.log(`[TokenVault] Saved token for ${provider}`);
    } catch (error) {
      console.error(`[TokenVault] Failed to save token for ${provider}:`, error);
      throw new Error(`Failed to save token for ${provider}`);
    }
  }

  /**
   * Retrieve a provider's token
   */
  async getToken(provider: string): Promise<TokenData | null> {
    try {
      const key = this.getTokenKey(provider);
      const tokenJson = await SecureKeyStorage.getKey(key);
      
      if (!tokenJson) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(tokenJson);
      return tokenData;
    } catch (error) {
      console.error(`[TokenVault] Failed to get token for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Delete a provider's token
   */
  async removeToken(provider: string): Promise<void> {
    try {
      const key = this.getTokenKey(provider);
      await SecureKeyStorage.deleteKey(key);
      console.log(`[TokenVault] Removed token for ${provider}`);
    } catch (error) {
      console.error(`[TokenVault] Failed to remove token for ${provider}:`, error);
      throw new Error(`Failed to remove token for ${provider}`);
    }
  }

  /**
   * List all providers with stored tokens
   */
  async listProviders(): Promise<string[]> {
    try {
      // Get all keys from SecureKeyStorage
      const allKeys = await SecureKeyStorage.getAllKeys();
      
      // Filter for token keys and extract provider names
      const providers: string[] = [];
      for (const key of Object.keys(allKeys)) {
        if (key.startsWith(TOKEN_PREFIX)) {
          const provider = key.substring(TOKEN_PREFIX.length);
          providers.push(provider);
        }
      }
      
      return providers;
    } catch (error) {
      console.error('[TokenVault] Failed to list providers:', error);
      return [];
    }
  }

  /**
   * Check if a token is expired
   */
  isTokenExpired(tokenData: TokenData): boolean {
    if (!tokenData.expires_at && !tokenData.expiry) {
      // No expiration info, assume valid
      return false;
    }

    const expiryTime = tokenData.expires_at || tokenData.expiry;
    if (!expiryTime) {
      return false;
    }

    // Consider expired if within 5 minutes of expiration
    const bufferMs = 5 * 60 * 1000;
    return Date.now() >= (expiryTime - bufferMs);
  }

  /**
   * Clear all tokens (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      const providers = await this.listProviders();
      
      for (const provider of providers) {
        await this.removeToken(provider);
      }
      
      console.log('[TokenVault] Cleared all tokens');
    } catch (error) {
      console.error('[TokenVault] Failed to clear all tokens:', error);
      throw new Error('Failed to clear all tokens');
    }
  }

  /**
   * Get the storage key for a provider
   */
  private getTokenKey(provider: string): string {
    return `${TOKEN_PREFIX}${provider}`;
  }
}

export default new TokenVault();
