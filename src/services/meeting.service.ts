import axios from 'axios';
import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import { getApiErrorMessage } from './auth.service';

export type MeetingType = 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';

export interface ScheduleMeetingPayload {
  propertyId: string;
  ownerId: string;
  scheduledAt: string; // ISO
  duration?: number; // minutes
  meetingType?: MeetingType;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

export interface Meeting {
  id: string;
  propertyId: string;
  ownerId: string;
  attendeeId: string;
  scheduledAt: string;
  duration: number;
  meetingType: MeetingType;
  status: string;
  notes?: string | null;
}

export async function scheduleMeeting(payload: ScheduleMeetingPayload): Promise<Meeting> {
  try {
    const { data } = await httpClient.post<ApiSuccess<Meeting>>('/api/meetings', payload);
    if (!data.success || !data.data) {
      throw new Error((data as { message?: string }).message || 'Failed to schedule visit');
    }
    return data.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(getApiErrorMessage(e));
    }
    throw e instanceof Error ? e : new Error('Failed to schedule visit');
  }
}

