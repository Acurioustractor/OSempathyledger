/**
 * Enhanced Cache Service for Empathy Ledger Data
 * Implements both memory and localStorage caching with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number;
  useLocalStorage?: boolean;
}

class EnhancedCacheService {
  private static instance: EnhancedCacheService;
  private memoryCache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_PREFIX = 'empathy_ledger_';

  private constructor() {
    this.memoryCache = new Map();
    // Clear expired entries on initialization
    this.clearExpiredLocalStorage();
  }

  public static getInstance(): EnhancedCacheService {
    if (!EnhancedCacheService.instance) {
      EnhancedCacheService.instance = new EnhancedCacheService();
    }
    return EnhancedCacheService.instance;
  }

  /**
   * Get cached data from memory or localStorage
   */
  public get<T>(key: string, options: CacheOptions = {}): T | null {
    const { ttl = this.DEFAULT_TTL, useLocalStorage = true } = options;

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (Date.now() - memoryEntry.timestamp <= ttl) {
        return memoryEntry.data;
      }
      this.memoryCache.delete(key);
    }

    // Check localStorage if enabled
    if (useLocalStorage && typeof window !== 'undefined') {
      return this.getFromLocalStorage<T>(key, ttl);
    }

    return null;
  }

  /**
   * Set cache data in memory and optionally localStorage
   */
  public set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { useLocalStorage = true } = options;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };

    // Always set in memory
    this.memoryCache.set(key, entry);

    // Optionally set in localStorage
    if (useLocalStorage && typeof window !== 'undefined') {
      this.setToLocalStorage(key, entry);
    }
  }

  /**
   * Remove specific cache entry
   */
  public remove(key: string): void {
    this.memoryCache.delete(key);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    }
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.memoryCache.clear();
    this.clearAllLocalStorage();
  }

  /**
   * Get data from specific table with caching
   */
  public async getTableData<T>(
    tableName: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(tableName, options);
    if (cached) {
      console.log(`Using cached data for ${tableName}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`Fetching fresh data for ${tableName}`);
    const data = await fetchFunction();
    
    // Cache the result
    this.set(tableName, data, options);
    
    return data;
  }

  /**
   * Batch fetch multiple tables with caching
   */
  public async batchFetch<T extends Record<string, any>>(
    requests: { [K in keyof T]: () => Promise<T[K]> },
    options: CacheOptions = {}
  ): Promise<T> {
    const results: Partial<T> = {};
    
    const promises = Object.entries(requests).map(async ([key, fetchFn]) => {
      const data = await this.getTableData(key, fetchFn as () => Promise<any>, options);
      results[key as keyof T] = data;
    });
    
    await Promise.all(promises);
    return results as T;
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    memoryEntries: number;
    localStorageEntries: number;
    totalSize: number;
  } {
    const localStorageEntries = this.getLocalStorageCount();
    const totalSize = this.calculateTotalSize();

    return {
      memoryEntries: this.memoryCache.size,
      localStorageEntries,
      totalSize
    };
  }

  // Private helper methods
  private getFromLocalStorage<T>(key: string, ttl: number): T | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (Date.now() - entry.timestamp > ttl) {
        localStorage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }

      // Also populate memory cache for faster subsequent access
      this.memoryCache.set(key, entry);
      
      return entry.data;
    } catch (error) {
      console.error(`Error reading localStorage for ${key}:`, error);
      return null;
    }
  }

  private setToLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Error setting localStorage for ${key}:`, error);
      // If quota exceeded, clear some old entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearExpiredLocalStorage();
        // Try once more
        try {
          localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
        } catch {
          // Give up
        }
      }
    }
  }

  private clearExpiredLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (!cached) return;

          const entry = JSON.parse(cached);
          if (now - entry.timestamp > this.DEFAULT_TTL) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }

  private clearAllLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  private getLocalStorageCount(): number {
    if (typeof window === 'undefined') return 0;

    return Object.keys(localStorage).filter(key => 
      key.startsWith(this.CACHE_PREFIX)
    ).length;
  }

  private calculateTotalSize(): number {
    if (typeof window === 'undefined') return 0;

    let size = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    });

    return size;
  }
}

// Export singleton instance
export default EnhancedCacheService.getInstance();