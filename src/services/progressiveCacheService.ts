/**
 * Progressive Cache Service
 * Implements intelligent data fetching with service worker caching
 */

import { Story, Storyteller, Theme, Media, Quote } from '../types';

interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // number of items
  version: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface ProgressiveLoadOptions {
  pageSize?: number;
  prefetchNext?: boolean;
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

class ProgressiveCacheService {
  private static instance: ProgressiveCacheService;
  private cacheConfig: CacheConfig = {
    maxAge: 15 * 60 * 1000, // 15 minutes
    maxSize: 1000,
    version: '1.0.0',
  };
  
  private memoryCache = new Map<string, CachedData<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  private constructor() {
    this.initializeServiceWorker();
    this.setupCacheCleanup();
  }

  static getInstance(): ProgressiveCacheService {
    if (!ProgressiveCacheService.instance) {
      ProgressiveCacheService.instance = new ProgressiveCacheService();
    }
    return ProgressiveCacheService.instance;
  }

  /**
   * Initialize service worker for offline caching
   */
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Set up periodic cache cleanup
   */
  private setupCacheCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.cacheConfig.maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    // Also clean up IndexedDB if size exceeds limit
    if (this.memoryCache.size > this.cacheConfig.maxSize) {
      const entriesToRemove = this.memoryCache.size - this.cacheConfig.maxSize;
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.memoryCache.delete(sortedEntries[i][0]);
      }
    }
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(type: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
    return `${type}:${paramString}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid<T>(cached: CachedData<T> | undefined): boolean {
    if (!cached) return false;
    if (cached.version !== this.cacheConfig.version) return false;
    return Date.now() - cached.timestamp < this.cacheConfig.maxAge;
  }

  /**
   * Generic progressive load function
   */
  async progressiveLoad<T>(
    key: string,
    fetchFn: () => Promise<T[]>,
    options: ProgressiveLoadOptions = {}
  ): Promise<T[]> {
    const {
      pageSize = 50,
      prefetchNext = true,
      cacheStrategy = 'cache-first'
    } = options;

    // Check for pending request
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Check memory cache
    const cached = this.memoryCache.get(key);
    
    switch (cacheStrategy) {
      case 'cache-only':
        return cached?.data || [];
        
      case 'network-only':
        return this.fetchAndCache(key, fetchFn);
        
      case 'cache-first':
        if (this.isCacheValid(cached)) {
          // Return cached data and optionally refresh in background
          if (prefetchNext) {
            this.fetchAndCache(key, fetchFn).catch(console.error);
          }
          return cached.data;
        }
        return this.fetchAndCache(key, fetchFn);
        
      case 'network-first':
      default:
        try {
          return await this.fetchAndCache(key, fetchFn);
        } catch (error) {
          if (cached) {
            console.warn('Network failed, using cached data:', error);
            return cached.data;
          }
          throw error;
        }
    }
  }

  /**
   * Fetch data and update cache
   */
  private async fetchAndCache<T>(key: string, fetchFn: () => Promise<T[]>): Promise<T[]> {
    const promise = fetchFn();
    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      
      // Update memory cache
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        version: this.cacheConfig.version,
      });

      // Update IndexedDB cache
      await this.updateIndexedDB(key, data);

      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Update IndexedDB for persistent storage
   */
  private async updateIndexedDB<T>(key: string, data: T[]): Promise<void> {
    if (!('indexedDB' in window)) return;

    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await store.put({
        key,
        data,
        timestamp: Date.now(),
        version: this.cacheConfig.version,
      });
    } catch (error) {
      console.error('IndexedDB update failed:', error);
    }
  }

  /**
   * Open IndexedDB database
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EmpathyLedgerCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Load data from IndexedDB
   */
  async loadFromIndexedDB<T>(key: string): Promise<T[] | null> {
    if (!('indexedDB' in window)) return null;

    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && this.isCacheValid(result)) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB read failed:', error);
      return null;
    }
  }

  /**
   * Paginated data loading
   */
  async loadPaginated<T>(
    key: string,
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
    page: number,
    pageSize: number = 50
  ): Promise<{ data: T[]; hasMore: boolean; fromCache: boolean }> {
    const pageKey = `${key}:page:${page}:size:${pageSize}`;
    const cached = this.memoryCache.get(pageKey);

    if (this.isCacheValid(cached)) {
      return { ...cached.data, fromCache: true };
    }

    const result = await fetchFn(page, pageSize);
    
    this.memoryCache.set(pageKey, {
      data: result,
      timestamp: Date.now(),
      version: this.cacheConfig.version,
    });

    return { ...result, fromCache: false };
  }

  /**
   * Prefetch related data
   */
  async prefetchRelated(type: string, ids: string[]): Promise<void> {
    const prefetchPromises = ids.map(id => {
      const key = `${type}:${id}`;
      if (!this.memoryCache.has(key)) {
        // Implement actual prefetch logic based on type
        console.log(`Prefetching ${type} with id ${id}`);
      }
    });

    await Promise.all(prefetchPromises);
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.memoryCache.clear();
    
    if ('indexedDB' in window) {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await store.clear();
      } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
      }
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memorySize: number;
    oldestEntry: number | null;
    hitRate: number;
  } {
    let oldestTimestamp: number | null = null;
    
    this.memoryCache.forEach(cached => {
      if (!oldestTimestamp || cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
      }
    });

    return {
      memorySize: this.memoryCache.size,
      oldestEntry: oldestTimestamp,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }
}

// Export singleton instance
export const cacheService = ProgressiveCacheService.getInstance();

// React hook for progressive data loading
import { useState, useEffect, useCallback } from 'react';

export function useProgressiveData<T>(
  key: string,
  fetchFn: () => Promise<T[]>,
  options?: ProgressiveLoadOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to load from IndexedDB for instant display
      const cachedData = await cacheService.loadFromIndexedDB<T>(key);
      if (cachedData) {
        setData(cachedData);
        setFromCache(true);
      }

      // Then load with progressive strategy
      const freshData = await cacheService.progressiveLoad(key, fetchFn, options);
      setData(freshData);
      setFromCache(false);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, options]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await cacheService.progressiveLoad(key, fetchFn, {
      ...options,
      cacheStrategy: 'network-only',
    });
    await loadData();
  }, [key, fetchFn, options, loadData]);

  return { data, loading, error, fromCache, refresh };
}