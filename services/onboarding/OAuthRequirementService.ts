/**
 * OAuthRequirementService
 * 
 * Enforces OAuth authentication requirement before app usage.
 * No guest bypass - user MUST connect at least one OAuth provider.
 */

import MasterProfile from '@/services/auth/MasterProfile';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

export interface OAuthValidationResult {
  isValid: boolean;
  hasOAuthProvider: boolean;
  connectedProviders: string[];
  errors: string[];
}

class OAuthRequirementServiceManager {
  /**
   * Check if user has met OAuth requirements
   * Requires at least one connected OAuth provider
   */
  async validateOAuthRequirement(): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      isValid: false,
      hasOAuthProvider: false,
      connectedProviders: [],
      errors: [],
    };

    try {
      // Get master profile
      const profile = await MasterProfile.getMasterProfile();

      if (!profile) {
        result.errors.push('No master profile found');
        return result;
      }

      // Check for connected OAuth providers
      const connectedProviders = profile.connectedProviders || [];
      result.connectedProviders = connectedProviders;
      result.hasOAuthProvider = connectedProviders.length > 0;

      if (!result.hasOAuthProvider) {
        result.errors.push('At least one OAuth provider must be connected');
        return result;
      }

      // All checks passed
      result.isValid = true;
      console.log('[OAuthRequirement] ✅ OAuth requirements met:', connectedProviders);

    } catch (error) {
      console.error('[OAuthRequirement] Validation error:', error);
      result.errors.push(`Validation error: ${error}`);
    }

    return result;
  }

  /**
   * Check if master profile exists with OAuth providers
   */
  async hasValidOAuthProfile(): Promise<boolean> {
    const validation = await this.validateOAuthRequirement();
    return validation.isValid;
  }

  /**
   * Get list of connected OAuth providers
   */
  async getConnectedProviders(): Promise<string[]> {
    try {
      const profile = await MasterProfile.getMasterProfile();
      return profile?.connectedProviders || [];
    } catch (error) {
      console.error('[OAuthRequirement] Failed to get connected providers:', error);
      return [];
    }
  }

  /**
   * Enforce OAuth requirement - throws if not met
   */
  async enforceOAuthRequirement(): Promise<void> {
    const validation = await this.validateOAuthRequirement();
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      throw new Error(`OAuth requirement not met: ${errorMessage}`);
    }
  }

  /**
   * Log OAuth connection status
   */
  async logOAuthStatus(): Promise<void> {
    const validation = await this.validateOAuthRequirement();
    
    if (validation.isValid) {
      console.log('[OAuthRequirement] ✅ Successfully connected to:', validation.connectedProviders.join(', '));
    } else {
      console.log('[OAuthRequirement] ❌ OAuth connection failed:', validation.errors.join(', '));
    }
  }
}

export default new OAuthRequirementServiceManager();
