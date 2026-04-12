import { httpClient } from '../api/httpClient';
import type { ApiPaginated, ApiSuccess } from '../types/api.types';
import type { ChatMessage, ChatSessionRow } from '../types/chat.api.types';

export async function fetchChatSessions(params?: { page?: number; limit?: number }) {
  const { data } = await httpClient.get<ApiPaginated<ChatSessionRow>>('/api/chat/sessions', { params });
  return data;
}

export async function fetchChatMessages(sessionId: string, params?: { page?: number; limit?: number }) {
  const { data } = await httpClient.get<ApiPaginated<ChatMessage>>(
    `/api/chat/sessions/${sessionId}/messages`,
    { params },
  );
  return data;
}

export async function createOrGetSession(body: { otherUserId: string; propertyId?: string }) {
  const { data } = await httpClient.post<ApiSuccess<ChatSessionRow>>('/api/chat/sessions', body);
  return data;
}

export async function sendChatMessageMultipart(
  sessionId: string,
  form: FormData,
): Promise<ApiSuccess<ChatMessage>> {
  const { data } = await httpClient.post<ApiSuccess<ChatMessage>>(
    `/api/chat/sessions/${sessionId}/messages`,
    form,
  );
  return data;
}

export async function sendChatMessageJson(sessionId: string, body: { content: string; messageType?: string }) {
  const { data } = await httpClient.post<ApiSuccess<ChatMessage>>(
    `/api/chat/sessions/${sessionId}/messages`,
    body,
  );
  return data;
}

export async function archiveChatSession(sessionId: string) {
  const { data } = await httpClient.put<ApiSuccess<null>>(`/api/chat/sessions/${sessionId}/archive`);
  return data;
}
