import { NextRequest, NextResponse } from 'next/server';
import { setCsrfTokenCookie } from '@/lib/csrf';

// 获取并颁发 CSRF 令牌（同时设置绑定会话的 cookie）
export async function GET(request: NextRequest) {
  try {
    const res = NextResponse.json({ success: true, message: 'CSRF token issued' });
    await setCsrfTokenCookie(res, { headers: request.headers, cookies: request.cookies });
    return res;
  } catch (error) {
    console.error('颁发CSRF令牌失败:', error);
    return NextResponse.json({ success: false, error: 'Failed to issue CSRF token' }, { status: 500 });
  }
}