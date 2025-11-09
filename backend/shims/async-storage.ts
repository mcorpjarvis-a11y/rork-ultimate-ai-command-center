/**
 * Backend-safe shim for @react-native-async-storage/async-storage
 * 
 * Provides a Node.js compatible implementation of AsyncStorage API.
 * Uses file-backed storage similar to expo-secure-store shim.
 */

import * as fs from 'fs';
import * as path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'backend', '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'async-storage.json');

// In-memory fallback storage
const memoryStore = new Map<string, string>();
let useFileStorage = true;

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('[async-storage shim] Failed to create storage directory:', error);
    useFileStorage = false;
  }
}

/**
 * Read storage from file
 */
function readStorage(): Record<string, string> {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return {};
    }
    
    const content = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[async-storage shim] Failed to read storage file:', error);
    return {};
  }
}

/**
 * Write storage to file
 */
function writeStorage(data: Record<string, string>): void {
  try {
    ensureStorageDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('[async-storage shim] Failed to write storage file:', error);
    throw error;
  }
}

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!useFileStorage) {
      return memoryStore.get(key) || null;
    }
    
    try {
      const storage = readStorage();
      return storage[key] || null;
    } catch (error) {
      console.error('[async-storage shim] getItem failed:', error);
      useFileStorage = false;
      return memoryStore.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!useFileStorage) {
      memoryStore.set(key, value);
      return;
    }
    
    try {
      const storage = readStorage();
      storage[key] = value;
      writeStorage(storage);
    } catch (error) {
      console.error('[async-storage shim] setItem failed:', error);
      useFileStorage = false;
      memoryStore.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (!useFileStorage) {
      memoryStore.delete(key);
      return;
    }
    
    try {
      const storage = readStorage();
      delete storage[key];
      writeStorage(storage);
    } catch (error) {
      console.error('[async-storage shim] removeItem failed:', error);
      useFileStorage = false;
      memoryStore.delete(key);
    }
  },

  async clear(): Promise<void> {
    if (!useFileStorage) {
      memoryStore.clear();
      return;
    }
    
    try {
      writeStorage({});
      memoryStore.clear();
    } catch (error) {
      console.error('[async-storage shim] clear failed:', error);
      useFileStorage = false;
      memoryStore.clear();
    }
  },

  async getAllKeys(): Promise<string[]> {
    if (!useFileStorage) {
      return Array.from(memoryStore.keys());
    }
    
    try {
      const storage = readStorage();
      return Object.keys(storage);
    } catch (error) {
      console.error('[async-storage shim] getAllKeys failed:', error);
      useFileStorage = false;
      return Array.from(memoryStore.keys());
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    if (!useFileStorage) {
      keys.forEach(key => memoryStore.delete(key));
      return;
    }
    
    try {
      const storage = readStorage();
      keys.forEach(key => delete storage[key]);
      writeStorage(storage);
    } catch (error) {
      console.error('[async-storage shim] multiRemove failed:', error);
      useFileStorage = false;
      keys.forEach(key => memoryStore.delete(key));
    }
  },

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    if (!useFileStorage) {
      return keys.map(key => [key, memoryStore.get(key) || null]);
    }
    
    try {
      const storage = readStorage();
      return keys.map(key => [key, storage[key] || null]);
    } catch (error) {
      console.error('[async-storage shim] multiGet failed:', error);
      useFileStorage = false;
      return keys.map(key => [key, memoryStore.get(key) || null]);
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    if (!useFileStorage) {
      keyValuePairs.forEach(([key, value]) => memoryStore.set(key, value));
      return;
    }
    
    try {
      const storage = readStorage();
      keyValuePairs.forEach(([key, value]) => {
        storage[key] = value;
      });
      writeStorage(storage);
    } catch (error) {
      console.error('[async-storage shim] multiSet failed:', error);
      useFileStorage = false;
      keyValuePairs.forEach(([key, value]) => memoryStore.set(key, value));
    }
  },
};

// Initialize storage on module load
ensureStorageDir();

export default AsyncStorage;
