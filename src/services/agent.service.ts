import { httpClient } from '../api/httpClient';
import type { ApiPaginated, ApiSuccess } from '../types/api.types';
import type {
  AgentAnalyticsData,
  AgentDashboardData,
  AgentLead,
  AgentListing,
  AgentListingPerformance,
  AgentListingsResult,
  AgentTeamMember,
  AgentTeamResult,
  AgencyProfile,
  LeadStage,
} from '../types/agent.types';
import { getApiErrorMessage } from './auth.service';

function unwrap<T>(data: ApiSuccess<T>, fallback: string): T {
  if (!data.success || data.data == null) {
    throw new Error(data.message || fallback);
  }
  return data.data;
}

export async function fetchAgentDashboard(): Promise<AgentDashboardData> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgentDashboardData>>('/api/agent/dashboard');
    return unwrap(data, 'Failed to load dashboard');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentLeads(stage?: string): Promise<AgentLead[]> {
  try {
    const params: Record<string, string | number> = { page: 1, limit: 100 };
    if (stage && stage !== 'All' && stage !== 'ALL') {
      params.stage = String(stage).toUpperCase();
    }
    const { data } = await httpClient.get<ApiPaginated<AgentLead>>('/api/agent/leads', { params });
    if (!data.success) throw new Error('Failed to load leads');
    return data.data ?? [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentLeadDetail(id: string): Promise<AgentLead> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgentLead>>(`/api/agent/leads/${id}`);
    return unwrap(data, 'Failed to load lead');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function updateAgentLead(
  id: string,
  payload: {
    stage?: LeadStage;
    notes?: string;
    priority?: string;
    followUpAt?: string | null;
    requirements?: string;
    budget?: number | null;
  },
): Promise<AgentLead> {
  try {
    const { data } = await httpClient.patch<ApiSuccess<AgentLead>>(
      `/api/agent/leads/${id}`,
      payload,
    );
    return unwrap(data, 'Failed to update lead');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentListings(status?: string): Promise<AgentListingsResult> {
  try {
    const params: Record<string, string | number> = { page: 1, limit: 100 };
    if (status && status !== 'ALL') params.status = status;
    const { data } = await httpClient.get<
      ApiSuccess<AgentListing[]> & { meta?: { summary?: AgentListingsResult['summary'] } }
    >('/api/agent/listings', { params });
    const listings = unwrap(data, 'Failed to load listings');
    const meta = data.meta as
      | { summary?: AgentListingsResult['summary'] }
      | undefined;
    return {
      listings,
      summary: meta?.summary ?? {
        activeCount: listings.filter(l => l.status === 'ACTIVE').length,
        totalCount: listings.length,
        totalLeads: listings.reduce((s, l) => s + (l.leads || 0), 0),
      },
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentListingPerformance(
  listingId: string,
  period = '30D',
): Promise<AgentListingPerformance> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgentListingPerformance>>(
      `/api/agent/listings/${listingId}/performance`,
      { params: { period } },
    );
    return unwrap(data, 'Failed to load listing performance');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentAnalytics(period = '30D'): Promise<AgentAnalyticsData> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgentAnalyticsData>>('/api/agent/analytics', {
      params: { period },
    });
    return unwrap(data, 'Failed to load analytics');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgentTeam(): Promise<AgentTeamResult> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgentTeamResult>>('/api/agent/team');
    return unwrap(data, 'Failed to load team');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function fetchAgencyProfile(): Promise<AgencyProfile> {
  try {
    const { data } = await httpClient.get<ApiSuccess<AgencyProfile>>('/api/agent/agency-profile');
    return unwrap(data, 'Failed to load agency profile');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function saveAgencyProfile(
  profile: Partial<AgencyProfile>,
): Promise<AgencyProfile> {
  try {
    const body: Record<string, unknown> = {};
    if (profile.agencyName !== undefined) body.agencyName = profile.agencyName;
    if (profile.reraId !== undefined) body.reraId = profile.reraId;
    if (profile.yearsOfExperience !== undefined) {
      body.yearsOfExperience = profile.yearsOfExperience;
    }
    if (profile.languages !== undefined) body.languages = profile.languages;
    if (profile.website !== undefined) body.website = profile.website;
    if (profile.specializations !== undefined) body.specializations = profile.specializations;
    if (profile.autoFollowUp !== undefined) body.autoFollowUp = profile.autoFollowUp;
    if (profile.logoUri !== undefined) body.logoUri = profile.logoUri;

    const { data } = await httpClient.patch<ApiSuccess<AgencyProfile>>(
      '/api/agent/agency-profile',
      body,
    );
    return unwrap(data, 'Failed to save agency profile');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export type { AgentTeamMember };
