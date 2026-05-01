import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';
import { clearSessionTokens, getAccessToken, getRefreshToken, setSessionTokens } from './session';
import type { ApiSuccess } from '../types/api.types';

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = getRefreshToken();
  if (!currentRefresh) return null;
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
  }
}

function buildUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * POST multipart FormData using `fetch` (not axios).
 * React Native + axios 1.x can inject `application/x-www-form-urlencoded` on POST and break
 * native FormData uploads (XHR `onerror` → ERR_NETWORK). `fetch` omits Content-Type so RN sets boundary.
 */
export async function postFormDataWithAuth<T>(path: string, form: FormData, timeoutMs = 120_000): Promise<T> {
  const url = buildUrl(path);

  const fetchOnce = async (token: string | null) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return await fetch(url, {
        method: 'POST',
        headers,
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let token = getAccessToken();
  let res = await fetchOnce(token);

  if (res.status === 401 && getRefreshToken()) {
    const next = await refreshAccessToken();
    if (next) {
      res = await fetchOnce(next);
    }
  }

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text ? `${text.slice(0, 200)}` : 'Invalid server response');
  }

  if (!res.ok) {
    const stubConfig = {
      url: path,
      baseURL: API_BASE_URL,
      method: 'post',
      headers: {},
    } as InternalAxiosRequestConfig;
    throw AxiosError.from(
      new Error(`Request failed with status ${res.status}`),
      AxiosError.ERR_BAD_RESPONSE,
      stubConfig,
      undefined,
      { status: res.status, statusText: res.statusText, data: parsed, headers: {}, config: stubConfig },
    );
  }

  return parsed as T;
}
