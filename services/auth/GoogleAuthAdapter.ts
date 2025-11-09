/**
 * GoogleAuthAdapter - Compatibility layer between old and new auth systems
 * Wraps the new AuthManager to maintain backward compatibility
 * Android/Expo/Termux only - NO iOS support
 */

import AuthManager from './AuthManager';
import TokenVault from './TokenVault';

/**
 * GoogleUser type for backward compatibility
 */
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Adapter that makes the new AuthManager API compatible with the old GoogleAuthService API
 * This allows existing code to continue working while migrating to the new system
 */
class GoogleAuthAdapter {
  /**
   * Sign in with Google using the new AuthManager
   */
  async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      const success = await AuthManager.startAuthFlow('google');
      
      if (!success) {
        return null;
      }

      // Get the token to fetch user profile
      const token = await AuthManager.getAccessToken('google');
      
      if (!token) {
        return null;
      }

      // Fetch user profile
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      
      // Get token data for expiry info
      const tokenData = await TokenVault.getToken('google');

      // Return in old GoogleUser format for compatibility
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        givenName: profile.given_name,
        familyName: profile.family_name,
        accessToken: token,
        refreshToken: tokenData?.refresh_token,
        expiresAt: tokenData?.expires_at,
      };
    } catch (error) {
      console.error('[GoogleAuthAdapter] Sign-in error:', error);
      return null;
    }
  }

  /**
   * Get access token using new AuthManager
   */
  async getAccessToken(): Promise<string | null> {
    return await AuthManager.getAccessToken('google');
  }

  /**
   * Refresh access token using new AuthManager
   */
  async refreshAccessToken(): Promise<string | null> {
    return await AuthManager.refreshAccessToken('google');
  }

  /**
   * Get stored tokens in old format for compatibility
   */
  async getStoredTokens(): Promise<GoogleUser | null> {
    try {
      const tokenData = await TokenVault.getToken('google');
      
      if (!tokenData) {
        return null;
      }

      const token = tokenData.access_token;

      // Fetch user profile
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const profile = await response.json();

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        givenName: profile.given_name,
        familyName: profile.family_name,
        accessToken: token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
      };
    } catch (error) {
      console.error('[GoogleAuthAdapter] Failed to get stored tokens:', error);
      return null;
    }
  }

  /**
   * Sign out using new AuthManager
   */
  async signOut(): Promise<void> {
    await AuthManager.revokeProvider('google');
  }

  /**
   * Check if signed in
   */
  async isSignedIn(): Promise<boolean> {
    return await AuthManager.isConnected('google');
  }

  /**
   * Revoke access using new AuthManager
   */
  async revokeAccess(): Promise<void> {
    await AuthManager.revokeProvider('google');
  }

  /**
   * List Drive files (unchanged, uses getAccessToken internally)
   */
  async listDriveFiles(maxResults: number = 10): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Not signed in');
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&fields=files(id,name,mimeType,createdTime,modifiedTime,size)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Drive files');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('[GoogleAuthAdapter] Failed to list Drive files:', error);
      throw error;
    }
  }

  /**
   * Upload to Drive (unchanged, uses getAccessToken internally)
   */
  async uploadToDrive(
    fileName: string,
    content: string,
    mimeType: string = 'text/plain'
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Not signed in');
      }

      const metadata = {
        name: fileName,
        mimeType: mimeType,
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }) as any
      );
      form.append('file', new Blob([content], { type: mimeType }) as any);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload to Drive');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[GoogleAuthAdapter] Failed to upload to Drive:', error);
      throw error;
    }
  }

  /**
   * Download from Drive (unchanged, uses getAccessToken internally)
   */
  async downloadFromDrive(fileId: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Not signed in');
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download from Drive');
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error('[GoogleAuthAdapter] Failed to download from Drive:', error);
      throw error;
    }
  }
}

export default new GoogleAuthAdapter();
