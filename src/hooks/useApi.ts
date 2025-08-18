import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void>; reset: () => void } {
  const { immediate = true, retries = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const executeApiCall = useCallback(async (attempt = 1): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';

      if (attempt < retries) {
        setTimeout(() => executeApiCall(attempt + 1), retryDelay * attempt);
      } else {
        setState({ data: null, loading: false, error: errorMessage });
      }
    }
  }, [apiCall, retries, retryDelay]);

  const refetch = useCallback(() => executeApiCall(), [executeApiCall]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      executeApiCall();
    }
  }, [immediate, executeApiCall, ...dependencies]);

  return { ...state, refetch, reset };
}

// Specialized hook for user data
export function useUserData(userId?: string) {
  const { apiClient } = require('../utils/api');
  
  return useApi(
    () => userId ? apiClient.get(`/users/${userId}`) : Promise.resolve(null),
    [userId],
    { immediate: !!userId }
  );
}

// Specialized hook for user balance
export function useUserBalance(userId?: string) {
  const { apiClient } = require('../utils/api');
  
  return useApi(
    () => userId ? apiClient.get(`/${userId}/balance`) : Promise.resolve(null),
    [userId],
    { immediate: !!userId }
  );
}

// Specialized hook for transactions
export function useTransactions(userId?: string) {
  const { apiClient } = require('../utils/api');
  
  return useApi(
    () => userId ? apiClient.get(`/${userId}/transactions`) : Promise.resolve(null),
    [userId],
    { immediate: !!userId }
  );
}