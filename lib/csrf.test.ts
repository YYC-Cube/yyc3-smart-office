import { extractCsrfToken, validateCsrfToken, validateRequestCsrfToken, generateCsrfToken, rotateCsrfToken } from './csrf';

// 简易的 Cookie 容器实现，模拟 Next.js 的 cookies.get API
class CookieBag {
  private store = new Map<string, string>();
  set(name: string, value: string) {
    this.store.set(name, value);
  }
  get(name: string) {
    const val = this.store.get(name);
    return val ? { value: val } : undefined;
  }
}

function makeRequest(options: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}) {
  const bag = new CookieBag();
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([k, v]) => bag.set(k, v));
  }
  const headers = new Headers(options.headers || {});
  return {
    headers,
    cookies: {
      get: (name: string) => bag.get(name),
    },
  } as const;
}

describe('lib/csrf.ts', () => {
  test('extractCsrfToken: prefers standard header X-XSRF-TOKEN', () => {
    const req = makeRequest({
      headers: { 'X-XSRF-TOKEN': 'header-token', 'X-CSRF-TOKEN': 'custom-token' },
    });
    expect(extractCsrfToken(req)).toBe('header-token');
  });

  test('extractCsrfToken: falls back to cookie XSRF-TOKEN', () => {
    const req = makeRequest({ cookies: { 'XSRF-TOKEN': 'cookie-token' } });
    expect(extractCsrfToken(req)).toBe('cookie-token');
  });

  test('validateCsrfToken: enforces session/IP/UA binding', async () => {
    const sessionId = 'session-abc';
    const ip = '203.0.113.10';
    const ua = 'UnitTestAgent/1.0';
    const token = await generateCsrfToken(sessionId, ip, ua);

    // 绑定信息一致 => 验证通过
    await expect(validateCsrfToken(token, sessionId, ip, ua)).resolves.toBe(true);

    // 会话不一致 => 验证失败
    await expect(validateCsrfToken(token, 'wrong-session', ip, ua)).resolves.toBe(false);

    // IP不一致 => 验证失败
    await expect(validateCsrfToken(token, sessionId, '198.51.100.5', ua)).resolves.toBe(false);

    // UA不一致 => 验证失败
    await expect(validateCsrfToken(token, sessionId, ip, 'DifferentAgent/2.0')).resolves.toBe(false);
  });

  test('rotateCsrfToken: deletes old token and issues a valid new one', async () => {
    const sessionId = 'session-rotate';
    const ip = '192.0.2.23';
    const ua = 'RotateAgent/1.0';
    const oldToken = await generateCsrfToken(sessionId, ip, ua);

    const newToken = await rotateCsrfToken(oldToken, sessionId, ip, ua);
    expect(newToken).toBeDefined();
    expect(newToken).not.toEqual(oldToken);

    // 旧令牌已失效
    await expect(validateCsrfToken(oldToken, sessionId, ip, ua)).resolves.toBe(false);
    // 新令牌有效
    await expect(validateCsrfToken(newToken, sessionId, ip, ua)).resolves.toBe(true);
  });

  test('validateRequestCsrfToken: validates request with bound token and session', async () => {
    const sessionId = 'session-req';
    const ip = '198.51.100.8';
    const ua = 'ReqAgent/3.1';

    const token = await generateCsrfToken(sessionId, ip, ua);
    const req = makeRequest({
      headers: {
        'X-XSRF-TOKEN': token,
        'X-Forwarded-For': ip,
        'User-Agent': ua,
      },
      cookies: {
        auth_session: sessionId,
        'XSRF-TOKEN': token,
      },
    });

    await expect(validateRequestCsrfToken(req)).resolves.toBe(true);
  });

  test('validateRequestCsrfToken: dev-mode fallback when store lost but header=cookie and session present', async () => {
    const sessionId = 'session-dev';
    const token = 'non-existent-token'; // 未在内存存储中生成

    const req = makeRequest({
      headers: {
        'X-XSRF-TOKEN': token,
        'User-Agent': 'DevAgent/0.1',
      },
      cookies: {
        auth_session: sessionId,
        'XSRF-TOKEN': token,
      },
    });

    const prevEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
    try {
      await expect(validateRequestCsrfToken(req)).resolves.toBe(true);
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: prevEnv, writable: true });
    }
  });

  test('validateCsrfToken: enforces max usage count and cleanup', async () => {
    const sessionId = 'session-uses';
    const ip = '203.0.113.55';
    const ua = 'UseAgent/1.0';
    const token = await generateCsrfToken(sessionId, ip, ua);

    // 使用到上限（100次）都应返回true
    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await validateCsrfToken(token, sessionId, ip, ua);
      expect(ok).toBe(true);
    }
    // 第101次应返回false，且令牌被清理
    await expect(validateCsrfToken(token, sessionId, ip, ua)).resolves.toBe(false);
    // 再次尝试也应失败（已删除）
    await expect(validateCsrfToken(token, sessionId, ip, ua)).resolves.toBe(false);
  });

  test('validateCsrfToken: expires after 30 minutes and gets pruned', async () => {
    const sessionId = 'session-exp';
    const ip = '198.51.100.77';
    const ua = 'ExpireAgent/2.0';
    const token = await generateCsrfToken(sessionId, ip, ua);

    // 快速验证一次使其刷新过期时间
    await expect(validateCsrfToken(token, sessionId, ip, ua)).resolves.toBe(true);

    // 使用伪造时间前进超过30分钟
    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now + 31 * 60 * 1000);

    // 过期后验证应失败，同时令牌被删除
    await expect(validateCsrfToken(token, sessionId, ip, ua)).resolves.toBe(false);

    // 恢复真实计时器
    jest.useRealTimers();
  });
});