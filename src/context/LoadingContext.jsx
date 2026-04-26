import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LoadingContext } from './ContextObjects';

export function LoadingProvider({ children }) {
  const [loadingTasks, setLoadingTasks] = useState(0);
  const safetyTimerRef = useRef(null);

  const startLoading = useCallback(() => {
    setLoadingTasks(prev => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingTasks(prev => Math.max(0, prev - 1));
  }, []);

  // Safety trigger: If loading is stuck for more than 10 seconds, force clear it.
  useEffect(() => {
    if (loadingTasks > 0) {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = setTimeout(() => {
        console.warn('Loading state stuck detected. Resetting global loader.');
        setLoadingTasks(0);
      }, 10000);
    } else {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    }
    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [loadingTasks]);


  // Automatic interception of fetch
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      startLoading();
      try {
        return await originalFetch(...args);
      } catch (error) {
        // Log network errors but still hide loader via finally
        console.error('Loader Fetch Interceptor Error:', error);
        throw error;
      } finally {
        stopLoading();
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [startLoading, stopLoading]);

  const withLoading = useCallback(async (promiseOrFn) => {
    startLoading();
    try {
      const result = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
      return await result;
    } catch (error) {
      console.error('Loader withLoading Error:', error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const isLoading = loadingTasks > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
