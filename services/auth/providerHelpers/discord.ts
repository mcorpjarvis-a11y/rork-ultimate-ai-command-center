/**
 * Discord OAuth Provider Helper
 * Supports PKCE for mobile
 * Android/Expo/Termux only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

const DISCORD_CLIENT_ID = process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.EXPO_PUBLIC_DISCORD_CLIENT_SECRET || '';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'redirect',
});

const DEFAULT_SCOPES = ['identify', 'email'];

/**
 * Start Discord OAuth authentication flow
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[DiscordProvider] Starting authentication flow');

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    const request = new AuthSession.AuthRequest({
      clientId: DISCORD_CLIENT_ID,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: REDIRECT_URI,
      usePKCE: true,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
    });

    console.log('[DiscordProvider] Auth result:', result.type);

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
      console.error('[DiscordProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[DiscordProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    // Add client secret if available (not required for PKCE)
    if (DISCORD_CLIENT_SECRET) {
      params.append('client_secret', DISCORD_CLIENT_SECRET);
    }

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[DiscordProvider] Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    console.log('[DiscordProvider] Tokens obtained successfully');
    return tokens;
  } catch (error) {
    console.error('[DiscordProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  try {
    console.log('[DiscordProvider] Refreshing access token');

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      refresh_token,
      grant_type: 'refresh_token',
    });

    if (DISCORD_CLIENT_SECRET) {
      params.append('client_secret', DISCORD_CLIENT_SECRET);
    }

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[DiscordProvider] Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    };
  } catch (error) {
    console.error('[DiscordProvider] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    console.log('[DiscordProvider] Revoking token');

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      token,
    });

    if (DISCORD_CLIENT_SECRET) {
      params.append('client_secret', DISCORD_CLIENT_SECRET);
    }

    const response = await fetch('https://discord.com/api/oauth2/token/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.warn('[DiscordProvider] Token revocation may have failed');
    } else {
      console.log('[DiscordProvider] Token revoked successfully');
    }
  } catch (error) {
    console.error('[DiscordProvider] Token revocation failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    console.log('[DiscordProvider] User profile fetched:', profile.username);
    return profile;
  } catch (error) {
    console.error('[DiscordProvider] Failed to fetch user profile:', error);
    throw error;
  }
}
