'use client';

import { useState, useEffect } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/auth/csrf-token');
        const data = await response.json();

        if (response.ok && data.success) {
          setCsrfToken(data.csrfToken);
        } else {
          setError(data.message || '获取CSRF令牌失败');
        }
      } catch (err) {
        setError('获取CSRF令牌时出错');
        console.error('CSRF令牌获取错误:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCsrfToken();
  }, []);

  return { csrfToken, isLoading, error };
}
