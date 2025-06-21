/**
 * Hook for lazy loading data with caching
 */

import { useState, useCallback, useRef } from 'react';
import enhancedCache from '../services/enhancedCacheService';

interface UseLazyDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  loadData: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface LazyDataOptions {
  cacheKey?: string;
  ttl?: number;
  useCache?: boolean;
}

/**
 * Hook for lazy loading data with automatic caching
 */
export function useLazyData<T>(
  fetchFunction: () => Promise<T>,
  options: LazyDataOptions = {}
): UseLazyDataReturn<T> {
  const {
    cacheKey,
    ttl = 5 * 60 * 1000, // 5 minutes default
    useCache = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Check cache first if enabled
      if (useCache && cacheKey) {
        const cached = enhancedCache.get<T>(cacheKey, { ttl });
        if (cached) {
          setData(cached);
          console.log(`[useLazyData] Using cached data for ${cacheKey}`);
          return;
        }
      }

      // Fetch fresh data
      console.log(`[useLazyData] Fetching fresh data${cacheKey ? ` for ${cacheKey}` : ''}`);
      const freshData = await fetchFunction();
      
      // Cache the result if enabled
      if (useCache && cacheKey) {
        enhancedCache.set(cacheKey, freshData);
      }
      
      setData(freshData);
    } catch (err) {
      console.error('[useLazyData] Error loading data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFunction, cacheKey, ttl, useCache]);

  const refresh = useCallback(async () => {
    // Clear cache if exists
    if (cacheKey) {
      enhancedCache.remove(cacheKey);
    }
    
    // Reload data
    await loadData();
  }, [cacheKey, loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    refresh
  };
}

/**
 * Hook for lazy loading multiple data sources
 */
export function useLazyBatchData<T extends Record<string, any>>(
  fetchFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: LazyDataOptions = {}
): {
  data: Partial<T>;
  loading: boolean;
  error: Error | null;
  loadData: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const results: Partial<T> = {};
      
      // Load all data in parallel
      const promises = Object.entries(fetchFunctions).map(async ([key, fetchFn]) => {
        const cacheKey = options.cacheKey ? `${options.cacheKey}_${key}` : key;
        
        // Check cache first
        if (options.useCache !== false) {
          const cached = enhancedCache.get(cacheKey, { ttl: options.ttl });
          if (cached) {
            results[key as keyof T] = cached;
            return;
          }
        }
        
        // Fetch fresh data
        const freshData = await (fetchFn as () => Promise<any>)();
        results[key as keyof T] = freshData;
        
        // Cache the result
        if (options.useCache !== false) {
          enhancedCache.set(cacheKey, freshData);
        }
      });
      
      await Promise.all(promises);
      setData(results);
    } catch (err) {
      console.error('[useLazyBatchData] Error loading data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFunctions, options]);

  const refresh = useCallback(async () => {
    // Clear all related caches
    if (options.cacheKey) {
      Object.keys(fetchFunctions).forEach(key => {
        enhancedCache.remove(`${options.cacheKey}_${key}`);
      });
    }
    
    // Reload data
    await loadData();
  }, [fetchFunctions, options.cacheKey, loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    refresh
  };
}