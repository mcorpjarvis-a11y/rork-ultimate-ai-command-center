/**
 * Facebook OAuth Provider Helper
 * Uses Facebook Graph API for authentication and basic profile access
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

const FACEBOOK_SCOPES = [
  'public_profile',
  'email',
  'user_friends',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
];

/**
 * Start Facebook OAuth authentication flow
 */
export async function startAuth(): Promise<AuthResponse> {
  try {
    console.log('[FacebookProvider] Starting authentication flow');

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: FACEBOOK_SCOPES,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: false, // Facebook doesn't support PKCE
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
    });

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      const tokens = await exchangeCodeForTokens(code, redirectUri);
      const profile = await fetchUserProfile(tokens.access_token);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: 'Bearer',
        scope: FACEBOOK_SCOPES.join(' '),
        user: profile,
      };
    } else if (result.type === 'cancel') {
      throw new Error('Authentication cancelled by user');
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('[FacebookProvider] Authentication error:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'EXPO_PROXY';
  const appSecret = process.env.EXPO_PUBLIC_FACEBOOK_APP_SECRET || '';

  const url = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Token exchange failed');
  }

  // Exchange for long-lived token (60 days)
  const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${data.access_token}`;
  
  const longLivedResponse = await fetch(longLivedUrl);
  const longLivedData = await longLivedResponse.json();

  if (!longLivedResponse.ok || longLivedData.error) {
    console.warn('[FacebookProvider] Failed to get long-lived token, using short-lived token');
    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600,
    };
  }

  return {
    access_token: longLivedData.access_token,
    expires_in: longLivedData.expires_in || 5184000, // 60 days default
  };
}

/**
 * Fetch user profile from Facebook Graph API
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to fetch user profile');
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture?.data?.url,
  };
}

/**
 * Refresh access token (Facebook uses long-lived tokens, so this may not be needed often)
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  // Facebook doesn't have traditional refresh tokens for user access tokens
  // Long-lived tokens should be re-exchanged when they expire
  throw new Error('Facebook does not support refresh tokens. Please re-authenticate.');
}

/**
 * Test the connection by fetching user profile
 */
export async function testConnection(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Revoke access token
 */
export async function revokeAccess(accessToken: string): Promise<void> {
  try {
    await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('[FacebookProvider] Failed to revoke access:', error);
    throw error;
  }
}
