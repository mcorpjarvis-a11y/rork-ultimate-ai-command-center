/**
 * Twitter/X OAuth Provider Helper
 * Uses Twitter OAuth 2.0 with PKCE
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

const TWITTER_SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'follows.read',
  'follows.write',
  'offline.access',
  'space.read',
  'mute.read',
  'mute.write',
  'like.read',
  'like.write',
  'list.read',
  'list.write',
  'bookmark.read',
  'bookmark.write',
];

/**
 * Start Twitter OAuth 2.0 authentication flow with PKCE
 */
export async function startAuth(): Promise<AuthResponse> {
  try {
    console.log('[TwitterProvider] Starting authentication flow');

    // Generate PKCE challenge
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: TWITTER_SCOPES,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: false, // We're handling PKCE manually
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
    });

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
      const profile = await fetchUserProfile(tokens.access_token);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        scopes: TWITTER_SCOPES,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        profile,
      };
    } else if (result.type === 'error') {
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[TwitterProvider] Authentication failed:', error);
    throw error;
  }
}

async function generateCodeVerifier(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return base64URLEncode(randomBytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier
  );
  return base64URLEncode(digest);
}

function base64URLEncode(str: string | Uint8Array): string {
  let base64: string;
  
  if (typeof str === 'string') {
    base64 = Buffer.from(str).toString('base64');
  } else {
    base64 = Buffer.from(str).toString('base64');
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<any> {
  const clientId = process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || 'EXPO_PROXY';
  const clientSecret = process.env.EXPO_PUBLIC_TWITTER_CLIENT_SECRET || '';
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

async function fetchUserProfile(accessToken: string): Promise<any> {
  const response = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics,description,verified',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Twitter profile');
  }

  const data = await response.json();
  const user = data.data;
  
  return {
    id: user.id,
    username: user.username,
    displayName: user.name,
    avatar: user.profile_image_url,
    bio: user.description,
    verified: user.verified,
    followers: user.public_metrics?.followers_count || 0,
    following: user.public_metrics?.following_count || 0,
    tweets: user.public_metrics?.tweet_count || 0,
  };
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const clientId = process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || 'EXPO_PROXY';
  const clientSecret = process.env.EXPO_PUBLIC_TWITTER_CLIENT_SECRET || '';
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
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
  const clientId = process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || 'EXPO_PROXY';
  const clientSecret = process.env.EXPO_PUBLIC_TWITTER_CLIENT_SECRET || '';
  
  await fetch('https://api.twitter.com/2/oauth2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      token,
      token_type_hint: 'access_token',
    }).toString(),
  });
}
