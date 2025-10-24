export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
}

export interface StreamResponse {
  id: string;
  chunk: string;
  done: boolean;
  metadata?: Record<string, any>;
}
