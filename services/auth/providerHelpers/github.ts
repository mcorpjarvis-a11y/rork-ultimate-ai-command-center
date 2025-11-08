/**
 * GitHub OAuth Provider Helper
 * Supports Device Flow for Termux and headless environments
 * Supports standard OAuth flow for mobile
 * Android/Expo/Termux only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'redirect',
});

const DEFAULT_SCOPES = ['read:user', 'user:email'];

/**
 * Start GitHub OAuth authentication flow
 * Uses Device Flow if in Termux environment, otherwise uses standard OAuth
 */
export async function startAuth(additionalScopes: string[] = []): Promise<AuthResponse> {
  // Check if running in Termux (no WebBrowser support)
  const isTermux = Platform.OS === 'android' && !WebBrowser.maybeCompleteAuthSession;
  
  if (isTermux) {
    return startDeviceFlow(additionalScopes);
  } else {
    return startWebFlow(additionalScopes);
  }
}

/**
 * Start Device Flow authentication (for Termux)
 */
async function startDeviceFlow(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[GitHubProvider] Starting Device Flow');

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes].join(' ');

    // Step 1: Request device code
    const deviceResponse = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: scopes,
      }),
    });

    if (!deviceResponse.ok) {
      throw new Error('Failed to request device code');
    }

    const deviceData = await deviceResponse.json();
    const { device_code, user_code, verification_uri, expires_in, interval } = deviceData;

    console.log('[GitHubProvider] Device Flow initiated');
    console.log(`[GitHubProvider] Visit: ${verification_uri}`);
    console.log(`[GitHubProvider] Enter code: ${user_code}`);

    // Step 2: Poll for authorization
    const tokens = await pollForAuthorization(device_code, interval || 5, expires_in || 900);

    // Step 3: Fetch user profile
    const profile = await fetchUserProfile(tokens.access_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      scopes: scopes.split(' '),
      expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
      profile,
    };
  } catch (error) {
    console.error('[GitHubProvider] Device Flow failed:', error);
    throw error;
  }
}

/**
 * Poll for device flow authorization
 */
async function pollForAuthorization(
  deviceCode: string,
  intervalSeconds: number,
  expiresIn: number
): Promise<any> {
  const startTime = Date.now();
  const expiresAt = startTime + (expiresIn * 1000);

  while (Date.now() < expiresAt) {
    await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (data.error === 'authorization_pending') {
        // User hasn't authorized yet, continue polling
        continue;
      } else if (data.error === 'slow_down') {
        // Increase polling interval
        intervalSeconds += 5;
        continue;
      } else if (data.error) {
        throw new Error(`Authorization error: ${data.error}`);
      } else if (data.access_token) {
        console.log('[GitHubProvider] Device authorization successful');
        return data;
      }
    } catch (error) {
      console.error('[GitHubProvider] Polling error:', error);
    }
  }

  throw new Error('Device authorization expired');
}

/**
 * Start standard web-based OAuth flow (for Expo Go, Android APK)
 */
async function startWebFlow(additionalScopes: string[] = []): Promise<AuthResponse> {
  try {
    console.log('[GitHubProvider] Starting web OAuth flow');

    const scopes = [...DEFAULT_SCOPES, ...additionalScopes];

    const request = new AuthSession.AuthRequest({
      clientId: GITHUB_CLIENT_ID,
      scopes,
      redirectUri: REDIRECT_URI,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    });

    console.log('[GitHubProvider] Auth result:', result.type);

    if (result.type === 'success') {
      const code = result.params.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);
      
      // Fetch user profile
      const profile = await fetchUserProfile(tokens.access_token);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        scopes: scopes,
        expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
        profile,
      };
    } else if (result.type === 'error') {
      console.error('[GitHubProvider] Auth error:', result.error);
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[GitHubProvider] Web OAuth failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string): Promise<any> {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    
    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    console.log('[GitHubProvider] Tokens obtained successfully');
    return tokens;
  } catch (error) {
    console.error('[GitHubProvider] Token exchange failed:', error);
    throw error;
  }
}

/**
 * GitHub doesn't support token refresh
 * Tokens are long-lived and don't expire
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  throw new Error('GitHub does not support token refresh. Tokens are long-lived.');
}

/**
 * Revoke access token
 * Note: GitHub requires client_id and client_secret for revocation
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    console.log('[GitHubProvider] Revoking token');

    // GitHub requires authentication to revoke tokens
    // This is best done server-side or the user can revoke in GitHub settings
    console.warn('[GitHubProvider] Token revocation requires client secret. User should revoke in GitHub settings.');
    
  } catch (error) {
    console.error('[GitHubProvider] Token revocation failed:', error);
    throw error;
  }
}

/**
 * Fetch user profile information
 */
async function fetchUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    console.log('[GitHubProvider] User profile fetched:', profile.login);
    return profile;
  } catch (error) {
    console.error('[GitHubProvider] Failed to fetch user profile:', error);
    throw error;
  }
}
