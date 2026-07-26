export type ProfileType = 'OWNER' | 'AGENT' | 'BROKER' | 'BUILDER' | 'BUYER' | 'RENTER';

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImage?: string | null;
  bio?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  occupation?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  preferredLanguage?: string | null;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  profileType: ProfileType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profile: UserProfile | null;
  /** False for active paid members — used by useShouldShowAds() to gate ads. */
  adsEnabled?: boolean;
  /** Lightweight membership — used for client-side gating. */
  membership?: {
    status?: string;
    expiresAt?: string | null;
  } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPasswordPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginOtpPayload {
  email?: string;
  phone?: string;
  otp: string;
}

export interface RegisterPayload {
  email?: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  profileType?: ProfileType;
  otp: string;
}

export type OtpType = 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET';
