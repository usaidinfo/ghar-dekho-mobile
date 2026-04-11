import axios, {
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
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  res => res,
  async (error: AxiosError) => {
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
