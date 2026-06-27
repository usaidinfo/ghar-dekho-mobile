/**
 * Agent service — API calls for agent dashboard features.
 * Backed by the same base axios instance used across the app.
 */
import type {
  AgentDashboardData,
  AgentLead,
  AgentListing,
  AgentTeamMember,
  AgencyProfile,
} from '../types/agent.types';

// --- Mock data (replace with real API calls when backend is ready) ---

const MOCK_DASH: AgentDashboardData = {
  agentName: 'Rajesh',
  tierLabel: 'Elite Broker Tier',
  kpi: {
    activeListings: 12,
    activeListingsChange: 2,
    newLeadsToday: 5,
    newLeadsPriority: 'GOLD PRIORITY',
    visitsThisWeek: 3,
    visitsNote: 'Scheduled for Sat/Sun',
    conversionRate: 18,
  },
  pipeline: { new: 24, contacted: 12, visit: 8, negotiation: 3, converted: 14 },
  urgentFollowUps: [
    {
      id: '1',
      leadName: 'Ananya K.',
      maskedPhone: '••••••1234',
      stage: 'NEW',
      propertyTitle: 'DLF Camellias - 4 BHK Inquiry',
      propertyLocation: 'Gurgaon',
      propertyPrice: '₹ 8.5 Cr',
      lastActivityAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      isUrgent: true,
    },
    {
      id: '2',
      leadName: 'Rahul Sharma',
      maskedPhone: '••••••5678',
      stage: 'VISIT_SCHEDULED',
      propertyTitle: 'Bandra West Plot - Visit Schedule',
      propertyLocation: 'Mumbai',
      propertyPrice: '₹ 5.2 Cr',
      lastActivityAt: new Date().toISOString(),
    },
  ],
  topListings: [
    {
      id: '1',
      title: 'The Heritage Suites, Gurgaon',
      location: 'Gurgaon',
      price: '₹ 8.5 Cr',
      status: 'ACTIVE',
      isFeatured: true,
      views: 4200,
      leads: 42,
      saves: 89,
      calls: 12,
    },
    {
      id: '2',
      title: 'Emerald Hills Villa, Pune',
      location: 'Pune',
      price: '₹ 4.2 Cr',
      status: 'ACTIVE',
      views: 2100,
      leads: 18,
      saves: 34,
      calls: 5,
    },
  ],
  membership: { planLabel: 'Broker Medium Plan', daysRemaining: 8 },
};

const MOCK_LEADS: AgentLead[] = [
  {
    id: '1',
    leadName: 'Aryan Sharma',
    maskedPhone: '••••••3210',
    stage: 'NEW',
    propertyTitle: 'The Crest, DLF Phase 5',
    propertyLocation: 'Sector 54, Gurgaon',
    propertyPrice: '₹ 8.50 Cr',
    propertyTag: 'SEARCH',
    lastActivityAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    isUrgent: true,
  },
  {
    id: '2',
    leadName: 'Ananya Mehra',
    maskedPhone: '••••••9821',
    stage: 'VISIT_SCHEDULED',
    propertyTitle: 'Coastal Residency',
    propertyLocation: 'Alibaug, Mumbai Outskirts',
    propertyPrice: '₹ 14.20 Cr',
    propertyTag: 'FEATURED',
    lastActivityAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    nextFollowUp: 'TOMORROW 4 PM',
  },
  {
    id: '3',
    leadName: 'Rohan Kapoor',
    maskedPhone: '••••••5544',
    stage: 'NEGOTIATION',
    propertyTitle: 'Godrej South Estate',
    propertyLocation: 'Okhla, South Delhi',
    propertyPrice: '₹ 3.45 Cr Offer',
    lastActivityAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: '4',
    leadName: 'Priya Venkat',
    maskedPhone: '••••••1099',
    stage: 'CONTACTED',
    propertyTitle: 'Prestige Estates, Bangalore',
    propertyLocation: 'Bangalore',
    propertyPrice: '₹ 2.8 Cr',
    lastActivityAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    lastNote: '"Will call back after discussing with spouse..."',
  },
  {
    id: '5',
    leadName: 'Vikram Singh',
    maskedPhone: '••••••4433',
    stage: 'NEW',
    propertyTitle: 'Oberoi Realty, Worli',
    propertyLocation: 'Mumbai',
    propertyPrice: '₹ 9.5 Cr',
    lastActivityAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    isShared: true,
    sharedWith: ['VS', 'AS'],
  },
];

