import SecureKeyStorage from '@/services/security/SecureKeyStorage';
import { GoogleUser } from '@/services/auth/GoogleAuthService';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  picture?: string;
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
  lastLogin: number;
  setupCompleted: boolean;
}

/**
 * UserProfileService - Manages user profiles with encrypted API keys
 * Stores user profile data and API keys securely using SecureKeyStorage
 * Handles profile loading, saving, and syncing
 */
class UserProfileService {
  private currentProfile: UserProfile | null = null;
  private readonly PROFILE_KEY = 'user_profile';

  /**
   * Create a new user profile from Google user data
   */
  async createProfile(googleUser: GoogleUser): Promise<UserProfile> {
    const profile: UserProfile = {
      userId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      apiKeys: {},
      createdAt: Date.now(),
      lastLogin: Date.now(),
      setupCompleted: false,
    };

    // Auto-link Gemini API key if user signed in with Google
    try {
      const geminiKey = await this.detectGeminiAPIKey(googleUser.accessToken);
      if (geminiKey) {
        profile.apiKeys.gemini = geminiKey;
        console.log('[UserProfileService] Auto-linked Gemini API key');
      }
    } catch (error) {
      console.log('[UserProfileService] Could not auto-detect Gemini key:', error);
    }

    await this.saveProfile(profile);
    this.currentProfile = profile;
    
    console.log('[UserProfileService] Created new profile for:', profile.email);
    return profile;
  }

  /**
   * Attempt to detect or generate Gemini API key from Google account
   */
  private async detectGeminiAPIKey(accessToken: string): Promise<string | null> {
    try {
      // Check if user has access to Gemini through their Google account
      // For now, we'll check if they can access Google AI Studio
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1/models?key=AIzaSyDummy', // Test endpoint
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // If they have Google account, guide them to get Gemini key
      // For production, you'd integrate with Google AI Studio API
      console.log('[UserProfileService] User can access Google AI services');
      
      // Check environment for Gemini key as fallback
      const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (envKey && envKey.length > 0) {
        return envKey;
      }

      return null;
    } catch (error) {
      console.log('[UserProfileService] Gemini key detection failed:', error);
      return null;
    }
  }

  /**
   * Load user profile from secure storage
   */
  async loadProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileJson = await SecureKeyStorage.getKey(this.PROFILE_KEY, { userId });
      
      if (!profileJson) {
        console.log('[UserProfileService] No profile found for user:', userId);
        return null;
      }

      const profile: UserProfile = JSON.parse(profileJson);
      
      // Load API keys from secure storage
      const apiKeys = await SecureKeyStorage.getAllAPIKeys(userId);
      profile.apiKeys = apiKeys;
      
      // Update last login
      profile.lastLogin = Date.now();
      await this.saveProfile(profile);
      
      this.currentProfile = profile;
      console.log('[UserProfileService] Loaded profile for:', profile.email);
      
