export type MembershipAccountType = 'OWNER' | 'BROKER' | 'BUILDER';

export type MembershipPlanTier = 'BASIC' | 'MEDIUM' | 'PREMIUM';

export interface MembershipPlanDefinition {
  tier: MembershipPlanTier;
  name: string;
  priceInr: number;
  validityDays: number;
  features: string[];
  highlighted?: boolean;
}

export interface MembershipAccountTypeDefinition {
  type: MembershipAccountType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  /** Accent for cards / CTAs (role-specific) */
  accent: string;
  accentLight: string;
  accentDark: string;
  plansTitle: string;
  plansSubtitle: string;
  plans: MembershipPlanDefinition[];
}
