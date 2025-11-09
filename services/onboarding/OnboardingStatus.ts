/**
 * OnboardingStatus - Tracks wizard completion state
 * Single-user app: onboarding runs once on first launch
 * Subsequent launches go straight to dashboard
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'jarvis-onboarding-completed';

class OnboardingStatusManager {
  /**
   * Check if onboarding has been completed
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('[OnboardingStatus] Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   * Called after user finishes the setup wizard
   */
  async markOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      console.log('[OnboardingStatus] Onboarding marked as complete');
    } catch (error) {
      console.error('[OnboardingStatus] Failed to mark onboarding complete:', error);
      throw new Error('Failed to save onboarding status');
    }
  }

  /**
   * Reset onboarding status (for testing or re-setup)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      console.log('[OnboardingStatus] Onboarding status reset');
    } catch (error) {
      console.error('[OnboardingStatus] Failed to reset onboarding:', error);
      throw new Error('Failed to reset onboarding status');
    }
  }
}

export default new OnboardingStatusManager();