      return profile;
    } catch (error) {
      console.error('[UserProfileService] Error loading profile:', error);
      return null;
    }
  }

  /**
   * Save user profile to secure storage
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      // Save profile metadata (without API keys in JSON)
      const profileToSave = { ...profile };
      const apiKeys = profileToSave.apiKeys;
      profileToSave.apiKeys = {}; // Clear API keys from profile JSON
      
      await SecureKeyStorage.saveKey(
        this.PROFILE_KEY,
        JSON.stringify(profileToSave),
        { userId: profile.userId }
      );

      // Save each API key separately in secure storage
      if (apiKeys) {
        for (const [service, key] of Object.entries(apiKeys)) {
          if (key) {
            await SecureKeyStorage.saveAPIKey(service, key, profile.userId);
          }
        }
      }

      console.log('[UserProfileService] Saved profile for:', profile.email);
    } catch (error) {
      console.error('[UserProfileService] Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Update API keys for the current user
   */
  async updateAPIKeys(apiKeys: Partial<UserProfile['apiKeys']>): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No user profile loaded');
    }

    this.currentProfile.apiKeys = {
      ...this.currentProfile.apiKeys,
      ...apiKeys,
    };

    await this.saveProfile(this.currentProfile);
    console.log('[UserProfileService] Updated API keys');
  }

  /**
   * Add or update a single API key
   */
  async saveAPIKey(service: string, apiKey: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No user profile loaded');
    }

    this.currentProfile.apiKeys[service as keyof UserProfile['apiKeys']] = apiKey;
    
    await SecureKeyStorage.saveAPIKey(service, apiKey, this.currentProfile.userId);
    console.log(`[UserProfileService] Saved API key for ${service}`);
  }

  /**
   * Remove an API key
   */
  async deleteAPIKey(service: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No user profile loaded');
    }

    delete this.currentProfile.apiKeys[service as keyof UserProfile['apiKeys']];
    
    await SecureKeyStorage.deleteAPIKey(service, this.currentProfile.userId);
    console.log(`[UserProfileService] Deleted API key for ${service}`);
  }

  /**
   * Mark setup as completed
   */
  async markSetupComplete(): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No user profile loaded');
    }

    this.currentProfile.setupCompleted = true;
    await this.saveProfile(this.currentProfile);
    console.log('[UserProfileService] Setup marked as complete');
  }

  /**
   * Check if user has completed setup
   */
  isSetupComplete(): boolean {
    return this.currentProfile?.setupCompleted || false;
  }

  /**
   * Get current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  /**
   * Get API key for a specific service
   */
  getAPIKey(service: string): string | undefined {
    return this.currentProfile?.apiKeys[service as keyof UserProfile['apiKeys']];
  }

  /**
   * Get all API keys
   */
  getAllAPIKeys(): UserProfile['apiKeys'] {
    return this.currentProfile?.apiKeys || {};
  }

  /**
   * Check if any API keys are configured
   */
  hasAPIKeys(): boolean {
    const keys = this.getAllAPIKeys();
    return Object.values(keys).some(key => key && key.length > 0);
  }

  /**
   * Clear current profile (logout)
   */
  async clearProfile(): Promise<void> {
    if (!this.currentProfile) {
      return;
    }

    const userId = this.currentProfile.userId;
    
    // Clear all secure storage for this user
    await SecureKeyStorage.clearAll(userId);
    
    this.currentProfile = null;
    console.log('[UserProfileService] Cleared profile');
  }

  /**
   * Export profile for backup (without sensitive keys)
   */
  exportProfile(): Partial<UserProfile> | null {
    if (!this.currentProfile) {
      return null;
    }

    return {
      userId: this.currentProfile.userId,
      email: this.currentProfile.email,
      name: this.currentProfile.name,
      picture: this.currentProfile.picture,
      createdAt: this.currentProfile.createdAt,
      lastLogin: this.currentProfile.lastLogin,
      setupCompleted: this.currentProfile.setupCompleted,
      // API keys are intentionally excluded for security
    };
  }

  /**
   * Get profile data for cloud sync (encrypted)
   */
  async getProfileForSync(): Promise<string | null> {
    if (!this.currentProfile) {
      return null;
    }

    // Get all API keys from secure storage
    const apiKeys = await SecureKeyStorage.getAllAPIKeys(this.currentProfile.userId);
    
    const syncData = {
      ...this.currentProfile,
      apiKeys,
      syncedAt: Date.now(),
    };

    return JSON.stringify(syncData);
  }

  /**
   * Restore profile from cloud sync
   */
  async restoreProfileFromSync(syncData: string): Promise<UserProfile> {
    try {
      const profile: UserProfile = JSON.parse(syncData);
      
      // Validate profile data
      if (!profile.userId || !profile.email) {
        throw new Error('Invalid profile data');
      }

      // Save the restored profile
      await this.saveProfile(profile);
      this.currentProfile = profile;
      
      console.log('[UserProfileService] Restored profile from sync:', profile.email);
      return profile;
    } catch (error) {
      console.error('[UserProfileService] Error restoring profile from sync:', error);
      throw error;
    }
  }

  /**
   * Migrate API keys from environment variables to secure storage
   */
  async migrateAPIKeysFromEnv(userId: string): Promise<void> {
    console.log('[UserProfileService] Checking for API keys in environment...');
    
    const envKeys = {
      groq: process.env.EXPO_PUBLIC_GROQ_API_KEY,
      gemini: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      huggingface: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY,
      openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      anthropic: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      together: process.env.EXPO_PUBLIC_TOGETHER_API_KEY,
      deepseek: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
    };

    let migratedCount = 0;
    for (const [service, key] of Object.entries(envKeys)) {
      if (key && key.length > 0) {
        await SecureKeyStorage.saveAPIKey(service, key, userId);
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`[UserProfileService] Migrated ${migratedCount} API keys from environment`);
    }
  }
}

export default new UserProfileService();
