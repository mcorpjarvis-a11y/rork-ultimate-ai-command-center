import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  android: '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com',
  ios: '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com',
  web: '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com',
};

const GOOGLE_CLIENT_SECRET = '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';

const STORAGE_KEY = '@google_auth_tokens';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  accessToken: string;
  refreshToken?: string;
}

class GoogleAuthService {
  private redirectUri = AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'redirect',
  });

  private getClientId(): string {
    if (Platform.OS === 'android') {
      return GOOGLE_CLIENT_IDS.android;
    } else if (Platform.OS === 'ios') {
      return GOOGLE_CLIENT_IDS.ios;
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
        responseType: AuthSession.ResponseType.Token,
        redirectUri: this.redirectUri,
        usePKCE: false,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('[GoogleAuthService] Auth result:', result.type);

      if (result.type === 'success') {
        const accessToken = result.params.access_token;
        
        if (!accessToken) {
          throw new Error('No access token received');
        }

        const userInfo = await this.fetchGoogleUserInfo(accessToken);
        
        const googleUser: GoogleUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          accessToken,
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

  async getStoredTokens(): Promise<GoogleUser | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      console.log('[GoogleAuthService] Tokens saved');
    } catch (error) {
      console.error('[GoogleAuthService] Failed to save tokens:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[GoogleAuthService] Signed out');
    } catch (error) {
      console.error('[GoogleAuthService] Sign-out error:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getStoredTokens();
    return tokens?.accessToken || null;
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
