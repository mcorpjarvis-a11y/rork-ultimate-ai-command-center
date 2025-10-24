import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number;
  compress?: boolean;
}

export interface CachedData<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

class StorageManager {
  private cache: Map<string, any>;
  private readonly prefix: string;

  constructor(prefix: string = '@jarvis:') {
    this.cache = new Map();
    this.prefix = prefix;
  }

  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    const fullKey = this.prefix + key;
    
    const data: CachedData<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
    };

    try {
      const serialized = JSON.stringify(data);
      await AsyncStorage.setItem(fullKey, serialized);
      this.cache.set(key, data);
      console.log(`[StorageManager] Saved ${key}`);
    } catch (error) {
      console.error(`[StorageManager] Error saving ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const fullKey = this.prefix + key;

    if (this.cache.has(key)) {
      const cached = this.cache.get(key) as CachedData<T>;
      if (!cached.expiresAt || cached.expiresAt > Date.now()) {
        console.log(`[StorageManager] Cache hit for ${key}`);
        return cached.value;
      }
      this.cache.delete(key);
    }

    try {
      const serialized = await AsyncStorage.getItem(fullKey);
      if (!serialized) {
        return defaultValue;
      }

      const data: CachedData<T> = JSON.parse(serialized);
      
      if (data.expiresAt && data.expiresAt < Date.now()) {
        console.log(`[StorageManager] ${key} expired, removing`);
        await this.remove(key);
        return defaultValue;
      }

      this.cache.set(key, data);
      console.log(`[StorageManager] Retrieved ${key}`);
      return data.value;
    } catch (error) {
      console.error(`[StorageManager] Error retrieving ${key}:`, error);
      return defaultValue;
    }
  }

  async remove(key: string): Promise<void> {
    const fullKey = this.prefix + key;
    try {
      await AsyncStorage.removeItem(fullKey);
      this.cache.delete(key);
      console.log(`[StorageManager] Removed ${key}`);
    } catch (error) {
      console.error(`[StorageManager] Error removing ${key}:`, error);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await AsyncStorage.getAllKeys();
        const matchingKeys = keys.filter(k => k.startsWith(this.prefix + pattern));
        await AsyncStorage.multiRemove(matchingKeys);
        console.log(`[StorageManager] Cleared ${matchingKeys.length} keys matching ${pattern}`);
      } else {
        await AsyncStorage.clear();
        this.cache.clear();
        console.log(`[StorageManager] Cleared all storage`);
      }
    } catch (error) {
      console.error(`[StorageManager] Error clearing storage:`, error);
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | undefined>> {
    const fullKeys = keys.map(k => this.prefix + k);
    const result: Record<string, T | undefined> = {};

    try {
      const pairs = await AsyncStorage.multiGet(fullKeys);
      pairs.forEach(([fullKey, value], index) => {
        const key = keys[index];
        if (value) {
          try {
            const data: CachedData<T> = JSON.parse(value);
            if (!data.expiresAt || data.expiresAt > Date.now()) {
              result[key] = data.value;
              this.cache.set(key, data);
            }
          } catch (error) {
            console.error(`[StorageManager] Error parsing ${key}:`, error);
          }
        }
      });
    } catch (error) {
      console.error(`[StorageManager] Error getting multiple:`, error);
    }

    return result;
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(k => k.startsWith(this.prefix))
        .map(k => k.replace(this.prefix, ''));
    } catch (error) {
      console.error(`[StorageManager] Error getting all keys:`, error);
      return [];
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      const data = await this.getMultiple(keys);
      const size = JSON.stringify(data).length;
      return size;
    } catch (error) {
      console.error(`[StorageManager] Error calculating size:`, error);
      return 0;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log(`[StorageManager] Cache cleared`);
  }
}

export default new StorageManager();
