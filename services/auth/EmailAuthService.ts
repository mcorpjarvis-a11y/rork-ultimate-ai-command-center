/**
 * EmailAuthService - Email-based authentication service
 * Provides sign-up and sign-in functionality using email/password
 * Stores credentials securely using SecureKeyStorage
 * Android/Expo/Termux only - NO iOS support
 */

import SecureKeyStorage from '@/services/security/SecureKeyStorage';
import * as Crypto from 'expo-crypto';

export interface EmailAuthCredentials {
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

const AUTH_CREDENTIALS_KEY = 'email_auth_credentials';

class EmailAuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<boolean> {
    try {
      console.log('[EmailAuthService] Starting sign-up for:', data.email);

      // Validate email format
      if (!this.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (!this.isValidPassword(data.password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingCredentials = await this.getCredentials(data.email);
      if (existingCredentials) {
        throw new Error('User already exists');
      }

      // Hash the password
      const passwordHash = await this.hashPassword(data.password);

      // Store credentials
      const credentials: EmailAuthCredentials = {
        email: data.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      await this.saveCredentials(data.email, credentials);

      console.log('[EmailAuthService] Sign-up successful for:', data.email);
      return true;
    } catch (error) {
      console.error('[EmailAuthService] Sign-up failed:', error);
      throw error;
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(data: SignInData): Promise<boolean> {
    try {
      console.log('[EmailAuthService] Starting sign-in for:', data.email);

      // Get stored credentials
      const credentials = await this.getCredentials(data.email);
      if (!credentials) {
        throw new Error('User not found');
      }

      // Verify password
      const passwordHash = await this.hashPassword(data.password);
      if (passwordHash !== credentials.passwordHash) {
        throw new Error('Invalid password');
      }

      console.log('[EmailAuthService] Sign-in successful for:', data.email);
      return true;
    } catch (error) {
      console.error('[EmailAuthService] Sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Check if a user exists
   */
  async userExists(email: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(email);
      return credentials !== null;
    } catch (error) {
      console.error('[EmailAuthService] Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Change user password
   */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log('[EmailAuthService] Changing password for:', email);

      // Verify old password
      const signInSuccess = await this.signIn({ email, password: oldPassword });
      if (!signInSuccess) {
        throw new Error('Invalid old password');
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Get existing credentials
      const credentials = await this.getCredentials(email);
      if (!credentials) {
        throw new Error('User not found');
      }

      // Update password hash
      credentials.passwordHash = await this.hashPassword(newPassword);
      await this.saveCredentials(email, credentials);

      console.log('[EmailAuthService] Password changed successfully for:', email);
      return true;
    } catch (error) {
      console.error('[EmailAuthService] Password change failed:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(email: string, password: string): Promise<boolean> {
    try {
      console.log('[EmailAuthService] Deleting account for:', email);

      // Verify password before deletion
      const signInSuccess = await this.signIn({ email, password });
      if (!signInSuccess) {
        throw new Error('Invalid password');
      }

      // Delete credentials
      await this.deleteCredentials(email);

      console.log('[EmailAuthService] Account deleted successfully for:', email);
      return true;
    } catch (error) {
      console.error('[EmailAuthService] Account deletion failed:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * Hash password using SHA256
   */
  private async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  /**
   * Save credentials to secure storage
   */
  private async saveCredentials(email: string, credentials: EmailAuthCredentials): Promise<void> {
    const key = this.getCredentialsKey(email);
    await SecureKeyStorage.saveKey(key, JSON.stringify(credentials));
  }

  /**
   * Get credentials from secure storage
   */
  private async getCredentials(email: string): Promise<EmailAuthCredentials | null> {
    try {
      const key = this.getCredentialsKey(email);
      const credentialsJson = await SecureKeyStorage.getKey(key);
      
      if (!credentialsJson) {
        return null;
      }

      return JSON.parse(credentialsJson);
    } catch (error) {
      console.error('[EmailAuthService] Error getting credentials:', error);
      return null;
    }
  }

  /**
   * Delete credentials from secure storage
   */
  private async deleteCredentials(email: string): Promise<void> {
    const key = this.getCredentialsKey(email);
    await SecureKeyStorage.deleteKey(key);
  }

  /**
   * Generate storage key for email credentials
   */
  private getCredentialsKey(email: string): string {
    // Normalize email to lowercase for consistent storage
    const normalizedEmail = email.toLowerCase().trim();
    return `${AUTH_CREDENTIALS_KEY}_${normalizedEmail}`;
  }
}

export default new EmailAuthService();
