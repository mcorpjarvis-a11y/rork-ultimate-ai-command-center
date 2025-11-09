/**
 * Notion OAuth Provider Helper
 * Uses OAuth 2.0 with PKCE for secure authentication
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

/**
 * Start Notion OAuth authentication flow
 */
export async function startAuth(): Promise<AuthResponse> {
  try {
    console.log('[NotionProvider] Starting authentication flow');

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: USE_PROXY,
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_NOTION_CLIENT_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://api.notion.com/v1/oauth/authorize',
      useProxy: USE_PROXY,
    });

    console.log('[NotionProvider] Auth result:', result.type);

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
        token_type: tokens.token_type,
        workspace_id: tokens.workspace_id,
        workspace_name: tokens.workspace_name,
        bot_id: tokens.bot_id,
        owner: tokens.owner,
        profile,
      };
    } else if (result.type === 'error') {
      console.error('[NotionProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[NotionProvider] Authentication failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<any> {
  try {
    const clientId = process.env.EXPO_PUBLIC_NOTION_CLIENT_ID || 'EXPO_PROXY';
    const clientSecret = process.env.EXPO_PUBLIC_NOTION_CLIENT_SECRET || '';

    // Notion requires Basic Auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[NotionProvider] Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    console.log('[NotionProvider] Tokens obtained successfully');
    return tokens;
  } catch (error) {
    console.error('[NotionProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    console.log('[NotionProvider] User profile fetched:', profile.id);
    return profile;
  } catch (error) {
    console.error('[NotionProvider] Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  console.log('[NotionProvider] Notion does not support token revocation via API');
  console.log('[NotionProvider] User should revoke access in Notion settings');
}
