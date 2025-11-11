/**
 * Google OAuth Provider Helper  
 * Uses Expo's AuthSession with automatic configuration
 * NO manual OAuth setup required - works out of the box!
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Get Google OAuth client ID from app configuration
const googleClientId = Constants.expoConfig?.extra?.googleOAuthClientId;

// For Expo Go and development, we use Expo's authentication proxy
// This eliminates the need for manual OAuth client ID setup!
const USE_PROXY = true;

const DEFAULT_SCOPES = ['openid', 'profile', 'email'];

// Google OAuth discovery endpoints
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Start Google OAuth authentication flow
 * Uses Expo's proxy - NO manual configuration needed!
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[GoogleProvider] Starting Google sign-in');
    console.log('[GoogleProvider] Platform:', Platform.OS);
    console.log('[GoogleProvider] Client ID from config:', googleClientId ? 'configured' : 'missing');
    
    if (Platform.OS === 'ios') {
      throw new Error('iOS is not supported. Please use Android.');
    }

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    // Create redirect URI using Expo proxy for better compatibility
    const redirectUri = AuthSession.makeRedirectUri({ 
      useProxy: true,
    });

    console.log('[GoogleProvider] Using Expo proxy:', USE_PROXY);
    console.log('[GoogleProvider] Redirect URI:', redirectUri);

    // Use the client ID from app configuration or fallback to environment variable
    const clientId = googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
    
    if (!clientId) {
      throw new Error('Google OAuth client ID not configured. Please set it in app.json extra.googleOAuthClientId');
    }

    console.log('[GoogleProvider] Using client ID:', clientId.substring(0, 20) + '...');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });

    // Use static discovery endpoints instead of useAutoDiscovery hook
    const result = await request.promptAsync(GOOGLE_DISCOVERY, { useProxy: USE_PROXY });

    console.log('[GoogleProvider] Auth result:', result?.type);

    if (result.type === 'success') {
      console.log('[GoogleProvider] Authentication successful');
      
      // With ResponseType.Token, we get the token directly in params
      const accessToken = result.params?.access_token;
      const tokenType = result.params?.token_type || 'Bearer';
      const expiresIn = result.params?.expires_in ? parseInt(result.params.expires_in, 10) : 3600;
      const scope = result.params?.scope;
      
      if (!accessToken) {
        throw new Error('No access token received from OAuth flow');
      }
      
      console.log('[GoogleProvider] Access token obtained');
      
      // Fetch user profile
      const profile = await fetchUserProfile(accessToken);
      
      return {
        access_token: accessToken,
        refresh_token: result.params?.refresh_token,
        expires_in: expiresIn,
        token_type: tokenType,
        scope: scope || scopes.join(' '),
        scopes: scopes,
        expires_at: Date.now() + (expiresIn * 1000),
        profile,
      };
    } else if (result.type === 'error') {
      console.error('[GoogleProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else if (result.type === 'dismiss' || result.type === 'cancel') {
      throw new Error('You cancelled the sign-in');
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('[GoogleProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens (fallback for non-proxy mode)
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<any> {
  try {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
    
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

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

    // Use the configured client ID
    const clientId = googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
    
    if (!clientId) {
      throw new Error('Google OAuth client ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      refresh_token,
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
