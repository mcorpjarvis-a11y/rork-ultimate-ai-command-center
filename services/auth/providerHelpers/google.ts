/**
 * Google OAuth Provider Helper
 * Supports PKCE for mobile (Expo Go, Android APK)
 * Partial Device Flow support for Termux
 * Android/Expo/Termux only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use environment variables or fallback to existing config
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 
  '623163723625-f8vjcngl8qvpupeqn3cb0l9vn1u9d09t.apps.googleusercontent.com';

// Note: Client secret should NOT be in production code
// For PKCE flow, client secret is not required
// This is only needed for server-side flows
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'redirect',
});

const DEFAULT_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Start Google OAuth authentication flow
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[GoogleProvider] Starting authentication flow');
    console.log('[GoogleProvider] Platform:', Platform.OS);
    console.log('[GoogleProvider] Redirect URI:', REDIRECT_URI);

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID_ANDROID,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: REDIRECT_URI,
      usePKCE: true,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    console.log('[GoogleProvider] Auth result:', result.type);

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, request.codeVerifier!);
      
      // Fetch user profile
      const profile = await fetchUserProfile(tokens.access_token);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        scopes: scopes,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        profile,
      };
    } else if (result.type === 'error') {
      console.error('[GoogleProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[GoogleProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID_ANDROID,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    // Only add client_secret if available (not needed for PKCE on mobile)
    if (GOOGLE_CLIENT_SECRET) {
      params.append('client_secret', GOOGLE_CLIENT_SECRET);
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleProvider] Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    console.log('[GoogleProvider] Tokens obtained successfully');
    return tokens;
  } catch (error) {
    console.error('[GoogleProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  try {
    console.log('[GoogleProvider] Refreshing access token');

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID_ANDROID,
      refresh_token,
      grant_type: 'refresh_token',
    });

    // Only add client_secret if available
    if (GOOGLE_CLIENT_SECRET) {
      params.append('client_secret', GOOGLE_CLIENT_SECRET);
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleProvider] Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token, // May not be returned
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    };
  } catch (error) {
    console.error('[GoogleProvider] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    console.log('[GoogleProvider] Revoking token');

    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      console.warn('[GoogleProvider] Token revocation may have failed');
    } else {
      console.log('[GoogleProvider] Token revoked successfully');
    }
  } catch (error) {
    console.error('[GoogleProvider] Token revocation failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    console.log('[GoogleProvider] User profile fetched:', profile.email);
    return profile;
  } catch (error) {
    console.error('[GoogleProvider] Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * Get scopes for specific Google services
 */
export function getScopesForService(service: 'drive' | 'youtube' | 'gmail' | 'calendar'): string[] {
  const scopeMap = {
    drive: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
    youtube: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
    ],
    gmail: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    calendar: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  };

  return scopeMap[service] || [];
}
