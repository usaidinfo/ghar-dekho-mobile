import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearSessionTokens, setSessionTokens } from '../api/session';
import { authService } from '../services';
import type { AuthUser, ProfileType, RegisterPayload } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, access: string, refresh: string) => void;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (payload: { email?: string; phone?: string; otp: string }) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, access, refresh) => {
        setSessionTokens(access, refresh);
        set({ user, accessToken: access, refreshToken: refresh });
      },
      setTokens: (access, refresh) => {
        setSessionTokens(access, refresh);
        set({ accessToken: access, refreshToken: refresh });
      },
      clearAuth: () => {
        clearSessionTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      },
      loginWithPassword: async (identifier, password) => {
        const res = await authService.loginWithPassword(identifier, password);
        get().setAuth(res.user, res.accessToken, res.refreshToken);
      },
      loginWithOtp: async payload => {
        const res = await authService.loginWithOtp(payload);
        get().setAuth(res.user, res.accessToken, res.refreshToken);
      },
      register: async payload => {
        const res = await authService.registerAccount(payload);
        get().setAuth(res.user, res.accessToken, res.refreshToken);
      },
      logout: async () => {
        await authService.logoutRemote();
        get().clearAuth();
      },
    }),
    {
      name: 'ghardekho-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      onRehydrateStorage: () => state => {
        if (state?.accessToken && state?.refreshToken) {
          setSessionTokens(state.accessToken, state.refreshToken);
        }
      },
    },
  ),
);

/** Map UI account chip to backend ProfileType */
export function mapUiProfileType(
  accountType: 'buyer' | 'owner' | 'agent',
): ProfileType {
  switch (accountType) {
    case 'owner':
      return 'OWNER';
    case 'agent':
      return 'AGENT';
    default:
      return 'BUYER';
  }
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}
