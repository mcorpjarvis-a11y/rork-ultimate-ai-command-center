/**
 * YouTube OAuth Provider Helper
 * Uses Google OAuth with YouTube-specific scopes
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth (no manual client ID needed)
const USE_PROXY = true;

const YOUTUBE_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtubepartner',
];

/**
 * Start YouTube OAuth authentication flow
 */
export async function startAuth(): Promise<AuthResponse> {
  try {
    console.log('[YouTubeProvider] Starting authentication flow');

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
    });

    // Use Expo proxy client ID
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '');

    // Get Google's discovery document
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: YOUTUBE_SCOPES,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: USE_PROXY,
    });

    const result = discovery
      ? await request.promptAsync(discovery, {})
      : await request.promptAsync({} as any, {});

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      const tokens = await exchangeCodeForTokens(code, request.codeVerifier!, redirectUri);
      const profile = await fetchUserProfile(tokens.access_token);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        scopes: YOUTUBE_SCOPES,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        profile,
      };
    } else if (result.type === 'error') {
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[YouTubeProvider] Authentication failed:', error);
    throw error;
  }
}

async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<any> {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 'EXPO_PROXY';
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

async function fetchUserProfile(accessToken: string): Promise<any> {
  const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube channel info');
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for this account');
  }

  const channel = data.items[0];
  
  return {
    id: channel.id,
    username: channel.snippet.title,
    displayName: channel.snippet.title,
    email: null, // YouTube API doesn't provide email directly
    avatar: channel.snippet.thumbnails.default.url,
    subscribers: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
    viewCount: channel.statistics.viewCount,
  };
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 'EXPO_PROXY';
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Revoke access token
 */
export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
    method: 'POST',
  });
}
