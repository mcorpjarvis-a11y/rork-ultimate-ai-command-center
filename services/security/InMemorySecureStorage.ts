/**
 * In-Memory Secure Storage for Testing
 * Provides real implementation without Expo dependencies
 */

class InMemorySecureStorage {
  private storage: Map<string, string> = new Map();

  async saveKey(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
    console.log(`[InMemoryStorage] Saved ${key}`);
  }

  async getKey(key: string): Promise<string | null> {
    const value = this.storage.get(key);
    return value || null;
  }

  async deleteKey(key: string): Promise<void> {
    this.storage.delete(key);
    console.log(`[InMemoryStorage] Deleted ${key}`);
  }

  async clear(): Promise<void> {
    this.storage.clear();
    console.log(`[InMemoryStorage] Cleared all keys`);
  }

  // For testing - get all keys
  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }
}

export default new InMemorySecureStorage();
