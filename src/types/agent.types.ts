export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'VISIT_SCHEDULED'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST';

export interface AgentLead {
  id: string;
  leadName: string;
  maskedPhone: string;
  stage: LeadStage;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: string;
  propertyImage?: string | null;
  propertyTag?: string;
  budgetRange?: string;
  timeline?: string;
  requirements?: string;
  lastActivityAt: string;
  isUrgent?: boolean;
  isShared?: boolean;
  sharedWith?: string[];
  lastNote?: string;
  intentScore?: number;
  nextFollowUp?: string;
}

export interface AgentListing {
  id: string;
  title: string;
  location: string;
  price: string;
  image?: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'SOLD' | 'RENTED' | 'EXPIRED';
  isFeatured?: boolean;
  isTopPerformer?: boolean;
  views: number;
  leads: number;
  saves: number;
  calls: number;
  viewsChange?: number;
}

export interface AgentTeamMember {
  id: string;
  name: string;
  role: string;
  avatarInitials?: string;
  avatarImage?: string | null;
  activeListings: number;
  permissions: ('ADMIN' | 'BILLING' | 'EDITOR' | 'ANALYTICS' | 'VIEWER')[];
}

export interface AgentKpi {
  activeListings: number;
  activeListingsChange: number;
  newLeadsToday: number;
  newLeadsPriority: string;
  visitsThisWeek: number;
  visitsNote: string;
  conversionRate: number;
}

export interface SalesPipeline {
  new: number;
  contacted: number;
  visit: number;
  negotiation: number;
  converted: number;
}

export interface AgentDashboardData {
  agentName: string;
  tierLabel: string;
  kpi: AgentKpi;
  pipeline: SalesPipeline;
  urgentFollowUps: AgentLead[];
  topListings: AgentListing[];
  membership: {
    planLabel: string;
    daysRemaining: number;
  } | null;
}

export interface AgencyProfile {
  agencyName: string;
  reraId: string;
  rating: number;
  reviewCount: number;
  tier: string;
  logoUri?: string | null;
  yearsOfExperience: string;
  languages: string;
  specializations: string[];
  website: string;
  boostCredits: number;
  membershipLabel: string;
  autoFollowUp: boolean;
}

export interface AgentListingsResult {
  listings: AgentListing[];
  summary: {
    activeCount: number;
    totalCount: number;
    totalLeads: number;
  };
}

export interface AgentListingPerformance {
  listing: AgentListing;
  series: Array<{
    date: string;
    views: number;
    leads: number;
    saves: number;
    calls: number;
  }>;
  recentLeads: AgentLead[];
  period: string;
}

export interface AgentAnalyticsData {
  period: string;
  revenue: number;
  revenueLabel: string;
  revenueChangePercent: number | null;
  avgConversionDays: number;
  conversionRate: number;
  funnel: {
    views: number;
    leads: number;
    visits: number;
    deals: number;
  };
  series: Array<{
    date: string;
    views: number;
    leads: number;
    visits: number;
    deals: number;
    revenue: number;
  }>;
  insight: string;
}

export interface AgentTeamResult {
  members: AgentTeamMember[];
  summary: {
    totalMembers: number;
    totalActiveListings: number;
    maxTeamMembers: number;
    tierLabel: string;
  };
}
