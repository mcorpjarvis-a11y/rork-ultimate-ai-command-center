/**
 * Example: Integrating Auth System with Existing Services
 * 
 * This file shows how to migrate existing services to use the new
 * authentication system instead of hardcoded API keys.
 */

import AuthManager from '@/services/auth/AuthManager';

// ============================================================================
// EXAMPLE 1: Simple API Call with Token
// ============================================================================

/**
 * Before: Using hardcoded API key
 */
async function fetchDataOldWay() {
  const API_KEY = process.env.GOOGLE_API_KEY; // Hardcoded or from env
  
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  return response.json();
}

/**
 * After: Using AuthManager
 */
async function fetchDataNewWay() {
  // Get token - automatically refreshed if expired
  const token = await AuthManager.getAccessToken('google');
  
  if (!token) {
    throw new Error('User not authenticated with Google');
  }
  
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// ============================================================================
// EXAMPLE 2: Service with Multiple Providers
// ============================================================================

class ContentService {
  /**
   * Post to multiple social platforms
   */
  async postToSocial(content: string, platforms: string[]) {
    const results: Record<string, any> = {};
    
    for (const platform of platforms) {
      try {
        const token = await AuthManager.getAccessToken(platform);
        
        if (!token) {
          results[platform] = { error: 'Not connected' };
          continue;
        }
        
        // Post to platform's API
        const result = await this.postToAPI(platform, content, token);
        results[platform] = result;
      } catch (error) {
        results[platform] = { error: error.message };
      }
    }
    
    return results;
  }
  
  private async postToAPI(platform: string, content: string, token: string) {
    // Platform-specific posting logic
    const apiEndpoints = {
      twitter: 'https://api.twitter.com/2/tweets',
      reddit: 'https://oauth.reddit.com/api/submit',
      discord: 'https://discord.com/api/channels/{channel}/messages',
    };
    
    const endpoint = apiEndpoints[platform];
    
    if (!endpoint) {
      throw new Error(`Unknown platform: ${platform}`);
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    });
    
    return response.json();
  }
}

// ============================================================================
// EXAMPLE 3: React Component with Auth Events
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

function SocialPoster() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  useEffect(() => {
    // Load initial connected platforms
    loadConnectedPlatforms();
    
    // Subscribe to auth events
    const handleConnected = (provider: string) => {
      console.log(`${provider} connected`);
      loadConnectedPlatforms();
    };
    
    const handleDisconnected = (provider: string) => {
      console.log(`${provider} disconnected`);
      loadConnectedPlatforms();
    };
    
    AuthManager.on('connected', handleConnected);
    AuthManager.on('disconnected', handleDisconnected);
    
    // Cleanup
    return () => {
      AuthManager.off('connected', handleConnected);
      AuthManager.off('disconnected', handleDisconnected);
    };
  }, []);
  
  async function loadConnectedPlatforms() {
    const platforms = await AuthManager.getConnectedProviders();
    setConnectedPlatforms(platforms);
  }
  
  async function handlePost(content: string) {
    setIsPosting(true);
    
    try {
      const service = new ContentService();
      const results = await service.postToSocial(content, connectedPlatforms);
      console.log('Post results:', results);
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
  }
  
  return (
    <View>
      <Text>Connected to: {connectedPlatforms.join(', ')}</Text>
      <Button
        title="Post Content"
        onPress={() => handlePost('Hello from RORK!')}
        disabled={isPosting || connectedPlatforms.length === 0}
      />
    </View>
  );
}

// ============================================================================
// EXAMPLE 4: Smart Home Control
// ============================================================================

