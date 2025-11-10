/**
 * MasterProfileValidator
 * 
 * Validates master profile creation and ensures OAuth providers are connected.
 * Enforces data integrity and proper OAuth flow.
 */

import MasterProfile from '@/services/auth/MasterProfile';
import AuthManager from '@/services/auth/AuthManager';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

export interface ProfileValidationResult {
  isValid: boolean;
  hasEmail: boolean;
  hasName: boolean;
  hasOAuthProvider: boolean;
  errors: string[];
  warnings: string[];
}

class MasterProfileValidatorManager {
  /**
   * Validate master profile before creation
   * Ensures all required fields are present and OAuth is connected
   */
  async validateProfileCreation(profile: Partial<MasterProfileType>): Promise<ProfileValidationResult> {
    const result: ProfileValidationResult = {
      isValid: false,
      hasEmail: false,
      hasName: false,
      hasOAuthProvider: false,
      errors: [],
      warnings: [],
    };

    // Check email
    if (profile.email && profile.email.trim() !== '') {
      result.hasEmail = true;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        result.errors.push('Invalid email format');
      }
    } else {
      result.errors.push('Email is required');
    }

    // Check name
    if (profile.name && profile.name.trim() !== '') {
      result.hasName = true;
    } else {
      result.warnings.push('Name is recommended but not required');
    }

    // Check OAuth providers
    if (profile.connectedProviders && profile.connectedProviders.length > 0) {
      result.hasOAuthProvider = true;
      console.log('[ProfileValidator] Connected OAuth providers:', profile.connectedProviders);
    } else {
      result.errors.push('At least one OAuth provider must be connected');
    }

    // All critical checks must pass
    result.isValid = result.errors.length === 0 && result.hasEmail && result.hasOAuthProvider;

    return result;
  }

  /**
   * Validate existing master profile
   * Ensures profile has all required data
   */
  async validateExistingProfile(): Promise<ProfileValidationResult> {
    const result: ProfileValidationResult = {
      isValid: false,
      hasEmail: false,
      hasName: false,
      hasOAuthProvider: false,
      errors: [],
      warnings: [],
    };

    try {
      const profile = await MasterProfile.getMasterProfile();

      if (!profile) {
        result.errors.push('No master profile found');
        return result;
      }

      return await this.validateProfileCreation(profile);

    } catch (error) {
      console.error('[ProfileValidator] Error validating existing profile:', error);
      result.errors.push(`Validation error: ${error}`);
      return result;
    }
  }

  /**
   * Verify OAuth tokens are valid for connected providers
   */
  async verifyOAuthTokens(profile: MasterProfileType): Promise<{ provider: string; valid: boolean }[]> {
    const results: { provider: string; valid: boolean }[] = [];

    if (!profile.connectedProviders || profile.connectedProviders.length === 0) {
      console.log('[ProfileValidator] No OAuth providers to verify');
      return results;
    }

    for (const providerId of profile.connectedProviders) {
      try {
        console.log(`[ProfileValidator] Verifying OAuth token for ${providerId}...`);
        
        // Check if token exists in MasterProfile
        const isConnected = await MasterProfile.isProviderConnected(providerId);
        
        results.push({
          provider: providerId,
          valid: isConnected,
        });

        if (isConnected) {
          console.log(`[ProfileValidator] ✅ ${providerId} token is valid`);
        } else {
          console.log(`[ProfileValidator] ❌ ${providerId} token is invalid or missing`);
        }

      } catch (error) {
        console.error(`[ProfileValidator] Error verifying ${providerId}:`, error);
        results.push({
          provider: providerId,
          valid: false,
        });
      }
    }

    return results;
  }

  /**
   * Create and validate master profile with OAuth data
   * This is the main entry point for profile creation after OAuth
   */
  async createValidatedProfile(profileData: {
    email: string;
    name?: string;
    providerId: string;
    providerData?: Record<string, unknown>;
  }): Promise<MasterProfileType> {
    console.log('[ProfileValidator] Creating validated profile...');

    // Build master profile
    const profile: MasterProfileType = {
      id: `user_${Date.now()}`,
      email: profileData.email,
      name: profileData.name || profileData.email.split('@')[0],
      createdAt: new Date().toISOString(),
      connectedProviders: [profileData.providerId],
    };

    // Add provider-specific data if available
    if (profileData.providerData) {
      // You can extend this to store provider-specific info
      console.log('[ProfileValidator] Provider data available:', Object.keys(profileData.providerData));
    }

    // Validate before saving
    const validation = await this.validateProfileCreation(profile);

    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      throw new Error(`Profile validation failed: ${errorMessage}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('[ProfileValidator] Profile warnings:', validation.warnings.join(', '));
    }

    // Save profile
    await MasterProfile.saveMasterProfile(profile);
    console.log('[ProfileValidator] ✅ Master profile saved with OAuth provider:', profileData.providerId);

    return profile;
  }

  /**
   * Log profile validation status
   */
  async logValidationStatus(): Promise<void> {
    const validation = await this.validateExistingProfile();

    if (validation.isValid) {
      console.log('[ProfileValidator] ✅ Master profile is valid');
      console.log('[ProfileValidator] - Has email:', validation.hasEmail);
      console.log('[ProfileValidator] - Has name:', validation.hasName);
      console.log('[ProfileValidator] - Has OAuth:', validation.hasOAuthProvider);
    } else {
      console.log('[ProfileValidator] ❌ Master profile validation failed');
      console.log('[ProfileValidator] Errors:', validation.errors);
      console.log('[ProfileValidator] Warnings:', validation.warnings);
    }
  }
}

export default new MasterProfileValidatorManager();