const MOCK_LEAD_DETAIL: AgentLead = {
  id: '6',
  leadName: 'Amit Sharma',
  maskedPhone: '••••••1122',
  stage: 'VISIT_SCHEDULED',
  propertyTitle: 'Emerald Heights Estate',
  propertyLocation: 'Vijay Nagar, Indore',
  propertyPrice: '₹55,00,000',
  budgetRange: '₹45L – ₹60L',
  timeline: 'Immediate Purchase',
  requirements:
    '"Client prefers high-floor units with sunrise views. Needs a dedicated study area for remote work. Has expressed specific interest in the 1450 sq.ft. layout at Emerald Heights."',
  lastActivityAt: new Date(Date.now() - 30 * 60_000).toISOString(),
  intentScore: 90,
  lastNote: 'Check if the developer is offering a waiver on GST for immediate bookings.',
};

const MOCK_LISTINGS: AgentListing[] = [
  {
    id: '1',
    title: 'Skyline Residency',
    location: 'Worli Sea Face, Mumbai',
    price: '₹ 12 Cr',
    status: 'ACTIVE',
    isFeatured: true,
    isTopPerformer: true,
    views: 2482,
    leads: 84,
    saves: 120,
    calls: 32,
    viewsChange: 12,
  },
  {
    id: '2',
    title: 'The Oberoi Enclave Penthouse',
    location: 'Worli, Mumbai',
    price: '₹14.5 Cr',
    status: 'ACTIVE',
    isFeatured: true,
    isTopPerformer: true,
    views: 1200,
    leads: 42,
    saves: 89,
    calls: 12,
    viewsChange: 8,
  },
  {
    id: '3',
    title: 'Sky-Garden Duplex',
    location: 'DLF Phase 5, Gurgaon',
    price: '₹8.2 Cr',
    status: 'ACTIVE',
    views: 640,
    leads: 18,
    saves: 34,
    calls: 5,
  },
];

const MOCK_TEAM: AgentTeamMember[] = [
  {
    id: '1',
    name: 'Vikram Malhotra',
    role: 'Senior Associate',
    avatarInitials: 'VM',
    activeListings: 14,
    permissions: ['ADMIN', 'BILLING'],
  },
  {
    id: '2',
    name: 'Ananya Sharma',
    role: 'Senior Associate',
    avatarInitials: 'AS',
    activeListings: 9,
    permissions: ['EDITOR'],
  },
  {
    id: '3',
    name: 'Kabir Khan',
    role: 'Senior Associate',
    avatarInitials: 'KK',
    activeListings: 12,
    permissions: ['EDITOR', 'ANALYTICS'],
  },
  {
    id: '4',
    name: 'Meera Iyer',
    role: 'Senior Associate',
    avatarInitials: 'MI',
    activeListings: 7,
    permissions: ['VIEWER'],
  },
];

const MOCK_AGENCY: AgencyProfile = {
  agencyName: 'Malhotra Luxury Realty',
  reraId: 'PRM/KA/RERA/1251/310/AG/210520',
  rating: 4.8,
  reviewCount: 124,
  tier: 'ELITE PARTNER',
  yearsOfExperience: '10-15 Years',
  languages: 'English, Hindi, Punjabi, Marathi',
  specializations: ['Residential', 'Luxury'],
  website: 'https://malhotraluxury.in',
  boostCredits: 450,
  membershipLabel: 'Pro Plus',
  autoFollowUp: true,
};

// --- Service functions ---

export async function fetchAgentDashboard(): Promise<AgentDashboardData> {
  return MOCK_DASH;
}

export async function fetchAgentLeads(_stage?: string): Promise<AgentLead[]> {
  return MOCK_LEADS;
}

export async function fetchAgentLeadDetail(_id: string): Promise<AgentLead> {
  return MOCK_LEAD_DETAIL;
}

export async function fetchAgentListings(): Promise<AgentListing[]> {
  return MOCK_LISTINGS;
}

export async function fetchAgentTeam(): Promise<AgentTeamMember[]> {
  return MOCK_TEAM;
}

export async function fetchAgencyProfile(): Promise<AgencyProfile> {
  return MOCK_AGENCY;
}

export async function saveAgencyProfile(_profile: Partial<AgencyProfile>): Promise<void> {
  // TODO: PATCH /api/agent/agency-profile
}
