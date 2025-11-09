/**
 * Backend-safe shim for expo-secure-store
 * 
 * Provides a Node.js compatible implementation of expo-secure-store API
 * used by SecureKeyStorage and TokenVault in the backend.
 * 
 * Storage strategy:
 * - Primary: File-backed storage in backend/.data/secure-store.json
 * - Fallback: In-memory storage if file operations fail
 * 
 * Security notes:
 * - Secrets are NOT logged
 * - File storage uses basic locking to prevent corruption
 * - In production, consider encrypting the storage file
 */

import * as fs from 'fs';
import * as path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'backend', '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'secure-store.json');
const LOCK_FILE = path.join(STORAGE_DIR, 'secure-store.lock');
const LOCK_TIMEOUT_MS = 5000;

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
    console.error('[expo-secure-store shim] Failed to create storage directory:', error);
    useFileStorage = false;
  }
}

/**
 * Acquire a lock for file operations
 */
async function acquireLock(): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < LOCK_TIMEOUT_MS) {
    try {
      // Try to create lock file exclusively
      fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
      return true;
    } catch (error) {
      // Lock exists, wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return false;
}

/**
 * Release the lock
 */
function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    // Ignore errors on unlock
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
    console.error('[expo-secure-store shim] Failed to read storage file:', error);
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
    console.error('[expo-secure-store shim] Failed to write storage file:', error);
    throw error;
  }
}

/**
 * Get an item from secure storage
 */
export async function getItemAsync(key: string): Promise<string | null> {
  if (!useFileStorage) {
    return memoryStore.get(key) || null;
  }
  
  const lockAcquired = await acquireLock();
  if (!lockAcquired) {
    console.warn('[expo-secure-store shim] Lock timeout, using memory storage');
    return memoryStore.get(key) || null;
  }
  
  try {
    const storage = readStorage();
    return storage[key] || null;
  } catch (error) {
    console.error('[expo-secure-store shim] getItemAsync failed:', error);
    // Fallback to memory
    useFileStorage = false;
    return memoryStore.get(key) || null;
  } finally {
    releaseLock();
  }
}

/**
 * Set an item in secure storage
 */
export async function setItemAsync(key: string, value: string): Promise<void> {
  if (!useFileStorage) {
    memoryStore.set(key, value);
    return;
  }
  
  const lockAcquired = await acquireLock();
  if (!lockAcquired) {
    console.warn('[expo-secure-store shim] Lock timeout, using memory storage');
    memoryStore.set(key, value);
    return;
  }
  
  try {
    const storage = readStorage();
    storage[key] = value;
    writeStorage(storage);
  } catch (error) {
    console.error('[expo-secure-store shim] setItemAsync failed:', error);
    // Fallback to memory
    useFileStorage = false;
    memoryStore.set(key, value);
  } finally {
    releaseLock();
  }
}

/**
 * Delete an item from secure storage
 */
export async function deleteItemAsync(key: string): Promise<void> {
  if (!useFileStorage) {
    memoryStore.delete(key);
    return;
  }
  
  const lockAcquired = await acquireLock();
  if (!lockAcquired) {
    console.warn('[expo-secure-store shim] Lock timeout, using memory storage');
    memoryStore.delete(key);
    return;
  }
  
  try {
    const storage = readStorage();
    delete storage[key];
    writeStorage(storage);
  } catch (error) {
    console.error('[expo-secure-store shim] deleteItemAsync failed:', error);
    // Fallback to memory
    useFileStorage = false;
    memoryStore.delete(key);
  } finally {
    releaseLock();
  }
}

// Initialize storage on module load
ensureStorageDir();
