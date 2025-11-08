/**
 * AuthManager - Central authentication orchestration service
 * Manages OAuth flows, token refresh, and provider connections
 * Android/Expo/Termux only - NO iOS support
 */

import TokenVault from './TokenVault';
import MasterProfile from './MasterProfile';
import { TokenData, AuthEvent, AuthEventListener, ProviderStatus } from './types';

class AuthManager {
  private eventListeners: Map<AuthEvent, Set<AuthEventListener>> = new Map();

  constructor() {
    // Initialize event listener maps
    this.eventListeners.set('connected', new Set());
    this.eventListeners.set('disconnected', new Set());
    this.eventListeners.set('token_refreshed', new Set());
  }

  /**
   * Start authentication flow for a provider
   * Delegates to provider-specific helper
   */
  async startAuthFlow(provider: string): Promise<boolean> {
    try {
      console.log(`[AuthManager] Starting auth flow for ${provider}`);

      // Dynamically import the provider helper
      const providerHelper = await this.getProviderHelper(provider);
      
      if (!providerHelper || !providerHelper.startAuth) {
        throw new Error(`Provider helper not found or invalid for ${provider}`);
      }

      // Start the auth flow
      const authResponse = await providerHelper.startAuth();
      
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Auth flow did not return valid tokens');
      }

      // Save tokens
      const tokenData: TokenData = {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        expires_in: authResponse.expires_in,
        expires_at: authResponse.expires_at,
        token_type: authResponse.token_type,
        scope: authResponse.scope,
        scopes: authResponse.scopes,
      };

      await TokenVault.saveToken(provider, tokenData);

      // Update master profile
      await MasterProfile.addConnectedProvider(provider);

      // Emit connected event
      this.emit('connected', provider, { tokenData, profile: authResponse.profile });

      console.log(`[AuthManager] Successfully authenticated ${provider}`);
      return true;
    } catch (error) {
      console.error(`[AuthManager] Auth flow failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get a valid access token for a provider
   * Automatically refreshes if expired
   */
  async getAccessToken(provider: string): Promise<string | null> {
    try {
      const tokenData = await TokenVault.getToken(provider);
      
      if (!tokenData) {
        console.log(`[AuthManager] No token found for ${provider}`);
        return null;
      }

      // Check if token is expired
      if (TokenVault.isTokenExpired(tokenData)) {
        console.log(`[AuthManager] Token expired for ${provider}, refreshing...`);
        const newToken = await this.refreshAccessToken(provider);
        return newToken;
      }

      return tokenData.access_token;
    } catch (error) {
      console.error(`[AuthManager] Failed to get access token for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Force refresh an access token
   */
  async refreshAccessToken(provider: string): Promise<string | null> {
    try {
      const tokenData = await TokenVault.getToken(provider);
      
      if (!tokenData || !tokenData.refresh_token) {
        console.log(`[AuthManager] No refresh token available for ${provider}`);
        return null;
      }

      console.log(`[AuthManager] Refreshing token for ${provider}`);

      // Get provider helper
      const providerHelper = await this.getProviderHelper(provider);
      
      if (!providerHelper || !providerHelper.refreshToken) {
        throw new Error(`Provider helper does not support token refresh for ${provider}`);
      }

      // Refresh the token
      const authResponse = await providerHelper.refreshToken(tokenData.refresh_token);
      
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Token refresh did not return valid tokens');
      }

      // Update stored tokens
      const newTokenData: TokenData = {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token || tokenData.refresh_token, // Keep old refresh token if new one not provided
        expires_in: authResponse.expires_in,
        expires_at: authResponse.expires_at,
        token_type: authResponse.token_type,
        scope: authResponse.scope,
        scopes: authResponse.scopes || tokenData.scopes,
      };

      await TokenVault.saveToken(provider, newTokenData);

      // Emit token refreshed event
      this.emit('token_refreshed', provider, { tokenData: newTokenData });

      console.log(`[AuthManager] Successfully refreshed token for ${provider}`);
      return newTokenData.access_token;
    } catch (error) {
      console.error(`[AuthManager] Failed to refresh token for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Revoke and remove a provider's connection
   */
  async revokeProvider(provider: string): Promise<void> {
    try {
      console.log(`[AuthManager] Revoking ${provider}`);

      // Get token for revocation
      const tokenData = await TokenVault.getToken(provider);
      
      if (tokenData) {
        // Try to revoke with provider helper
        try {
          const providerHelper = await this.getProviderHelper(provider);
          
          if (providerHelper && providerHelper.revokeToken) {
            await providerHelper.revokeToken(tokenData.access_token);
            console.log(`[AuthManager] Revoked token with provider for ${provider}`);
          }
        } catch (error) {
          console.warn(`[AuthManager] Failed to revoke with provider for ${provider}:`, error);
          // Continue with local cleanup even if remote revocation fails
        }
      }

      // Remove token from vault
      await TokenVault.removeToken(provider);

      // Update master profile
      await MasterProfile.removeConnectedProvider(provider);

      // Emit disconnected event
      this.emit('disconnected', provider);

      console.log(`[AuthManager] Successfully revoked ${provider}`);
    } catch (error) {
      console.error(`[AuthManager] Failed to revoke ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get list of all connected providers
   */
  async getConnectedProviders(): Promise<string[]> {
    try {
      const profile = await MasterProfile.getMasterProfile();
      return profile?.connectedProviders || [];
    } catch (error) {
      console.error('[AuthManager] Failed to get connected providers:', error);
      return [];
    }
  }

  /**
   * Check if a provider is connected
   */
  async isConnected(provider: string): Promise<boolean> {
    try {
      const tokenData = await TokenVault.getToken(provider);
      return tokenData !== null;
    } catch (error) {
      console.error(`[AuthManager] Failed to check connection for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get provider status (connected, not_connected, needs_reauth)
   */
  async getProviderStatus(provider: string): Promise<ProviderStatus> {
    try {
      const tokenData = await TokenVault.getToken(provider);
      
      if (!tokenData) {
        return 'not_connected';
      }

      // Check if token is expired and no refresh token available
      if (TokenVault.isTokenExpired(tokenData) && !tokenData.refresh_token) {
        return 'needs_reauth';
      }

      return 'connected';
    } catch (error) {
      console.error(`[AuthManager] Failed to get status for ${provider}:`, error);
      return 'not_connected';
    }
  }

  /**
   * Add a local token manually (for smart home devices)
   */
  async addLocalToken(provider: string, accessToken: string, metadata?: Partial<TokenData>): Promise<void> {
    try {
      console.log(`[AuthManager] Adding local token for ${provider}`);

      const tokenData: TokenData = {
        access_token: accessToken,
        ...metadata,
      };

      await TokenVault.saveToken(provider, tokenData);
      await MasterProfile.addConnectedProvider(provider);

      this.emit('connected', provider, { tokenData });

      console.log(`[AuthManager] Successfully added local token for ${provider}`);
    } catch (error) {
      console.error(`[AuthManager] Failed to add local token for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to auth events
   */
  on(event: AuthEvent, listener: AuthEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from auth events
   */
  off(event: AuthEvent, listener: AuthEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an auth event
   */
  private emit(event: AuthEvent, provider: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(provider, data);
        } catch (error) {
          console.error(`[AuthManager] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Dynamically load provider helper
   */
  private async getProviderHelper(provider: string): Promise<any> {
    try {
      // Normalize provider name to match file names
      const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '');
      
      // Try to import the provider helper
      const helper = await import(`./providerHelpers/${normalizedProvider}`);
      return helper;
    } catch (error) {
      console.error(`[AuthManager] Failed to load provider helper for ${provider}:`, error);
      throw new Error(`Provider helper not found for ${provider}`);
    }
  }
}

export default new AuthManager();
