import axios, { type AxiosError } from 'axios';
import { httpClient } from '../api/httpClient';
import { getAccessToken, getRefreshToken } from '../api/session';
import type { ApiErrorBody, ApiSuccess } from '../types/api.types';
import type {
  AuthUser,
  LoginPasswordPayload,
  LoginOtpPayload,
  RegisterPayload,
  OtpType,
} from '../types/auth.types';

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    if (data) {
      const msg = data.message || err.message || 'Request failed';
      const code = data.code;

      // Backend validation format: { message: 'Validation failed.', code: 'VALIDATION_ERROR', errors: [{ field, message }] }
      if (code === 'VALIDATION_ERROR' && Array.isArray(data.errors) && data.errors.length) {
        const first = data.errors[0] as { field?: unknown; message?: unknown };
        const field = typeof first.field === 'string' ? first.field : undefined;
        const m = typeof first.message === 'string' ? first.message : undefined;
        if (field && m) return `${m} (${field})`;
        if (m) return m;
        return msg;
      }

      // Other error shapes with `errors`
      if (typeof data.errors === 'string' && data.errors.trim()) {
        return `${msg} (${data.errors.trim()})`;
      }

      return msg;
    }
    return err.message || 'Request failed';
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

/** Email or Indian 10-digit / E.164 phone for API */
export function parseIdentifier(identifier: string): { email?: string; phone?: string } {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase() };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return { phone: `+91${digits}` };
  }
  if (trimmed.startsWith('+')) {
    return { phone: trimmed };
  }
  if (digits.length >= 11) {
    return { phone: `+${digits}` };
  }
  return { phone: trimmed };
}

export async function sendOtp(params: {
  email?: string;
  phone?: string;
  type: OtpType;
}): Promise<{ otp?: string }> {
  const { data } = await httpClient.post<ApiSuccess<{ otp?: string }>>('/api/auth/send-otp', params);
  if (!data.success) throw new Error(data.message || 'Failed to send OTP');
  return data.data ?? {};
}

export async function loginWithPassword(
  identifier: string,
  password: string,
): Promise<AuthResponseData> {
  const creds = parseIdentifier(identifier);
  const body: LoginPasswordPayload = { password, ...creds };
  if (!body.email && !body.phone) {
    throw new Error('Enter a valid email or phone number');
  }
  const { data } = await httpClient.post<ApiSuccess<AuthResponseData>>('/api/auth/login', body);
  if (!data.success || !data.data?.accessToken) {
    throw new Error(data.message || 'Login failed');
  }
  return data.data;
}

export async function loginWithOtp(payload: LoginOtpPayload): Promise<AuthResponseData> {
  const { data } = await httpClient.post<ApiSuccess<AuthResponseData>>('/api/auth/login-otp', payload);
  if (!data.success || !data.data?.accessToken) {
    throw new Error(data.message || 'Login failed');
  }
  return data.data;
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthResponseData> {
  const { data } = await httpClient.post<ApiSuccess<AuthResponseData>>('/api/auth/register', payload);
  if (!data.success || !data.data?.accessToken) {
    throw new Error(data.message || 'Registration failed');
  }
  return data.data;
}

export async function logoutRemote(): Promise<void> {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();
  if (!accessToken) return;
  try {
    await httpClient.post('/api/auth/logout', { refreshToken });
  } catch (e) {
    const err = e as AxiosError;
    if (err.response?.status !== 401) {
      // best-effort logout
    }
  }
}
