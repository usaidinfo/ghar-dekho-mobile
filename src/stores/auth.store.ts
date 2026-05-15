import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearSessionTokens, setSessionTokens } from '../api/session';
import { disconnectChatSocket } from '../api/chatSocket';
import { authService, userService } from '../services';
import type { AuthUser, ProfileType, RegisterPayload, UserProfile } from '../types/auth.types';
import type { CurrentUser } from '../types/user.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setAuth: (user: AuthUser, access: string, refresh: string) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  patchProfile: (patch: Partial<UserProfile>) => void;
  patchUser: (patch: Partial<AuthUser>) => void;
  refreshCurrentUser: () => Promise<void>;
  clearAuth: () => void;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (payload: { email?: string; phone?: string; otp: string }) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

/** Map a backend `/api/users/me` response into the lighter `AuthUser` used by the store. */
function currentUserToAuthUser(curr: CurrentUser): AuthUser {
  return {
    id: curr.id,
    email: curr.email,
    phone: curr.phone,
    role: curr.role,
    profileType: curr.profileType,
    isEmailVerified: curr.isEmailVerified,
    isPhoneVerified: curr.isPhoneVerified,
    profile: curr.profile
      ? {
          id: curr.profile.id,
          firstName: curr.profile.firstName,
          lastName: curr.profile.lastName,
          profileImage: curr.profile.profileImage,
          bio: curr.profile.bio,
          gender: curr.profile.gender,
          dateOfBirth: curr.profile.dateOfBirth,
          occupation: curr.profile.occupation,
          address: curr.profile.address,
          city: curr.profile.city,
          state: curr.profile.state,
          pincode: curr.profile.pincode,
          country: curr.profile.country,
          preferredLanguage: curr.profile.preferredLanguage,
        }
      : null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setAuth: (user, access, refresh) => {
        setSessionTokens(access, refresh);
        set({ user, accessToken: access, refreshToken: refresh });
      },
      setTokens: (access, refresh) => {
        setSessionTokens(access, refresh);
        set({ accessToken: access, refreshToken: refresh });
      },
      setUser: user => set({ user }),
      patchUser: patch => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },
      patchProfile: patch => {
        const current = get().user;
        if (!current) return;
        const baseProfile = current.profile ?? {
          id: '',
          firstName: '',
          lastName: '',
          profileImage: null,
        };
        set({
          user: {
            ...current,
            profile: { ...baseProfile, ...patch },
          },
        });
      },
      refreshCurrentUser: async () => {
        const fresh = await userService.fetchCurrentUser();
        set({ user: currentUserToAuthUser(fresh) });
      },
      clearAuth: () => {
        disconnectChatSocket();
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
      onRehydrateStorage: () => (state) => {
        // Prevent "logout → login" flashes while zustand persist is still restoring state.
        useAuthStore.setState({ hasHydrated: true });
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
