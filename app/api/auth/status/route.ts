import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value || '';
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
      const payload = verifyToken(token);
      // 返回最小必要用户信息
      const user = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        isActive: payload.isActive,
      };
      return NextResponse.json({ success: true, user });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid token';
      return NextResponse.json({ success: false, message: msg }, { status: 401 });
    }
  } catch (error) {
    console.error('获取认证状态失败:', error);
    return NextResponse.json({ success: false, error: 'Failed to get auth status' }, { status: 500 });
  }
}