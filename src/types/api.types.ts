/**
 * Matches backend `src/utils/response.js` shape.
 */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: PaginatedMeta;
}
