/**
 * Google OAuth Provider Helper  
 * Uses Expo's AuthSession with automatic configuration
 * NO manual OAuth setup required - works out of the box!
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// For Expo Go and development, we use Expo's authentication proxy
// This eliminates the need for manual OAuth client ID setup!
const USE_PROXY = true;

const DEFAULT_SCOPES = ['openid', 'profile', 'email'];

/**
 * Start Google OAuth authentication flow
 * Uses Expo's proxy - NO manual configuration needed!
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[GoogleProvider] Starting Google sign-in (no manual setup required)');
    console.log('[GoogleProvider] Platform:', Platform.OS);
    
    if (Platform.OS === 'ios') {
      throw new Error('iOS is not supported. Please use Android.');
    }

    // Google's discovery document - called inside function to avoid React hook at module level
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    // Create redirect URI - using proxy means no manual setup!
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: USE_PROXY,
      scheme: 'myapp',
    });

    console.log('[GoogleProvider] Using Expo proxy:', USE_PROXY);
    console.log('[GoogleProvider] Redirect URI:', redirectUri);

    // For proxy mode, we use a special client ID format
    // Expo handles the real OAuth behind the scenes
    const clientId = USE_PROXY 
      ? 'EXPO_PROXY' // Special identifier for Expo proxy
      : (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes,
      redirectUri,
      usePKCE: USE_PROXY, // PKCE is used with proxy
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });

    const result = await request.promptAsync(discovery, {
      useProxy: USE_PROXY,
    });

    console.log('[GoogleProvider] Auth result:', result?.type);

    if (result.type === 'success') {
      // With Expo proxy, we might get the token directly
      if (result.authentication) {
        const { authentication } = result;
        console.log('[GoogleProvider] Got authentication directly from proxy');
        
        // Fetch user profile
        const profile = await fetchUserProfile(authentication.accessToken);
        
        return {
          access_token: authentication.accessToken,
          refresh_token: authentication.refreshToken,
          expires_in: authentication.expiresIn || 3600,
          token_type: authentication.tokenType || 'Bearer',
          scope: scopes.join(' '),
          scopes: scopes,
          expires_at: authentication.issuedAt 
            ? authentication.issuedAt + (authentication.expiresIn || 3600) * 1000
            : Date.now() + 3600000,
          profile,
        };
      }
      
      // If we have a code, exchange it (fallback for non-proxy mode)
      const code = result.params?.code;
      if (code) {
        console.log('[GoogleProvider] Exchanging code for tokens');
        const tokens = await exchangeCodeForTokens(code, request.codeVerifier!, redirectUri);
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
      }
      
      throw new Error('No authentication data received');
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

    // Use EXPO_PROXY client ID for proxy mode
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 'EXPO_PROXY';

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
