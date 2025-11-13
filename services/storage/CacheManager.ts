interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000,
      cleanupInterval: config.cleanupInterval || 60 * 1000,
    };

    // Don't start cleanup timer in test environment to prevent hanging tests
    if (process.env.NODE_ENV !== 'test') {
      this.startCleanup();
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + (ttl || this.config.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
      hits: 0,
    });

    console.log(`[CacheManager] Cached ${key} (TTL: ${ttl || this.config.defaultTTL}ms)`);
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[CacheManager] Cache expired for ${key}`);
      return undefined;
    }

    entry.hits++;
    console.log(`[CacheManager] Cache hit for ${key} (hits: ${entry.hits})`);
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[CacheManager] Deleted ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    console.log(`[CacheManager] Cleared all cache`);
  }

  clearPattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    console.log(`[CacheManager] Cleared ${count} entries matching ${pattern}`);
    return count;
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const score = entry.timestamp - (entry.hits * 1000);
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`[CacheManager] Evicted ${oldestKey} (LRU)`);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[CacheManager] Cleanup removed ${removed} expired entries`);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      expired: entries.filter(e => now > e.expiresAt).length,
      averageAge: entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length || 0,
    };
  }
}

export default new CacheManager();
