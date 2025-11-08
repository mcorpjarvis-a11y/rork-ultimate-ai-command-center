/**
 * MasterProfile - Single-user local profile management
 * Stores the primary user profile and tracks connected providers
 * Android/Expo/Termux only - NO iOS support
 */

import SecureKeyStorage from '@/services/security/SecureKeyStorage';
import { MasterProfile } from './types';

const PROFILE_KEY = 'master_profile';

class MasterProfileManager {
  /**
   * Get the master user profile
   */
  async getMasterProfile(): Promise<MasterProfile | null> {
    try {
      const profileJson = await SecureKeyStorage.getKey(PROFILE_KEY);
      
      if (!profileJson) {
        return null;
      }

      const profile: MasterProfile = JSON.parse(profileJson);
      console.log('[MasterProfile] Retrieved profile:', profile.email || profile.id);
      return profile;
    } catch (error) {
      console.error('[MasterProfile] Failed to get profile:', error);
      return null;
    }
  }

  /**
   * Save the master profile
   */
  async saveMasterProfile(profile: MasterProfile): Promise<void> {
    try {
      const profileJson = JSON.stringify(profile);
      await SecureKeyStorage.saveKey(PROFILE_KEY, profileJson);
      console.log('[MasterProfile] Saved profile:', profile.email || profile.id);
    } catch (error) {
      console.error('[MasterProfile] Failed to save profile:', error);
      throw new Error('Failed to save master profile');
    }
  }

  /**
   * Clear the master profile (use with caution)
   */
  async clearMasterProfile(): Promise<void> {
    try {
      await SecureKeyStorage.deleteKey(PROFILE_KEY);
      console.log('[MasterProfile] Cleared profile');
    } catch (error) {
      console.error('[MasterProfile] Failed to clear profile:', error);
      throw new Error('Failed to clear master profile');
    }
  }

  /**
   * Add a connected provider to the profile
   */
  async addConnectedProvider(provider: string): Promise<void> {
    try {
      const profile = await this.getMasterProfile();
      
      if (!profile) {
        throw new Error('No master profile found');
      }

      if (!profile.connectedProviders.includes(provider)) {
        profile.connectedProviders.push(provider);
        await this.saveMasterProfile(profile);
        console.log(`[MasterProfile] Added provider: ${provider}`);
      }
    } catch (error) {
      console.error(`[MasterProfile] Failed to add provider ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Remove a connected provider from the profile
   */
  async removeConnectedProvider(provider: string): Promise<void> {
    try {
      const profile = await this.getMasterProfile();
      
      if (!profile) {
        throw new Error('No master profile found');
      }

      profile.connectedProviders = profile.connectedProviders.filter(p => p !== provider);
      await this.saveMasterProfile(profile);
      console.log(`[MasterProfile] Removed provider: ${provider}`);
    } catch (error) {
      console.error(`[MasterProfile] Failed to remove provider ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Check if a provider is connected
   */
  async isProviderConnected(provider: string): Promise<boolean> {
    try {
      const profile = await this.getMasterProfile();
      return profile?.connectedProviders.includes(provider) ?? false;
    } catch (error) {
      console.error(`[MasterProfile] Failed to check provider ${provider}:`, error);
      return false;
    }
  }

  /**
   * Update profile details (name, email, avatar)
   */
  async updateProfileDetails(updates: Partial<Pick<MasterProfile, 'name' | 'email' | 'avatar'>>): Promise<void> {
    try {
      const profile = await this.getMasterProfile();
      
      if (!profile) {
        throw new Error('No master profile found');
      }

      Object.assign(profile, updates);
      await this.saveMasterProfile(profile);
      console.log('[MasterProfile] Updated profile details');
    } catch (error) {
      console.error('[MasterProfile] Failed to update profile:', error);
      throw error;
    }
  }
}

export default new MasterProfileManager();
