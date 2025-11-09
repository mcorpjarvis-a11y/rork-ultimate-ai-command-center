/**
 * Core types for the authentication system
 * Android/Expo/Termux only - NO iOS support
 */

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expiry?: number; // Unix timestamp in milliseconds
  expires_in?: number; // Seconds until expiration
  expires_at?: number; // Unix timestamp in milliseconds (computed from expires_in)
  token_type?: string;
  scopes?: string[];
  scope?: string; // Raw scope string from provider
  metadata?: Record<string, any>; // Additional metadata from provider
}

export interface MasterProfile {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: string; // ISO 8601 timestamp
  lastLogin?: number; // Unix timestamp in milliseconds
  connectedProviders: string[];
}

export type AuthEvent = 'connected' | 'disconnected' | 'token_refreshed';

export type AuthEventListener = (provider: string, data?: any) => void;

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number; // Unix timestamp in milliseconds
  token_type?: string;
  scope?: string;
  scopes?: string[]; // Array of scope strings (alternative to scope)
  profile?: any;
}

export type ProviderStatus = 'connected' | 'not_connected' | 'needs_reauth';

/**
 * Provider configuration for OAuth flows
 */
export interface ProviderConfig {
  name: string;
  displayName: string;
  authUrl?: string;
  tokenUrl?: string;
  revokeUrl?: string;
  scopes?: string[];
  supportsDeviceFlow?: boolean;
  supportsLocalToken?: boolean; // For smart home devices
  requiresManualSetup?: boolean;
}
