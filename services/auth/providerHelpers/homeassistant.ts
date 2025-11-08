/**
 * Home Assistant Provider Helper
 * Supports Local Long-Lived Access Token (LLAT)
 * Android/Expo/Termux only - NO iOS support
 */

import { AuthResponse } from '../types';

/**
 * Home Assistant uses local tokens, not OAuth
 * This helper validates and formats the token for storage
 */
export async function startAuth(): Promise<AuthResponse> {
  throw new Error(
    'Home Assistant requires a Long-Lived Access Token. Use addLocalToken() with your LLAT from Home Assistant settings.'
  );
}

/**
 * Validate a Home Assistant token
 * @param token - Long-Lived Access Token
 * @param baseUrl - Home Assistant instance URL (e.g., http://homeassistant.local:8123)
 */
export async function validateToken(token: string, baseUrl: string): Promise<boolean> {
  try {
    console.log('[HomeAssistantProvider] Validating token');

    const response = await fetch(`${baseUrl}/api/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[HomeAssistantProvider] Token validation failed:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('[HomeAssistantProvider] Token validated successfully:', data.message);
    return true;
  } catch (error) {
    console.error('[HomeAssistantProvider] Token validation error:', error);
    return false;
  }
}

/**
 * Home Assistant tokens don't expire, but this can be used to check validity
 */
export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  throw new Error('Home Assistant tokens do not support refresh. Generate a new LLAT if needed.');
}

/**
 * Revoke is done through Home Assistant UI
 */
export async function revokeToken(token: string): Promise<void> {
  console.log('[HomeAssistantProvider] Token should be revoked through Home Assistant settings');
}

/**
 * Get services list from Home Assistant to verify connection
 */
export async function getServices(token: string, baseUrl: string): Promise<any> {
  try {
    const response = await fetch(`${baseUrl}/api/services`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }

    const services = await response.json();
    console.log('[HomeAssistantProvider] Services fetched successfully');
    return services;
  } catch (error) {
    console.error('[HomeAssistantProvider] Failed to fetch services:', error);
    throw error;
  }
}

/**
 * Get states from Home Assistant
 */
export async function getStates(token: string, baseUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`${baseUrl}/api/states`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch states');
    }

    const states = await response.json();
    console.log('[HomeAssistantProvider] States fetched successfully:', states.length);
    return states;
  } catch (error) {
    console.error('[HomeAssistantProvider] Failed to fetch states:', error);
    throw error;
  }
}

/**
 * Call a service in Home Assistant
 */
export async function callService(
  token: string,
  baseUrl: string,
  domain: string,
  service: string,
  serviceData: any = {}
): Promise<any> {
  try {
    const response = await fetch(`${baseUrl}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      throw new Error('Failed to call service');
    }

    const result = await response.json();
    console.log('[HomeAssistantProvider] Service called successfully');
    return result;
  } catch (error) {
    console.error('[HomeAssistantProvider] Failed to call service:', error);
    throw error;
  }
}
