/**
 * Slack OAuth Provider Helper
 * Uses OAuth 2.0 with OpenID Connect
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

const SLACK_SCOPES = [
  'openid',
  'profile',
  'email',
  'channels:read',
  'channels:write',
  'chat:write',
  'users:read',
];

/**
 * Start Slack OAuth authentication flow
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[SlackProvider] Starting authentication flow');

    const scopes = [...SLACK_SCOPES, ...additionalScopes];

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_SLACK_CLIENT_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: true,
      extraParams: {
        user_scope: scopes.join(','),
      },
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
    });

    console.log('[SlackProvider] Auth result:', result.type);

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, request.codeVerifier!, redirectUri);
      
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
        metadata: {
          team_id: tokens.team?.id,
          team_name: tokens.team?.name,
        },
        profile,
      };
    } else if (result.type === 'error') {
      console.error('[SlackProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[SlackProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<any> {
  try {
    const clientId = process.env.EXPO_PUBLIC_SLACK_CLIENT_ID || 'EXPO_PROXY';
    const clientSecret = process.env.EXPO_PUBLIC_SLACK_CLIENT_SECRET || '';

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SlackProvider] Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Token exchange failed');
    }

    console.log('[SlackProvider] Tokens obtained successfully');
    return data;
  } catch (error) {
    console.error('[SlackProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  try {
    console.log('[SlackProvider] Refreshing access token');

    const clientId = process.env.EXPO_PUBLIC_SLACK_CLIENT_ID || 'EXPO_PROXY';
    const clientSecret = process.env.EXPO_PUBLIC_SLACK_CLIENT_SECRET || '';

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SlackProvider] Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      expires_at: Date.now() + (data.expires_in * 1000),
    };
  } catch (error) {
    console.error('[SlackProvider] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    console.log('[SlackProvider] Revoking token');

    const response = await fetch('https://slack.com/api/auth.revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
      }).toString(),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.warn('[SlackProvider] Token revocation may have failed:', data.error);
    } else {
      console.log('[SlackProvider] Token revoked successfully');
    }
  } catch (error) {
    console.error('[SlackProvider] Token revocation failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://slack.com/api/users.identity', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch user profile');
    }

    console.log('[SlackProvider] User profile fetched:', data.user.id);
    return data.user;
  } catch (error) {
    console.error('[SlackProvider] Failed to fetch user profile:', error);
    throw error;
  }
}
