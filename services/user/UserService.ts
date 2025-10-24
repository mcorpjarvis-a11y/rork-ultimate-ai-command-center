import APIClient from '@/services/core/APIClient';
import StorageManager from '@/services/storage/StorageManager';
import { User, UserPreferences, VoiceSettings } from '@/types/models.types';
import GoogleAuthService, { GoogleUser } from '@/services/auth/GoogleAuthService';

class UserService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    try {
      const user = await StorageManager.get<User>('current_user');
      if (user) {
        this.currentUser = user;
        console.log('[UserService] Loaded user:', user.email);
      }
    } catch (error) {
      console.error('[UserService] Failed to load user:', error);
    }
  }

  private async saveUser(): Promise<void> {
    if (this.currentUser) {
      try {
        await StorageManager.set('current_user', this.currentUser);
      } catch (error) {
        console.error('[UserService] Failed to save user:', error);
      }
    }
  }

  async login(email: string, password: string): Promise<User> {
    console.log('[UserService] Logging in...');

    try {
      const response = await APIClient.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }

      this.currentUser = response.data.user;
      APIClient.setAuthToken(response.data.token);
      await this.saveUser();

      console.log('[UserService] Login successful');
      return response.data.user;
    } catch (error) {
      console.error('[UserService] Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    console.log('[UserService] Registering new user...');

    try {
      const response = await APIClient.post<{ user: User; token: string }>('/auth/register', {
        email,
        password,
        displayName,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Registration failed');
      }

      this.currentUser = response.data.user;
      APIClient.setAuthToken(response.data.token);
      await this.saveUser();

      console.log('[UserService] Registration successful');
      return response.data.user;
    } catch (error) {
      console.error('[UserService] Registration error:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    console.log('[UserService] Logging in with Google...');

    try {
      const googleUser = await GoogleAuthService.signInWithGoogle();
      
      if (!googleUser) {
        throw new Error('Google sign-in cancelled');
      }

      const user: User = {
        id: googleUser.id,
        email: googleUser.email,
        displayName: googleUser.name,
        avatarUrl: googleUser.picture,
        tier: 'free',
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: true,
            push: true,
            sms: false,
            webhooks: [],
          },
          voiceSettings: {
            enabled: true,
            voice: 'jarvis',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
            wakeWord: 'jarvis',
          },
        },
        stats: {
          totalContent: 0,
          totalRevenue: 0,
          totalViews: 0,
          totalEngagement: 0,
          contentCreated: 0,
          aiInteractions: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.currentUser = user;
      APIClient.setAuthToken(googleUser.accessToken);
      await this.saveUser();

      try {
        const response = await APIClient.post<{ user: User; token: string }>('/auth/google', {
          googleToken: googleUser.accessToken,
          user,
        });

        if (response.success && response.data) {
          this.currentUser = response.data.user;
          APIClient.setAuthToken(response.data.token);
          await this.saveUser();
          console.log('[UserService] Google login synced with backend');
          return response.data.user;
        }
      } catch {
        console.log('[UserService] Backend sync failed, using local user data');
      }

      console.log('[UserService] Google login successful');
      return user;
    } catch (error) {
      console.error('[UserService] Google login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('[UserService] Logging out...');

    try {
      await APIClient.post('/auth/logout', {});
    } catch (error) {
      console.error('[UserService] Logout error:', error);
    }

    await GoogleAuthService.signOut();
    
    this.currentUser = null;
    APIClient.removeAuthToken();
    await StorageManager.remove('current_user');
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Updating profile...');

    const updated: User = {
      ...this.currentUser,
      ...updates,
      id: this.currentUser.id,
      updatedAt: Date.now(),
    };

    try {
      const response = await APIClient.put<User>('/user/profile', updated);

      if (response.success && response.data) {
        this.currentUser = response.data;
        await this.saveUser();
        return response.data;
      }
    } catch (error) {
      console.error('[UserService] Profile update error:', error);
    }

    this.currentUser = updated;
    await this.saveUser();
    return updated;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Updating preferences...');

    return this.updateProfile({
      preferences: {
        ...this.currentUser.preferences,
        ...preferences,
      },
    });
  }

  async updateVoiceSettings(voiceSettings: Partial<VoiceSettings>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Updating voice settings...');

    return this.updatePreferences({
      voiceSettings: {
        ...this.currentUser.preferences.voiceSettings,
        ...voiceSettings,
      },
    });
  }

  async refreshStats(): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Refreshing stats...');

    try {
      const response = await APIClient.get<User>('/user/stats');

      if (response.success && response.data) {
        this.currentUser = {
          ...this.currentUser,
          stats: response.data.stats,
          updatedAt: Date.now(),
        };
        await this.saveUser();
        return this.currentUser;
      }
    } catch (error) {
      console.error('[UserService] Stats refresh error:', error);
    }

    return this.currentUser;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Changing password...');

    try {
      const response = await APIClient.post('/user/change-password', {
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Password change failed');
      }

      console.log('[UserService] Password changed successfully');
    } catch (error) {
      console.error('[UserService] Password change error:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('[UserService] Deleting account...');

    try {
      const response = await APIClient.delete('/user/account');

      if (!response.success) {
        throw new Error(response.error?.message || 'Account deletion failed');
      }

      await this.logout();
      console.log('[UserService] Account deleted successfully');
    } catch (error) {
      console.error('[UserService] Account deletion error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  getUserTier(): 'free' | 'pro' | 'enterprise' {
    return this.currentUser?.tier || 'free';
  }

  getPreferences(): UserPreferences | null {
    return this.currentUser?.preferences || null;
  }

  getVoiceSettings(): VoiceSettings | null {
    return this.currentUser?.preferences?.voiceSettings || null;
  }

  async getGoogleUser(): Promise<GoogleUser | null> {
    return await GoogleAuthService.getStoredTokens();
  }

  async isGoogleSignedIn(): Promise<boolean> {
    return await GoogleAuthService.isSignedIn();
  }

  async getGoogleAccessToken(): Promise<string | null> {
    return await GoogleAuthService.getAccessToken();
  }
}

export default new UserService();
