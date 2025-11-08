/**
 * Provider Configuration Registry
 * Defines all supported providers and their capabilities
 * Android/Expo/Termux only - NO iOS support
 */

import { ProviderConfig } from '../types';

export const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    name: 'google',
    displayName: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    scopes: ['openid', 'profile', 'email'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['read:user', 'user:email'],
    supportsDeviceFlow: true,
    supportsLocalToken: false,
  },
  discord: {
    name: 'discord',
    displayName: 'Discord',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    revokeUrl: 'https://discord.com/api/oauth2/token/revoke',
    scopes: ['identify', 'email'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  reddit: {
    name: 'reddit',
    displayName: 'Reddit',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scopes: ['identity', 'read'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    scopes: ['user-read-email', 'user-read-private'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter / X',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'users.read', 'offline.access'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  huggingface: {
    name: 'huggingface',
    displayName: 'Hugging Face',
    authUrl: 'https://huggingface.co/oauth/authorize',
    tokenUrl: 'https://huggingface.co/oauth/token',
    scopes: ['read'],
    supportsDeviceFlow: false,
    supportsLocalToken: true, // Supports PAT as alternative
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['users:read', 'chat:write'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  notion: {
    name: 'notion',
    displayName: 'Notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  // Smart Home Providers
  homeassistant: {
    name: 'homeassistant',
    displayName: 'Home Assistant',
    supportsDeviceFlow: false,
    supportsLocalToken: true,
    requiresManualSetup: true,
  },
  philipshue: {
    name: 'philipshue',
    displayName: 'Philips Hue',
    supportsDeviceFlow: false,
    supportsLocalToken: true,
    requiresManualSetup: true,
  },
  tuya: {
    name: 'tuya',
    displayName: 'Tuya Smart Home',
    authUrl: 'https://openapi.tuyaus.com',
    tokenUrl: 'https://openapi.tuyaus.com/v1.0/token',
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  // Additional services that can use Google OAuth
  youtube: {
    name: 'youtube',
    displayName: 'YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    supportsDeviceFlow: false,
    supportsLocalToken: false,
  },
};

/**
 * Get provider configuration by name
 */
export function getProvider(name: string): ProviderConfig | undefined {
  return PROVIDERS[name.toLowerCase()];
}

/**
 * Get all provider names
 */
export function getAllProviderNames(): string[] {
  return Object.keys(PROVIDERS);
}

/**
 * Get providers that support device flow
 */
export function getDeviceFlowProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS).filter(p => p.supportsDeviceFlow);
}

/**
 * Get providers that support local tokens
 */
export function getLocalTokenProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS).filter(p => p.supportsLocalToken);
}
