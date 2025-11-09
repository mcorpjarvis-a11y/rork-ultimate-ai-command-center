/**
 * Instagram OAuth Provider Helper
 * Uses Facebook Graph API for Instagram Business/Creator accounts
 * Android/Expo only - NO iOS support
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthResponse } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Use Expo proxy for OAuth
const USE_PROXY = true;

const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement',
];

/**
 * Start Instagram OAuth authentication flow
 */
export async function startAuth(): Promise<AuthResponse> {
  try {
    console.log('[InstagramProvider] Starting authentication flow');

    // Create redirect URI using proxy
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: USE_PROXY,
      scheme: 'myapp',
    });

    // Use client ID or proxy
    const clientId = USE_PROXY ? 'EXPO_PROXY' : (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '');

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: INSTAGRAM_SCOPES,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: false, // Facebook doesn't support PKCE
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      useProxy: USE_PROXY,
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
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        profile,
      };
    } else if (result.type === 'error') {
      throw new Error(result.error?.message || 'Authentication failed');
    } else {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('[InstagramProvider] Authentication failed:', error);
    throw error;
  }
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'EXPO_PROXY';
  const appSecret = process.env.EXPO_PUBLIC_FACEBOOK_APP_SECRET || '';
  
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
  
  const tokenResponse = await fetch(url);

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await tokenResponse.json();
  
  // Exchange short-lived token for long-lived token
  const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${data.access_token}`;
  
  const longLivedResponse = await fetch(longLivedUrl);
  if (!longLivedResponse.ok) {
    return data; // Return short-lived token if long-lived exchange fails
  }

  return await longLivedResponse.json();
}

async function fetchUserProfile(accessToken: string): Promise<any> {
  // Get Facebook user's pages (connected Instagram accounts)
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
  );

  if (!pagesResponse.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const pagesData = await pagesResponse.json();
  
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error('No Facebook pages found');
  }

  // Get Instagram Business Account for first page
  const pageId = pagesData.data[0].id;
  const pageAccessToken = pagesData.data[0].access_token;
  
  const igResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`,
  );

  if (!igResponse.ok) {
    throw new Error('Failed to fetch Instagram account');
  }

  const igData = await igResponse.json();
  
  if (!igData.instagram_business_account) {
    throw new Error('No Instagram Business Account connected to this page');
  }

  const igAccountId = igData.instagram_business_account.id;

  // Get Instagram profile info
  const profileResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${pageAccessToken}`,
  );

  if (!profileResponse.ok) {
    throw new Error('Failed to fetch Instagram profile');
  }

  const profile = await profileResponse.json();
  
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.name,
    avatar: profile.profile_picture_url,
    followers: profile.followers_count,
    following: profile.follows_count,
    posts: profile.media_count,
    pageAccessToken, // Store for API calls
  };
}

/**
 * Refresh access token
 * Facebook tokens don't have traditional refresh - need to exchange for long-lived
 */
export async function refreshToken(accessToken: string): Promise<AuthResponse> {
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Revoke access token
 */
export async function revokeToken(accessToken: string): Promise<void> {
  await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`, {
    method: 'DELETE',
  });
}
