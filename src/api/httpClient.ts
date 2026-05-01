import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../config/env';
import {
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
  clearSessionTokens,
} from './session';
import type { ApiSuccess } from '../types/api.types';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/** Plain client for refresh to avoid interceptor recursion */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[api] request', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      params: config.params,
    });
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Prefer `postFormDataWithAuth` for RN FormData — axios 1.x can still mis-handle POST FormData (ERR_NETWORK).
  if (config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const h = config.headers;
    if (h instanceof AxiosHeaders) {
      h.delete('Content-Type');
    } else if (h && typeof h === 'object') {
      delete (h as Record<string, unknown>)['Content-Type'];
      delete (h as Record<string, unknown>)['content-type'];
    }
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = getRefreshToken();
  if (!currentRefresh) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await refreshClient.post<ApiSuccess<{ accessToken: string; refreshToken: string }>>(
          '/api/auth/refresh-token',
          { refreshToken: currentRefresh },
        );
        if (!data.success || !data.data?.accessToken) return null;
        const { accessToken: nextAccess, refreshToken: nextRefresh } = data.data;
        setSessionTokens(nextAccess, nextRefresh);
        const { useAuthStore } = await import('../stores/auth.store');
        useAuthStore.getState().setTokens(nextAccess, nextRefresh);
        return nextAccess;
      } catch {
        clearSessionTokens();
        const { useAuthStore } = await import('../stores/auth.store');
        useAuthStore.getState().clearAuth();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

httpClient.interceptors.response.use(
  res => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[api] response', {
        status: res.status,
        url: res.config?.url,
      });
    }
    return res;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[api] error', {
        message: error.message,
        code: (error as any)?.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: (error.config as any)?.baseURL,
        data: error.response?.data,
      });
    }
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Do not loop on auth endpoints
    if (
      original.url?.includes('/api/auth/login') ||
      original.url?.includes('/api/auth/register') ||
      original.url?.includes('/api/auth/refresh-token') ||
      original.url?.includes('/api/auth/send-otp')
    ) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      return Promise.reject(error);
    }

    original._retry = true;
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${newAccess}`;
    return httpClient(original);
  },
);
