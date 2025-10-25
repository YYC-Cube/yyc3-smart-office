import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useCsrf } from './use-csrf';

function TestComponent() {
  const { csrfToken, isLoading, error } = useCsrf();
  return (
    <div>
      <div data-testid="csrfToken">{csrfToken}</div>
      <div data-testid="isLoading">{String(isLoading)}</div>
      <div data-testid="error">{error ?? ''}</div>
    </div>
  );
}

describe('hooks/use-csrf', () => {
  const originalFetch = global.fetch as unknown;

  afterEach(() => {
    // 恢复原始 fetch
    global.fetch = originalFetch as typeof global.fetch;
    jest.resetAllMocks();
  });

  it('成功获取CSRF令牌并更新状态', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, csrfToken: 'token-123' })
    } as unknown as Response);

    render(<TestComponent />);

    // 初始加载中
    expect(screen.getByTestId('isLoading').textContent).toBe('true');

    // 等待加载结束并断言结果
    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
      expect(screen.getByTestId('csrfToken').textContent).toBe('token-123');
      expect(screen.getByTestId('error').textContent).toBe('');
    });

    // 校验 fetch 被正确调用
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/csrf-token');
  });

  it('后端返回失败时设置错误信息', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ success: false, message: '服务错误' })
    } as unknown as Response);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('服务错误');
      expect(screen.getByTestId('csrfToken').textContent).toBe('');
    });
  });

  it('fetch 抛出异常时设置通用错误信息', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'));

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('获取CSRF令牌时出错');
      expect(screen.getByTestId('csrfToken').textContent).toBe('');
    });
  });
});