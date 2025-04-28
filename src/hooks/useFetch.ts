import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate a cache key from a function and its dependencies
 */
const generateCacheKey = (fn: Function, deps: any[] = []): string => {
  return `${fn.toString()}_${JSON.stringify(deps)}`;
};

/**
 * Generic fetch hook with standardized loading, error, and data states
 * @param fetchFn - The fetch function to call
 * @param initialData - Initial data state (optional)
 * @param dependencies - Array of dependencies to trigger refetch
 * @param options - Additional options for fetch behavior
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  initialData: T | null = null,
  dependencies: any[] = [],
  options: {
    skipInitialFetch?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    mockData?: T | null;
    maxRetries?: number;
    cacheKey?: string;
    cacheDuration?: number;
    disableCache?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(!options.skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  const {
    maxRetries = 3,
    disableCache = false,
    cacheDuration = CACHE_DURATION,
    cacheKey: userProvidedCacheKey
  } = options;
  
  const cacheKey = userProvidedCacheKey || generateCacheKey(fetchFn, dependencies);
  
  const checkCache = useCallback(() => {
    if (disableCache) return null;
    
    const cachedItem = cache[cacheKey];
    if (cachedItem && Date.now() - cachedItem.timestamp < cacheDuration) {
      return cachedItem.data;
    }
    return null;
  }, [cacheKey, disableCache, cacheDuration]);
  
  const updateCache = useCallback((data: T) => {
    if (!disableCache) {
      cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
    }
  }, [cacheKey, disableCache]);
  
  const fetchWithRetry = useCallback(async (retries: number = 0): Promise<T> => {
    try {
      // Try to fetch data
      const result = await fetchFn();
      return result;
    } catch (err) {
      // If we've used all retries, throw the error
      if (retries >= maxRetries) {
        throw err;
      }
      
      // Check if this is a rate limit error
      const isRateLimit = err instanceof Error && 
        (err.message.includes('rate limit') || err.message.includes('429'));
      
      if (isRateLimit) {
        // Calculate delay with exponential backoff: 2^retry * 1000ms + some random jitter
        const delay = Math.min(2 ** retries * 1000 + Math.random() * 1000, 10000);
        console.log(`Rate limit hit, retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the fetch
        return fetchWithRetry(retries + 1);
      }
      
      // For other errors, just throw
      throw err;
    }
  }, [fetchFn, maxRetries]);
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Don't set loading if we have cached data
    const cachedData = checkCache();
    if (cachedData && !forceRefresh) {
      setData(cachedData as T);
      if (options.onSuccess) {
        options.onSuccess(cachedData as T);
      }
      return cachedData;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchWithRetry();
      setData(result);
      setIsUsingMockData(false);
      updateCache(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      // Use mock data if provided
      if (options.mockData) {
        setData(options.mockData);
        setIsUsingMockData(true);
        
        // Even if we're using mock data, still return the error
        if (options.onError) {
          options.onError(errorObj);
        }
        
        return options.mockData;
      }
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      console.error('Fetch error:', errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithRetry, checkCache, updateCache, options.mockData, options.onSuccess, options.onError]);
  
  useEffect(() => {
    if (!options.skipInitialFetch) {
      fetchData();
    }
  }, [...dependencies, fetchData]);
  
  return {
    data,
    isLoading,
    error,
    refetch: (forceRefresh = false) => fetchData(forceRefresh),
    isUsingMockData,
    invalidateCache: () => {
      if (cache[cacheKey]) {
        delete cache[cacheKey];
      }
    }
  };
}

export default useFetch; 