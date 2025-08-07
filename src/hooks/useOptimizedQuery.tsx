import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryFn: () => Promise<T>;
  dependencies?: any[];
  cacheKey: string;
  cacheDuration?: number;
  throttleTime?: number;
  enabled?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// Global cache to share between components
const globalCache = new Map<string, CacheEntry<any>>();

export function useOptimizedQuery<T>({
  queryFn,
  dependencies = [],
  cacheKey,
  cacheDuration = 2 * 60 * 1000, // 2 minutes default
  throttleTime = 10000, // 10 seconds default
  enabled = true
}: UseOptimizedQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const lastFetchRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeQuery = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    const now = Date.now();
    
    // Check cache first
    const cachedEntry = globalCache.get(cacheKey);
    if (cachedEntry && (now - cachedEntry.timestamp) < cacheDuration) {
      console.log(`Using cached data for ${cacheKey}`);
      setData(cachedEntry.data);
      setLoading(false);
      return;
    }

    // Throttle requests
    if (now - lastFetchRef.current < throttleTime) {
      console.log(`Throttling query for ${cacheKey}`);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastFetchRef.current = now;
    
    try {
      setError(null);
      const result = await queryFn();
      
      if (!mountedRef.current) return;
      
      // Update cache
      globalCache.set(cacheKey, {
        data: result,
        timestamp: now,
        key: cacheKey
      });
      
      setData(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Error in optimized query ${cacheKey}:`, error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryFn, enabled, cacheKey, cacheDuration, throttleTime]);

  // Effect for dependencies changes
  useEffect(() => {
    if (enabled) {
      const timeoutId = setTimeout(() => {
        executeQuery();
      }, 100); // Small delay to batch rapid changes

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, executeQuery, ...dependencies]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const invalidateCache = useCallback(() => {
    globalCache.delete(cacheKey);
  }, [cacheKey]);

  const refetch = useCallback(() => {
    invalidateCache();
    return executeQuery();
  }, [executeQuery, invalidateCache]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache
  };
}

// Utility to clear all cache
export const clearAllCache = () => {
  globalCache.clear();
};

// Utility to clear expired cache entries
export const clearExpiredCache = (maxAge = 5 * 60 * 1000) => {
  const now = Date.now();
  for (const [key, entry] of globalCache.entries()) {
    if (now - entry.timestamp > maxAge) {
      globalCache.delete(key);
    }
  }
};