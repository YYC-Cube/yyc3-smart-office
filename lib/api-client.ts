'use client';

import { useCsrf } from '@/hooks/use-csrf';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiClientOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export function useApiClient() {
  const { csrfToken } = useCsrf();

  async function fetchApi<T = unknown>(url: string, options: ApiClientOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    // 对于非GET请求，添加CSRF令牌
    if (method !== 'GET' && csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }

    // 如果有请求体，添加Content-Type
    if (body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify({ ...body, csrfToken }) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  }

  return {
    get: <T = unknown>(url: string, headers?: Record<string, string>) =>
      fetchApi<T>(url, { method: 'GET', headers }),
    post: <T = unknown>(url: string, body: unknown, headers?: Record<string, string>) =>
      fetchApi<T>(url, { method: 'POST', body, headers }),
    put: <T = unknown>(url: string, body: unknown, headers?: Record<string, string>) =>
      fetchApi<T>(url, { method: 'PUT', body, headers }),
    delete: <T = unknown>(url: string, body?: unknown, headers?: Record<string, string>) =>
      fetchApi<T>(url, { method: 'DELETE', body, headers }),
    patch: <T = unknown>(url: string, body: unknown, headers?: Record<string, string>) =>
      fetchApi<T>(url, { method: 'PATCH', body, headers }),
  };
}
