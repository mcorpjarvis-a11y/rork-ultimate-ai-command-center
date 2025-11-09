/**
 * Expo Secure Store Polyfill for Node.js Backend
 * 
 * This provides an in-memory implementation of Expo's SecureStore
 * for backend services. In a real production environment, you would
 * want to use a proper secret management system.
 */

const storage = new Map<string, string>();

export async function getItemAsync(key: string): Promise<string | null> {
  return storage.get(key) ?? null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  storage.set(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  storage.delete(key);
}

export async function isAvailableAsync(): Promise<boolean> {
  return true; // Always available in polyfill
}

export const AFTER_FIRST_UNLOCK = 'AFTER_FIRST_UNLOCK';
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY';
export const ALWAYS = 'ALWAYS';
export const WHEN_UNLOCKED = 'WHEN_UNLOCKED';
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY';

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  isAvailableAsync,
  AFTER_FIRST_UNLOCK,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  ALWAYS,
  WHEN_UNLOCKED,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
};
