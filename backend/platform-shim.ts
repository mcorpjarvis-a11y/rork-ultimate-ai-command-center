/**
 * Platform Shim for Node.js Backend
 * 
 * This module provides a minimal react-native Platform API shim for use in Node.js.
 * Services that are shared between mobile and backend can import from this shim
 * instead of directly from 'react-native'.
 * 
 * Usage in services:
 *   // Instead of: import { Platform } from 'react-native';
 *   import { Platform } from '@/backend/platform-shim';
 */

export const Platform = {
  OS: 'web' as const, // Report as 'web' for backend (many services check for 'web' vs mobile)
  Version: undefined,
  isTV: false,
  isTesting: process.env.NODE_ENV === 'test',
  select: <T>(obj: { web?: T; default: T }): T => {
    return obj.web !== undefined ? obj.web : obj.default;
  },
};

// AsyncStorage shim - uses in-memory storage for backend
class AsyncStorageShim {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, this.storage.get(key) ?? null]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => this.storage.set(key, value));
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => this.storage.delete(key));
  }
}

export const AsyncStorage = new AsyncStorageShim();

export default {
  Platform,
  AsyncStorage,
};