class SmartHomeService {
  /**
   * Control smart home devices
   */
  async turnOnLights(deviceId: string) {
    // Get Home Assistant token
    const token = await AuthManager.getAccessToken('homeassistant');
    
    if (!token) {
      throw new Error('Home Assistant not connected');
    }
    
    // Get base URL from token metadata (stored when adding local token)
    const tokenData = await import('@/services/auth/TokenVault').then(m => m.default.getToken('homeassistant'));
    const baseUrl = tokenData?.metadata?.baseUrl || 'http://homeassistant.local:8123';
    
    // Call Home Assistant API
    const response = await fetch(`${baseUrl}/api/services/light/turn_on`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity_id: deviceId,
      }),
    });
    
    return response.json();
  }
  
  /**
   * Get device states
   */
  async getDevices() {
    const token = await AuthManager.getAccessToken('homeassistant');
    
    if (!token) {
      return [];
    }
    
    const tokenData = await import('@/services/auth/TokenVault').then(m => m.default.getToken('homeassistant'));
    const baseUrl = tokenData?.metadata?.baseUrl || 'http://homeassistant.local:8123';
    
    const response = await fetch(`${baseUrl}/api/states`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  }
}

// ============================================================================
// EXAMPLE 5: Check Connection Before Action
// ============================================================================

class AnalyticsService {
  /**
   * Sync data to cloud storage
   */
  async syncToCloud(data: any) {
    // Check if Google Drive is connected
    const isConnected = await AuthManager.isConnected('google');
    
    if (!isConnected) {
      console.log('Google Drive not connected, skipping cloud sync');
      return null;
    }
    
    // Get status to check if needs re-auth
    const status = await AuthManager.getProviderStatus('google');
    
    if (status === 'needs_reauth') {
      console.log('Google token expired, requesting re-authentication');
      // Could trigger UI to show re-auth prompt
      return null;
    }
    
    // Get token and sync
    const token = await AuthManager.getAccessToken('google');
    
    // Upload to Drive
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    
    return response.json();
  }
}

// ============================================================================
// EXAMPLE 6: Graceful Degradation
// ============================================================================

class AIService {
  /**
   * Generate content with fallback providers
   */
  async generateContent(prompt: string): Promise<string> {
    // Try providers in order of preference
    const providers = ['openai', 'anthropic', 'huggingface'];
    
    for (const provider of providers) {
      try {
        const token = await AuthManager.getAccessToken(provider);
        
        if (!token) {
          console.log(`${provider} not available, trying next provider`);
          continue;
        }
        
        // Try to generate with this provider
        const result = await this.callAIProvider(provider, prompt, token);
        return result;
      } catch (error) {
        console.error(`${provider} failed:`, error);
        // Continue to next provider
      }
    }
    
    throw new Error('All AI providers failed or not connected');
  }
  
  private async callAIProvider(provider: string, prompt: string, token: string): Promise<string> {
    // Provider-specific API calls
    // Implementation details...
    return 'Generated content';
  }
}

// ============================================================================
// EXAMPLE 7: Migration Helper
// ============================================================================

/**
 * Helper to gradually migrate existing code
 */
class AuthMigrationHelper {
  /**
   * Get token with fallback to old method
   */
  static async getTokenWithFallback(provider: string, fallbackKey?: string): Promise<string | null> {
    // Try new auth system first
    const token = await AuthManager.getAccessToken(provider);
    
    if (token) {
      return token;
    }
    
    // Fallback to old method if new auth not set up
    if (fallbackKey) {
      console.warn(`Using fallback API key for ${provider}. Consider connecting via AuthManager.`);
      return fallbackKey;
    }
    
    return null;
  }
  
  /**
   * Check if provider is available (new or old way)
   */
  static async isProviderAvailable(provider: string, fallbackKey?: string): Promise<boolean> {
    const isConnected = await AuthManager.isConnected(provider);
    return isConnected || !!fallbackKey;
  }
}

// Usage:
async function migrateExample() {
  const token = await AuthMigrationHelper.getTokenWithFallback(
    'google',
    process.env.GOOGLE_API_KEY // Fallback to env var
  );
  
  if (token) {
    // Use token for API call
  }
}

// ============================================================================
// Export examples for reference
// ============================================================================

export {
  fetchDataNewWay,
  ContentService,
  SmartHomeService,
  AnalyticsService,
  AIService,
  AuthMigrationHelper,
  SocialPoster,
};
