/**
 * AsyncStorage Polyfill for Node.js Backend
 * 
 * This provides an in-memory implementation of React Native's AsyncStorage
 * for backend services that need to share code with mobile.
 * 
 * The backend tsconfig.json is configured to resolve
 * '@react-native-async-storage/async-storage' imports to this file.
 */

class AsyncStoragePolyfill {
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

  async mergeItem(key: string, value: string): Promise<void> {
    const existing = await this.getItem(key);
    if (existing) {
      const merged = { ...JSON.parse(existing), ...JSON.parse(value) };
      await this.setItem(key, JSON.stringify(merged));
    } else {
      await this.setItem(key, value);
    }
  }

  async flushGetRequests(): Promise<void> {
    // No-op for polyfill
  }
}

const instance = new AsyncStoragePolyfill();

export default instance;
export { instance as AsyncStorage };
