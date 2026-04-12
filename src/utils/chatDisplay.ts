import type { ChatLastMessage, ChatProfileSnippet } from '../types/chat.api.types';

export function formatPeerName(profile: ChatProfileSnippet | null | undefined): string {
  if (!profile) return 'Member';
  const n = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return n || 'Member';
}

export function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return 'Yesterday';
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return 'Today';
  }
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  ) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function previewLine(last: ChatLastMessage | undefined, currentUserId: string | undefined): string {
  if (!last) return '';
  const prefix = currentUserId && last.senderId === currentUserId ? 'You: ' : '';
  if (last.messageType === 'IMAGE') return `${prefix}Photo`;
  if (last.messageType === 'VIDEO') return `${prefix}Video`;
  if (last.messageType === 'PROPERTY_LINK') return `${prefix}Property link`;
  const t = last.content?.trim() || '';
  return prefix + (t.length > 48 ? `${t.slice(0, 45)}…` : t);
}
