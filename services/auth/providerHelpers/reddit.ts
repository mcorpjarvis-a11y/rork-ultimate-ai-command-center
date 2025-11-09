/**
 * Reddit OAuth Provider Helper
 * Uses "installed app" flow for mobile
 * Android/Expo/Termux only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

const DEFAULT_SCOPES = ['identity', 'read', 'submit'];

/**
 * Start Reddit OAuth authentication flow
 * Reddit supports "installed app" type for mobile
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[RedditProvider] Starting authentication flow');

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: USE_PROXY,
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_REDDIT_CLIENT_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: false, // Reddit doesn't require PKCE for installed apps
      extraParams: {
        duration: 'permanent', // Request refresh token
      },
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize',
      useProxy: USE_PROXY,
    });

    console.log('[RedditProvider] Auth result:', result.type);

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, redirectUri);
      
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
      console.error('[RedditProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[RedditProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
  try {
    const clientId = process.env.EXPO_PUBLIC_REDDIT_CLIENT_ID || 'EXPO_PROXY';
    
    // Reddit requires Basic Auth with client_id as username and empty password
    const credentials = btoa(`${clientId}:`);

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[RedditProvider] Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    console.log('[RedditProvider] Tokens obtained successfully');
    return tokens;
  } catch (error) {
    console.error('[RedditProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  try {
    console.log('[RedditProvider] Refreshing access token');

    const clientId = process.env.EXPO_PUBLIC_REDDIT_CLIENT_ID || 'EXPO_PROXY';
    const credentials = btoa(`${clientId}:`);

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    });

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[RedditProvider] Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    };
  } catch (error) {
    console.error('[RedditProvider] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    console.log('[RedditProvider] Revoking token');

    const clientId = process.env.EXPO_PUBLIC_REDDIT_CLIENT_ID || 'EXPO_PROXY';
    const credentials = btoa(`${clientId}:`);

    const params = new URLSearchParams({
      token,
      token_type_hint: 'access_token',
    });

    const response = await fetch('https://www.reddit.com/api/v1/revoke_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.warn('[RedditProvider] Token revocation may have failed');
    } else {
      console.log('[RedditProvider] Token revoked successfully');
    }
  } catch (error) {
    console.error('[RedditProvider] Token revocation failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RORK-AI-Command-Center/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    console.log('[RedditProvider] User profile fetched:', profile.name);
    return profile;
  } catch (error) {
    console.error('[RedditProvider] Failed to fetch user profile:', error);
    throw error;
  }
}
