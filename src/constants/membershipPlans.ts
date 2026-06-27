import type { MembershipAccountTypeDefinition } from '../types/membership.types';

const VALIDITY_DAYS = 30;

export const MEMBERSHIP_ACCOUNT_TYPES: MembershipAccountTypeDefinition[] = [
  {
    type: 'OWNER',
    title: 'Owner',
    subtitle: 'I am an Owner',
    description: 'I want to sell or rent my own property.',
    icon: 'home-city-outline',
    accent: '#2E9B6A',
    accentLight: '#E8F7EF',
    accentDark: '#1B6B47',
    plansTitle: 'Owner Plans',
    plansSubtitle: 'Choose the best plan to list your property and reach more buyers.',
    plans: [
      {
        tier: 'BASIC',
        name: 'Basic',
        priceInr: 499,
        validityDays: VALIDITY_DAYS,
        features: [
          '1 property listing',
          'Up to 10 photos',
          'Visible contact details',
          'Basic support',
        ],
      },
      {
        tier: 'MEDIUM',
        name: 'Medium',
        priceInr: 999,
        validityDays: VALIDITY_DAYS,
        features: [
          '3 property listings',
          'Up to 20 photos',
          '1 video upload',
          'Top search placement',
          'Priority support',
        ],
        highlighted: true,
      },
      {
        tier: 'PREMIUM',
        name: 'Premium',
        priceInr: 1499,
        validityDays: VALIDITY_DAYS,
        features: [
          '5 property listings',
          'Up to 30 photos',
          '2 video uploads',
          'Top search placement',
          'Featured listing',
          'Priority support',
        ],
      },
    ],
  },
  {
    type: 'BROKER',
    title: 'Broker / Dealer',
    subtitle: 'I am a Broker / Dealer',
    description: 'I deal in multiple properties for my clients.',
    icon: 'account-tie-outline',
    accent: '#2563EB',
    accentLight: '#EFF6FF',
    accentDark: '#1D4ED8',
    plansTitle: 'Broker Plans',
    plansSubtitle: 'Scale your business with more listings, leads, and visibility.',
    plans: [
      {
        tier: 'BASIC',
        name: 'Basic',
        priceInr: 999,
        validityDays: VALIDITY_DAYS,
        features: [
          '5 active listings',
          'Lead inbox access',
          'Visible contact details',
          'Basic analytics',
        ],
      },
      {
        tier: 'MEDIUM',
        name: 'Medium',
        priceInr: 1999,
        validityDays: VALIDITY_DAYS,
        features: [
          '15 active listings',
          'Lead tracking dashboard',
          'Verified broker badge',
          'Priority support',
          '1 boost per month',
        ],
        highlighted: true,
      },
      {
        tier: 'PREMIUM',
        name: 'Premium',
        priceInr: 2999,
        validityDays: VALIDITY_DAYS,
        features: [
          'Unlimited listings',
          'Advanced lead analytics',
          'Featured listings',
          'Team member access',
          '3 boosts per month',
        ],
      },
    ],
  },
  {
    type: 'BUILDER',
    title: 'Builder / Developer',
    subtitle: 'I am a Builder / Developer',
    description: 'I want to promote my projects and buildings.',
    icon: 'crane',
    accent: '#7C3AED',
    accentLight: '#F3E8FF',
    accentDark: '#6D28D9',
    plansTitle: 'Builder Plans',
    plansSubtitle: 'Promote your projects to serious buyers across India.',
    plans: [
      {
        tier: 'BASIC',
        name: 'Basic',
        priceInr: 1999,
        validityDays: VALIDITY_DAYS,
        features: [
          '1 project listing',
          'Up to 25 photos',
          'Project brochure upload',
          'Basic support',
        ],
      },
      {
        tier: 'MEDIUM',
        name: 'Medium',
        priceInr: 4999,
        validityDays: VALIDITY_DAYS,
        features: [
          '3 project listings',
          'Video + virtual tour',
          'Featured project slot',
          'Lead management',
          'Priority support',
        ],
        highlighted: true,
      },
      {
        tier: 'PREMIUM',
        name: 'Premium',
        priceInr: 9999,
        validityDays: VALIDITY_DAYS,
        features: [
          '10 project listings',
          'Homepage featured placement',
          'Dedicated account manager',
          'Campaign analytics',
          'Unlimited boosts',
        ],
      },
    ],
  },
];

export function getAccountTypeDefinition(
  type: MembershipAccountTypeDefinition['type'],
): MembershipAccountTypeDefinition {
  const found = MEMBERSHIP_ACCOUNT_TYPES.find(a => a.type === type);
  if (!found) throw new Error(`Unknown account type: ${type}`);
  return found;
}
