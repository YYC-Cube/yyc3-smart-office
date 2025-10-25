import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateCsrfToken } from '@/lib/csrf';
import { createApiResponse } from '@/lib/api-middleware';

export const runtime = 'nodejs';

// 登出请求验证schema
const logoutSchema = z.object({
  csrfToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = logoutSchema.safeParse(body);
    if (!validation.success) {
      return createApiResponse(null, { status: 400, message: validation.error.message || '请求参数验证失败' });
    }

    const data = validation.data;
    const csrfValid = await validateCsrfToken(data.csrfToken);
    if (!csrfValid) {
      return createApiResponse(null, { status: 403, message: '安全验证失败' });
    }

    const response = createApiResponse(null, { status: 200, message: '登出成功' });
    response.cookies.delete('auth_token');
    response.cookies.delete('user_preferences');
    response.cookies.delete('session_data');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('登出处理错误:', error);
    const response = createApiResponse(null, { status: 500, message: '登出过程中发生错误' });
    response.cookies.delete('auth_token');
    return response;
  }
}
