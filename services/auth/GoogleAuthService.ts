import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import SecureKeyStorage from '@/services/security/SecureKeyStorage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  android: '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com',
  web: '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com',
};

const GOOGLE_CLIENT_SECRET = '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';

const STORAGE_KEY = 'google_auth_tokens';

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

class GoogleAuthService {
  private redirectUri = AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'redirect',
  });

  private getClientId(): string {
    if (Platform.OS === 'android') {
      return GOOGLE_CLIENT_IDS.android;
    } else {
      return GOOGLE_CLIENT_IDS.web;
    }
  }

  async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      console.log('[GoogleAuthService] Starting Google Sign-In...');
      console.log('[GoogleAuthService] Redirect URI:', this.redirectUri);
      console.log('[GoogleAuthService] Platform:', Platform.OS);

      const clientId = this.getClientId();
      
      if (!clientId) {
        console.error('[GoogleAuthService] No client ID configured for this platform');
        throw new Error('Google OAuth not configured. Please add client ID in environment variables.');
      }

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.appdata',
        ],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: this.redirectUri,
        usePKCE: true,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('[GoogleAuthService] Auth result:', result.type);

      if (result.type === 'success') {
        const code = result.params.code;
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        const tokens = await this.exchangeCodeForTokens(code, request.codeVerifier!);
        
        const userInfo = await this.fetchGoogleUserInfo(tokens.access_token);
        
        const googleUser: GoogleUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
        };

        await this.saveTokens(googleUser);
        
        console.log('[GoogleAuthService] Sign-in successful:', googleUser.email);
        return googleUser;
      } else if (result.type === 'error') {
        console.error('[GoogleAuthService] Auth error:', result.error);
        throw new Error(result.error?.message || 'Authentication failed');
      } else {
        console.log('[GoogleAuthService] Auth cancelled by user');
        return null;
      }
    } catch (error) {
      console.error('[GoogleAuthService] Sign-in error:', error);
      throw error;
    }
  }

  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      console.log('[GoogleAuthService] User info fetched:', userInfo.email);
      return userInfo;
    } catch (error) {
      console.error('[GoogleAuthService] Failed to fetch user info:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
    try {
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      
      const params = new URLSearchParams({
        code,
        client_id: this.getClientId(),
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GoogleAuthService] Token exchange error:', error);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();
      console.log('[GoogleAuthService] Tokens obtained');
      return tokens;
    } catch (error) {
      console.error('[GoogleAuthService] Token exchange failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const stored = await this.getStoredTokens();
      
      if (!stored || !stored.refreshToken) {
        console.log('[GoogleAuthService] No refresh token available');
        return null;
      }

      const params = new URLSearchParams({
        client_id: this.getClientId(),
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: stored.refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error('[GoogleAuthService] Token refresh failed');
        return null;
      }

      const tokens = await response.json();
      
      // Update stored tokens
      const updatedUser: GoogleUser = {
        ...stored,
        accessToken: tokens.access_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      };

      await this.saveTokens(updatedUser);
      
      console.log('[GoogleAuthService] Access token refreshed');
      return tokens.access_token;
    } catch (error) {
      console.error('[GoogleAuthService] Token refresh error:', error);
      return null;
    }
  }

  async getStoredTokens(): Promise<GoogleUser | null> {
    try {
      const stored = await SecureKeyStorage.getKey(STORAGE_KEY);
      if (stored) {
        const googleUser = JSON.parse(stored);
        console.log('[GoogleAuthService] Loaded stored tokens for:', googleUser.email);
        return googleUser;
      }
      return null;
    } catch (error) {
      console.error('[GoogleAuthService] Failed to load stored tokens:', error);
      return null;
    }
  }

  private async saveTokens(googleUser: GoogleUser): Promise<void> {
    try {
      await SecureKeyStorage.saveKey(STORAGE_KEY, JSON.stringify(googleUser));
      console.log('[GoogleAuthService] Tokens saved securely');
    } catch (error) {
      console.error('[GoogleAuthService] Failed to save tokens:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await SecureKeyStorage.deleteKey(STORAGE_KEY);
      console.log('[GoogleAuthService] Signed out');
    } catch (error) {
      console.error('[GoogleAuthService] Sign-out error:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getStoredTokens();
    
    if (!tokens) {
      return null;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (tokens.expiresAt && tokens.expiresAt < Date.now() + 300000) {
      console.log('[GoogleAuthService] Token expired or about to expire, refreshing...');
      return await this.refreshAccessToken();
    }

    return tokens.accessToken;
  }

  async isSignedIn(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    return tokens !== null;
  }

  async revokeAccess(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens();
      
      if (tokens?.accessToken) {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${tokens.accessToken}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
      }

      await this.signOut();
      console.log('[GoogleAuthService] Access revoked');
    } catch (error) {
      console.error('[GoogleAuthService] Failed to revoke access:', error);
      await this.signOut();
    }
  }

  getRedirectUri(): string {
    return this.redirectUri;
  }

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
      console.log('[GoogleAuthService] Fetched Drive files:', data.files?.length || 0);
      return data.files || [];
    } catch (error) {
      console.error('[GoogleAuthService] Failed to list Drive files:', error);
      throw error;
    }
  }

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
      console.log('[GoogleAuthService] Uploaded to Drive:', result.id);
      return result;
    } catch (error) {
      console.error('[GoogleAuthService] Failed to upload to Drive:', error);
      throw error;
    }
  }

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
      console.log('[GoogleAuthService] Downloaded from Drive:', fileId);
      return content;
    } catch (error) {
      console.error('[GoogleAuthService] Failed to download from Drive:', error);
      throw error;
    }
  }
}

export default new GoogleAuthService();
