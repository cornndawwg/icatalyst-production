import { useState, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
  throttleMs?: number;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Global request manager to prevent resource exhaustion
class RequestManager {
  private activeRequests = new Set<string>();
  private requestQueue = new Map<string, Promise<any>>();
  private lastRequestTime = new Map<string, number>();
  private maxConcurrentRequests = 5;

  canMakeRequest(url: string, throttleMs: number = 1000): boolean {
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(url) || 0;
    
    // Check if we're within throttle window
    if (now - lastTime < throttleMs) {
      console.log(`🚦 Request throttled for ${url} (${now - lastTime}ms since last)`);
      return false;
    }

    // Check concurrent request limit
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      console.log(`🚦 Max concurrent requests reached (${this.activeRequests.size}/${this.maxConcurrentRequests})`);
      return false;
    }

    return true;
  }

  addActiveRequest(url: string): void {
    this.activeRequests.add(url);
    this.lastRequestTime.set(url, Date.now());
  }

  removeActiveRequest(url: string): void {
    this.activeRequests.delete(url);
  }

  getDuplicateRequest(url: string): Promise<any> | null {
    return this.requestQueue.get(url) || null;
  }

  setDuplicateRequest(url: string, promise: Promise<any>): void {
    this.requestQueue.set(url, promise);
    promise.finally(() => {
      this.requestQueue.delete(url);
    });
  }

  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}

const requestManager = new RequestManager();

export function useApi<T>(options: UseApiOptions<T> = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true); // Track if component is still mounted
  
  const {
    retries = 3,
    retryDelay = 1000,
    throttleMs = 1000,
    onSuccess,
    onError
  } = options;

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const makeRequest = useCallback(
    async (url: string, config: RequestInit = {}, attempt: number = 1): Promise<T> => {
      // Check for duplicate in-flight requests
      const existingRequest = requestManager.getDuplicateRequest(url);
      if (existingRequest) {
        console.log(`🔄 Using existing request for ${url}`);
        return existingRequest;
      }

      // Check throttling and concurrent limits
      if (!requestManager.canMakeRequest(url, throttleMs)) {
        if (attempt === 1) {
          // Only wait for throttle on first attempt, not retries
          await sleep(throttleMs);
          // Re-check if component is still mounted after sleep
          if (!isMountedRef.current) {
            throw new Error('Component unmounted during throttle wait');
          }
        } else {
          throw new Error(`Request throttled: ${url}`);
        }
      }

      // Create abort controller for this specific request
      const abortController = new AbortController();
      
      requestManager.addActiveRequest(url);
      
      console.log(`🚀 API Request (attempt ${attempt}/${retries + 1}):`, { 
        url, 
        config,
        activeRequests: requestManager.getActiveRequestCount()
      });

      const requestPromise = fetch(url, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        signal: abortController.signal,
      }).then(async (response) => {
        // Early exit if component unmounted
        if (!isMountedRef.current) {
          console.log(`🚪 Component unmounted, ignoring response for ${url}`);
          return null;
        }

        console.log(`📥 Response received (attempt ${attempt}):`, { 
          status: response.status, 
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          // Handle different error types
          if (response.status === 429) {
            throw new Error(`Rate limited: ${response.status} ${response.statusText}`);
          } else if (response.status >= 500) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          } else if (response.status === 401) {
            throw new Error(`Unauthorized: ${response.status} ${response.statusText}`);
          } else {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log(`✅ API Success (attempt ${attempt}):`, data);
        return data;
      }).catch(async (error) => {
        // Handle abort errors gracefully - don't treat as real errors
        if (error.name === 'AbortError') {
          console.log(`🛑 Request aborted for ${url} (this is normal)`);
          return null; // Return null instead of throwing
        }

        // Don't process errors if component is unmounted
        if (!isMountedRef.current) {
          console.log(`🚪 Component unmounted, ignoring error for ${url}`);
          return null;
        }

        console.error(`❌ API Error (attempt ${attempt}/${retries + 1}):`, {
          error: error.message,
          url,
          willRetry: attempt <= retries
        });

        // Retry logic for specific error types
        if (attempt <= retries && isMountedRef.current) {
          const shouldRetry = 
            error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('Server error') ||
            error.message.includes('Rate limited') ||
            error.message.includes('Network Error');

          if (shouldRetry) {
            const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`🔄 Retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
            await sleep(delay);
            
            // Check again if component is still mounted after sleep
            if (!isMountedRef.current) {
              console.log(`🚪 Component unmounted during retry wait`);
              return null;
            }
            
            return makeRequest(url, config, attempt + 1);
          }
        }

        throw error;
      }).finally(() => {
        requestManager.removeActiveRequest(url);
      });

      // Store the promise to prevent duplicates
      requestManager.setDuplicateRequest(url, requestPromise);

      return requestPromise;
    },
    [retries, retryDelay, throttleMs]
  );

  const request = useCallback(
    async (url: string, config: RequestInit = {}) => {
      // Don't start new requests if component is unmounted
      if (!isMountedRef.current) {
        console.log(`🚪 Component unmounted, skipping request to ${url}`);
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await makeRequest(url, config);
        
        // Only update state if component is still mounted and we got valid data
        if (isMountedRef.current && data !== null) {
          setState({ data, loading: false, error: null });
          onSuccess?.(data);
        }
        return data;
      } catch (err) {
        // Only handle errors if component is still mounted
        if (!isMountedRef.current) {
          return;
        }
        
        const error = err instanceof Error ? err.message : 'An error occurred';
        setState(prev => ({ ...prev, loading: false, error }));
        onError?.(err as Error);
        throw err;
      }
    },
    [makeRequest, onSuccess, onError]
  );

  const get = useCallback(
    (url: string) => request(url, { method: 'GET' }),
    [request]
  );

  const post = useCallback(
    (url: string, data: unknown) =>
      request(url, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    [request]
  );

  const put = useCallback(
    (url: string, data: unknown) =>
      request(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    [request]
  );

  const del = useCallback(
    (url: string) => request(url, { method: 'DELETE' }),
    [request]
  );

  // Much more selective cleanup - only on true unmount
  const cleanup = useCallback(() => {
    console.log(`🧹 useApi cleanup called`);
    isMountedRef.current = false;
    
    // Only abort if there's an active controller and it makes sense
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      console.log(`🛑 Aborting API request due to component unmount`);
      abortControllerRef.current.abort();
    }
  }, []);

  // Initialize mounted state
  isMountedRef.current = true;

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
    cleanup, // Renamed from abort to be more clear about its purpose
    activeRequests: requestManager.getActiveRequestCount(),
  };
} 