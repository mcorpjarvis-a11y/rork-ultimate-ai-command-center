import { API_CONFIG, RATE_LIMITS } from '@/config/api.config';
import { APIResponse, APIRequestOptions, APIError, RateLimitInfo } from '@/types/api.types';

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestQueue: Map<string, Promise<any>>;
  private rateLimits: Map<string, RateLimitInfo>;
  private abortControllers: Map<string, AbortController>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.requestQueue = new Map();
    this.rateLimits = new Map();
    this.abortControllers = new Map();
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  private async checkRateLimit(category: string): Promise<boolean> {
    const limit = this.rateLimits.get(category);
    if (!limit) return true;
    
    if (limit.remaining <= 0) {
      const now = Date.now();
      if (now < limit.reset) {
        throw new Error(`Rate limit exceeded. Resets at ${new Date(limit.reset).toISOString()}`);
      }
      this.rateLimits.delete(category);
    }
    return true;
  }

  private updateRateLimit(category: string, headers: Headers) {
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '100');
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '100');
    const reset = parseInt(headers.get('X-RateLimit-Reset') || String(Date.now() + 60000));

    this.rateLimits.set(category, { limit, remaining, reset });
  }

  async request<T = any>(
    endpoint: string,
    options: APIRequestOptions = {},
    category: string = 'default'
  ): Promise<APIResponse<T>> {
    await this.checkRateLimit(category);

    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.timeout,
      retries = API_CONFIG.retryAttempts,
      cache = false,
      signal,
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const cacheKey = `${method}:${url}`;

    if (cache && method === 'GET' && this.requestQueue.has(cacheKey)) {
      console.log(`[APIClient] Returning cached request for ${cacheKey}`);
      return this.requestQueue.get(cacheKey)!;
    }

    const controller = new AbortController();
    const requestId = `${Date.now()}_${Math.random()}`;
    this.abortControllers.set(requestId, controller);

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestPromise = this.executeRequest<T>(
      url,
      {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      },
      retries,
      category
    ).finally(() => {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
      if (cache) {
        setTimeout(() => this.requestQueue.delete(cacheKey), 5000);
      }
    });

    if (cache && method === 'GET') {
      this.requestQueue.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  private async executeRequest<T>(
    url: string,
    init: RequestInit,
    retriesLeft: number,
    category: string
  ): Promise<APIResponse<T>> {
    try {
      console.log(`[APIClient] ${init.method} ${url}`);
      
      const response = await fetch(url, init);

      this.updateRateLimit(category, response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          code: errorData.code || `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          details: errorData.details,
          statusCode: response.status,
        };

        if (response.status >= 500 && retriesLeft > 0) {
          console.log(`[APIClient] Retrying... (${retriesLeft} attempts left)`);
          await this.delay(API_CONFIG.retryDelay);
          return this.executeRequest<T>(url, init, retriesLeft - 1, category);
        }

        return { success: false, error };
      }

      const data = await response.json();

      return {
        success: true,
        data,
        metadata: {
          timestamp: Date.now(),
          requestId: response.headers.get('X-Request-Id') || '',
          version: response.headers.get('X-API-Version') || '1.0',
        },
      };
    } catch (error: any) {
      console.error(`[APIClient] Request failed:`, error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'REQUEST_TIMEOUT', message: 'Request timed out' },
        };
      }

      if (retriesLeft > 0) {
        await this.delay(API_CONFIG.retryDelay);
        return this.executeRequest<T>(url, init, retriesLeft - 1, category);
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network request failed',
          details: error,
        },
      };
    }
  }

  async get<T = any>(endpoint: string, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body: any, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body: any, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, body: any, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  cancelAllRequests() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getRateLimitInfo(category: string): RateLimitInfo | undefined {
    return this.rateLimits.get(category);
  }
}

export default new APIClient();
