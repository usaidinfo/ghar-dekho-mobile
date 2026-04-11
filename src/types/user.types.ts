import type { ProfileType } from './auth.types';

export interface AgentProfileSummary {
  id: string;
  agencyName: string | null;
  agencyLogo: string | null;
  rating: number | null;
  totalReviews: number | null;
  totalProperties: number | null;
  isVerified: boolean;
  verifiedBadge: string | null;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
}

export interface CurrentUserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  bio?: string | null;
}

export interface CurrentUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  profileType: ProfileType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYCVerified: boolean;
  kycStatus: string | null;
  profile: CurrentUserProfile | null;
  agentProfile: AgentProfileSummary | null;
  _count: {
    ownedProperties: number;
    wishlists: number;
  };
}
