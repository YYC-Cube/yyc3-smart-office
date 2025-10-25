import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 增强的CSRF令牌存储结构，绑定到会话ID
interface CsrfTokenInfo {
  token: string;
  sessionId: string; // 绑定到会话ID
  ipHash: string;    // 绑定到IP地址的哈希值
  userAgentHash: string; // 绑定到用户代理的哈希值
  createdAt: number;
  expires: number;
  lastUsed?: number;
  useCount: number;
}

// CSRF令牌存储（实际应用中应使用Redis等分布式存储）
const csrfTokens = new Map<string, CsrfTokenInfo>();
const CSRF_TOKEN_EXPIRY = 30 * 60 * 1000; // 30分钟过期
const MAX_TOKEN_USES = 100; // 单个令牌最大使用次数

/**
 * 生成安全哈希值
 * @param input 输入字符串
 * @returns 生成的哈希值
 */
function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * 生成CSRF令牌
 * @param sessionId 会话ID（可选）
 * @param ipAddress IP地址（可选）
 * @param userAgent 用户代理（可选）
 * @returns 生成的CSRF令牌
 */
export async function generateCsrfToken(
  sessionId: string = crypto.randomBytes(16).toString('hex'),
  ipAddress: string = 'unknown',
  userAgent: string = 'unknown'
): Promise<string> {
  // 生成更安全的CSRF令牌（64字节而不是32字节）
  const token = crypto.randomBytes(64).toString('hex');
  
  // 存储令牌信息，绑定到会话、IP和用户代理
  const now = Date.now();
  csrfTokens.set(token, {
    token,
    sessionId,
    ipHash: generateHash(ipAddress),
    userAgentHash: generateHash(userAgent),
    createdAt: now,
    expires: now + CSRF_TOKEN_EXPIRY,
    useCount: 0
  });
  
  // 清理过期的令牌
  cleanupExpiredTokens();
  
  return token;
}

/**
 * 验证CSRF令牌
 * @param token 要验证的CSRF令牌
 * @param sessionId 会话ID（可选，用于验证绑定关系）
 * @param ipAddress IP地址（可选，用于验证绑定关系）
 * @param userAgent 用户代理（可选，用于验证绑定关系）
 * @returns 验证结果
 */
export async function validateCsrfToken(
  token: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  if (!token || typeof token !== 'string' || token.length < 32) {
    return false;
  }
  
  // 获取存储的令牌信息
  const storedToken = csrfTokens.get(token);
  
  // 检查令牌是否存在
  if (!storedToken) {
    return false;
  }
  
  // 检查令牌是否过期
  if (storedToken.expires < Date.now()) {
    // 如果令牌已过期，从存储中删除
    csrfTokens.delete(token);
    return false;
  }
  
  // 检查令牌使用次数是否超过限制
  if (storedToken.useCount >= MAX_TOKEN_USES) {
    csrfTokens.delete(token);
    return false;
  }
  
  // 如果提供了会话ID，验证绑定关系
  if (sessionId && storedToken.sessionId !== sessionId) {
    return false;
  }
  
  // 如果提供了IP地址，验证绑定关系
  if (ipAddress && storedToken.ipHash !== generateHash(ipAddress)) {
    return false;
  }
  
  // 如果提供了用户代理，验证绑定关系
  if (userAgent && storedToken.userAgentHash !== generateHash(userAgent)) {
    return false;
  }
  
  // 更新令牌使用信息
  storedToken.lastUsed = Date.now();
  storedToken.useCount++;
  
  // 刷新令牌过期时间（滑动窗口）
  storedToken.expires = Date.now() + CSRF_TOKEN_EXPIRY;
  
  return true;
}

/**
 * 清理过期的CSRF令牌
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [token, info] of csrfTokens.entries()) {
    if (info.expires < now || info.useCount >= MAX_TOKEN_USES) {
      csrfTokens.delete(token);
      deletedCount++;
    }
  }
  
  // 如果删除了大量令牌或令牌数量过多，记录日志
  if (deletedCount > 10 || csrfTokens.size > 1000) {
    console.log(`CSRF令牌清理: 删除了 ${deletedCount} 个过期令牌，当前剩余 ${csrfTokens.size} 个令牌`);
  }
}

/**
 * 从请求中获取会话ID
 * @param request 请求对象
 * @returns 会话ID或生成的临时ID
 */
