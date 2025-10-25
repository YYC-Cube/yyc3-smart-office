import { type NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf';

// 需要CSRF保护的方法
const CSRF_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// 不需要CSRF保护的路径
const CSRF_EXEMPT_PATHS = [
  '/api/auth/csrf-token', // 获取CSRF令牌的API
];

export function csrfMiddleware(req: NextRequest) {
  const { method, nextUrl } = req;
  const { pathname } = nextUrl;

  // 检查是否需要CSRF保护
  if (
    CSRF_METHODS.includes(method) &&
    !CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))
  ) {
    // 从请求头或请求体中获取CSRF令牌
    const csrfToken = req.headers.get('x-csrf-token');

    // 验证CSRF令牌
    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      return NextResponse.json({ success: false, message: 'CSRF验证失败' }, { status: 403 });
    }
  }

  return NextResponse.next();
}
