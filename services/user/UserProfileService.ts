import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureKeyStorage from '@/services/security/SecureKeyStorage';

export interface UserProfile {
  name: string;
  email: string;
  userId: string;
  apiKeys: {
    groq?: string;
    gemini?: string;
    huggingface?: string;
    openai?: string;
    anthropic?: string;
    together?: string;
    deepseek?: string;
  };
  createdAt: number;
  lastModified: number;
}

const PROFILE_KEY = '@jarvis:user_profile';

/**
 * UserProfileService - Manages user profile and API keys
 * Uses AsyncStorage for profile data and SecureKeyStorage for API keys
 */
class UserProfileService {
  private currentProfile: UserProfile | null = null;

  /**
   * Initialize and load the current profile
   */
  async initialize(): Promise<void> {
    await this.loadProfile();
  }

  /**
   * Get the current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  /**
   * Create or update user profile
   */
  async saveProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const now = Date.now();
      
      const updatedProfile: UserProfile = {
        ...this.currentProfile,
        ...profile,
        lastModified: now,
        createdAt: this.currentProfile?.createdAt || now,
      } as UserProfile;

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      this.currentProfile = updatedProfile;
      
      console.log('[UserProfileService] Profile saved');
    } catch (error) {
      console.error('[UserProfileService] Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Load profile from storage
   */
  private async loadProfile(): Promise<void> {
    try {
      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        
        // Load API keys from secure storage
        const apiKeys = await SecureKeyStorage.getAllAPIKeys(profile.userId);
        profile.apiKeys = apiKeys;
        
        this.currentProfile = profile;
        console.log('[UserProfileService] Profile loaded');
      }
    } catch (error) {
      console.error('[UserProfileService] Error loading profile:', error);
    }
  }

  /**
   * Save API key securely
   */
  async saveAPIKey(service: string, apiKey: string): Promise<void> {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile loaded');
      }

      await SecureKeyStorage.saveAPIKey(service, apiKey, this.currentProfile.userId);
      
      // Update in-memory profile
      this.currentProfile.apiKeys = {
        ...this.currentProfile.apiKeys,
        [service]: apiKey,
      };
      
      this.currentProfile.lastModified = Date.now();
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(this.currentProfile));
      
      console.log(`[UserProfileService] API key saved for ${service}`);
    } catch (error) {
      console.error(`[UserProfileService] Error saving API key for ${service}:`, error);
      throw error;
    }
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(service: string): Promise<void> {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile loaded');
      }

      await SecureKeyStorage.deleteAPIKey(service, this.currentProfile.userId);
      
      // Update in-memory profile
      const updatedKeys = { ...this.currentProfile.apiKeys };
      delete updatedKeys[service as keyof UserProfile['apiKeys']];
      this.currentProfile.apiKeys = updatedKeys;
      
      this.currentProfile.lastModified = Date.now();
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(this.currentProfile));
      
      console.log(`[UserProfileService] API key deleted for ${service}`);
    } catch (error) {
      console.error(`[UserProfileService] Error deleting API key for ${service}:`, error);
      throw error;
    }
  }

  /**
   * Get API key for a service
   */
  async getAPIKey(service: string): Promise<string | null> {
    try {
      if (!this.currentProfile) {
        return null;
      }

      return await SecureKeyStorage.getAPIKey(service, this.currentProfile.userId);
    } catch (error) {
      console.error(`[UserProfileService] Error getting API key for ${service}:`, error);
      return null;
    }
  }

  /**
   * Clear all profile data
   */
  async clearProfile(): Promise<void> {
    try {
      if (this.currentProfile) {
        await SecureKeyStorage.clearAll(this.currentProfile.userId);
      }
      
      await AsyncStorage.removeItem(PROFILE_KEY);
      this.currentProfile = null;
      
      console.log('[UserProfileService] Profile cleared');
    } catch (error) {
      console.error('[UserProfileService] Error clearing profile:', error);
      throw error;
    }
  }

  /**
   * Get profile data for sync (without sensitive keys)
   */
  async getProfileForSync(): Promise<any> {
    try {
      if (!this.currentProfile) {
        return null;
      }

      // Get all API keys from secure storage
      const apiKeys = await SecureKeyStorage.getAllAPIKeys(this.currentProfile.userId);
      
      return {
        name: this.currentProfile.name,
        email: this.currentProfile.email,
        userId: this.currentProfile.userId,
        apiKeys,
        createdAt: this.currentProfile.createdAt,
        lastModified: this.currentProfile.lastModified,
      };
    } catch (error) {
      console.error('[UserProfileService] Error getting profile for sync:', error);
      return null;
    }
  }

  /**
   * Restore profile from sync data
   */
  async restoreProfileFromSync(syncData: any): Promise<UserProfile> {
    try {
      const profile: UserProfile = {
        name: syncData.name,
        email: syncData.email,
        userId: syncData.userId,
        apiKeys: {},
        createdAt: syncData.createdAt,
        lastModified: syncData.lastModified,
      };

      // Save profile metadata
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      
      // Restore API keys to secure storage
      if (syncData.apiKeys) {
        for (const [service, apiKey] of Object.entries(syncData.apiKeys)) {
          if (typeof apiKey === 'string') {
            await SecureKeyStorage.saveAPIKey(service, apiKey, profile.userId);
            profile.apiKeys[service as keyof UserProfile['apiKeys']] = apiKey;
          }
        }
      }
      
      this.currentProfile = profile;
      console.log('[UserProfileService] Profile restored from sync');
      
      return profile;
    } catch (error) {
      console.error('[UserProfileService] Error restoring profile from sync:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentProfile !== null;
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.currentProfile?.userId || null;
  }
}

export default new UserProfileService();