function getSessionIdFromRequest(request: { cookies: { get?: (name: string) => { value: string } | undefined } }): string {
  // 尝试从会话cookie获取
  if (request.cookies && request.cookies.get) {
    const sessionCookie = request.cookies.get('session_id') || request.cookies.get('auth_session');
    if (sessionCookie?.value) {
      return sessionCookie.value;
    }
  }
  
  // 如果没有会话ID，生成临时ID
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 为响应设置CSRF令牌cookie
 * @param response Next.js响应对象
 * @param request 关联的请求对象（可选，用于获取会话信息）
 * @returns 更新后的响应对象
 */
export async function setCsrfTokenCookie<T>(response: NextResponse<T>, request?: { headers: Headers; cookies: { get?: (name: string) => { value: string } | undefined } }): Promise<NextResponse<T>> {
  // 尝试从请求中获取会话信息
  let sessionId = crypto.randomBytes(16).toString('hex');
  let ipAddress = 'unknown';
  let userAgent = 'unknown';

  if (request) {
    sessionId = getSessionIdFromRequest(request);

    // 从请求中获取IP地址
    const forwardedFor = request.headers.get('X-Forwarded-For');
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim();
    } else {
      ipAddress = request.headers.get('x-real-ip') || ipAddress;
    }

    // 从请求中获取用户代理
    userAgent = request.headers.get('User-Agent') || userAgent;
  }

  // 生成绑定到会话信息的令牌
  const token = await generateCsrfToken(sessionId, ipAddress, userAgent);

  response.cookies.set('XSRF-TOKEN', token, {
    httpOnly: false, // CSRF令牌需要被JavaScript访问
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  });

  // 如果没有会话cookie，设置一个
  if (request && (!request.cookies || !request.cookies.get || !request.cookies.get('auth_session'))) {
    response.cookies.set('auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY,
      path: '/',
    });
  }

  return response;
}

/**
 * 从请求头或cookie中提取CSRF令牌
 * @param request 包含令牌的请求
 * @returns 提取的令牌，如果未找到则为null
 */
export function extractCsrfToken(request: { headers: Headers; cookies: { get?: (name: string) => { value: string } | undefined } }): string | null {
  if (!request || !request.headers) {
    return null;
  }
  
  // 首先从标准的CSRF头中获取
  const headerToken = request.headers.get('X-XSRF-TOKEN');
  if (headerToken && typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }
  
  // 然后尝试从自定义头中获取
  const customHeaderToken = request.headers.get('X-CSRF-TOKEN');
  if (customHeaderToken && typeof customHeaderToken === 'string' && customHeaderToken.trim()) {
    return customHeaderToken.trim();
  }
  
  // 从Next.js的自定义头中获取
  const nextHeaderToken = request.headers.get('next-action-csrf');
  if (nextHeaderToken && typeof nextHeaderToken === 'string' && nextHeaderToken.trim()) {
    return nextHeaderToken.trim();
  }
  
  // 最后尝试从cookie中获取
  if (request.cookies && request.cookies.get) {
    const cookieToken = request.cookies.get('XSRF-TOKEN')?.value;
    if (cookieToken && typeof cookieToken === 'string' && cookieToken.trim()) {
      return cookieToken.trim();
    }
  }
  
  return null;
}

/**
 * 验证请求是否包含有效的CSRF令牌
 * @param request 要验证的请求
 * @returns 验证结果
 */
export async function validateRequestCsrfToken(request: { headers: Headers; cookies: { get?: (name: string) => { value: string } | undefined } }): Promise<boolean> {
  try {
    // 提取请求中的CSRF令牌
    const requestToken = extractCsrfToken(request);
    
    if (!requestToken) {
      return false;
    }
    
    // 获取请求的会话信息用于验证
    const sessionId = getSessionIdFromRequest(request);
    
    let ipAddress = 'unknown';
    let userAgent = 'unknown';
    
    if (request && request.headers) {
      // 从请求中获取IP地址
      const forwardedFor = request.headers.get('X-Forwarded-For');
      if (forwardedFor) {
        ipAddress = forwardedFor.split(',')[0].trim();
      } else {
        ipAddress = request.headers.get('x-real-ip') || ipAddress;
      }
      
      // 从请求中获取用户代理
      userAgent = request.headers.get('User-Agent') || userAgent;
    }
    
    // 使用会话信息验证令牌（标准路径）
    const valid = await validateCsrfToken(requestToken, sessionId, ipAddress, userAgent);
    if (valid) {
      return true;
    }

    // 开发环境降级策略：
    // 若内存令牌因热重载丢失，但请求头与Cookie中的令牌一致且存在会话Cookie，则视为有效。
    if (process.env.NODE_ENV !== 'production') {
      const cookieToken = request.cookies?.get?.('XSRF-TOKEN')?.value;
      const hasSession = Boolean(request.cookies?.get?.('auth_session')?.value || request.cookies?.get?.('session_id')?.value);
      if (cookieToken && cookieToken === requestToken && hasSession) {
        console.warn('CSRF验证降级为Cookie一致性校验（开发模式）');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('CSRF令牌验证错误:', error);
    return false;
  }
}

/**
 * 生成新的CSRF令牌并删除旧令牌
 * @param oldToken 旧的CSRF令牌
 * @param sessionId 会话ID
 * @param ipAddress IP地址
 * @param userAgent 用户代理
 * @returns 新的CSRF令牌
 */
export async function rotateCsrfToken(
  oldToken: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  // 删除旧令牌
  if (oldToken) {
    csrfTokens.delete(oldToken);
  }
  
  // 生成新令牌
  return await generateCsrfToken(sessionId, ipAddress || 'unknown', userAgent || 'unknown');
}