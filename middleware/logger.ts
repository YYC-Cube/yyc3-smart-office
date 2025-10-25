import { type NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { LogType } from '@/models/log';
import { verifyToken } from '@/lib/auth';

// 日志中间件
export async function loggerMiddleware(req: NextRequest) {
  const startTime = Date.now();
  const { method, url, headers } = req;
  const path = new URL(url).pathname;
  const ip = headers.get('x-forwarded-for') || 'unknown';
  const userAgent = headers.get('user-agent') || 'unknown';

  // 尝试获取用户信息
  let userId: string | undefined;
  let username: string | undefined;

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      userId = payload.id;
      username = payload.username;
    }
  } catch {
    // 令牌验证失败，不记录用户信息
  }

  // 克隆请求以获取请求体
  let requestBody: unknown;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const clonedReq = req.clone();
      requestBody = await clonedReq.json();
    } catch {
      // 无法解析请求体
    }
  }

  // 记录请求日志
  await Logger.info(LogType.SYSTEM, `${method} ${path}`, {
    userId,
    username,
    ip,
    userAgent,
    path,
    method,
    requestBody,
  });

  // 继续处理请求
  const response = NextResponse.next();

  // 记录响应日志
  const endTime = Date.now();
  const duration = endTime - startTime;

  await Logger.info(LogType.SYSTEM, `${method} ${path} ${response.status} ${duration}ms`, {
    userId,
    username,
    ip,
    userAgent,
    path,
    method,
    statusCode: response.status,
    duration,
  });

  return response;
}
