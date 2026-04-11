/**
 * In-memory session mirror for axios interceptors.
 * Zustand persist rehydrates async; this keeps tokens available synchronously after hydrate/login.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setSessionTokens(access: string | null, refresh: string | null): void {
  accessToken = access;
  refreshToken = refresh;
}

export function clearSessionTokens(): void {
  accessToken = null;
  refreshToken = null;
}
