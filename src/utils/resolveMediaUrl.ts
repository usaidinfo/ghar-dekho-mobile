import { API_BASE_URL } from '../config/env';

/** Turn API-relative media paths into absolute URLs for Image / Video. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = trimmed.replace(/\\/g, '/');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
