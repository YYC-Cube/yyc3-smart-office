import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/lib/auth';
import { validateRequestCsrfToken, setCsrfTokenCookie } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    const csrfOk = await validateRequestCsrfToken({ headers: request.headers, cookies: request.cookies });
    if (!csrfOk) {
      return NextResponse.json({ success: false, message: 'Invalid CSRF token' }, { status: 403 });
    }

    const oldToken = request.cookies.get('auth_token')?.value || '';
    if (!oldToken) {
      return NextResponse.json({ success: false, message: 'Missing auth token' }, { status: 401 });
    }

    const newToken = refreshToken(oldToken);

    const res = NextResponse.json({ success: true, message: 'Token refreshed' });
    res.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/',
    });

    // 同步刷新CSRF令牌以降低热更新丢失的影响
    await setCsrfTokenCookie(res, { headers: request.headers, cookies: request.cookies });

    return res;
  } catch (error) {
    console.error('刷新令牌接口错误:', error);
    return NextResponse.json({ success: false, error: 'Failed to refresh token' }, { status: 500 });
  }
}
