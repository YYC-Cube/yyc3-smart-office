/**
 * @file 登录API路由
 * @description 处理用户登录认证
 * @module auth/login
 * @author YYC
 * @version 1.1.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateToken } from '@/lib/auth';
import { verifyPassword, checkPasswordStrength, isCommonPassword } from '@/lib/password';
import { validateRequestCsrfToken } from '@/lib/csrf';
import crypto from 'crypto';
import { Logger } from '@/lib/logger';
import { LogType } from '@/models/log';
import { createApiResponse } from '@/lib/api-middleware';

export const runtime = 'nodejs';

// 登录请求验证schema - 增强版
const loginSchema = z.object({
  username: z.string()
    .min(3, '用户名至少需要3个字符')
    .max(50, '用户名不能超过50个字符')
    .regex(/^[a-zA-Z0-9_.-]+$/, '用户名只能包含字母、数字、下划线、点和连字符')
    .trim(),
  password: z.string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符')
    .trim(),
  captcha: z.string()
    .min(4, '验证码必须至少4个字符')
    .max(6, '验证码不能超过6个字符')
    .trim(),
  generatedCaptcha: z.string().trim(),
  csrfToken: z.string().min(32, 'CSRF令牌格式不正确').trim(),
});

// 输入净化函数，防止注入攻击
type SanitizedInput = {
  username: string;
  password: string;
  captcha: string;
  generatedCaptcha: string;
  csrfToken: string;
};

function sanitizeInput(input: Record<string, unknown>): SanitizedInput {
  const sanitized: SanitizedInput = {
    username: (typeof input.username === 'string' ? input.username : '').replace(/[<>'"&]/g, ''),
    password: typeof input.password === 'string' ? input.password : '',
    captcha: (typeof input.captcha === 'string' ? input.captcha : '').replace(/[^a-zA-Z0-9]/g, ''),
    generatedCaptcha: (typeof input.generatedCaptcha === 'string' ? input.generatedCaptcha : '').replace(/[^a-zA-Z0-9]/g, ''),
    csrfToken: (typeof input.csrfToken === 'string' ? input.csrfToken : '').replace(/[^a-zA-Z0-9]/g, ''),
  };
  
  return sanitized;
}

// 模拟用户数据 - 注意：实际应用中应存储哈希密码
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'hashed_admin123',
    email: 'admin@0379.email',
    name: '系统管理员',
    role: 'admin',
    isActive: true,
    permissions: ['all'],
  },
  {
    id: '2',
    username: 'manager',
    password: 'hashed_manager123',
    email: 'manager@0379.email',
    name: '部门经理',
    role: 'manager',
    isActive: true,
    permissions: ['employee_view', 'project_view', 'report_view'],
  },
  {
    id: '3',
    username: 'employee',
    password: 'hashed_employee123',
    email: 'employee@0379.email',
    name: '普通员工',
    role: 'employee',
    isActive: true,
    permissions: ['personal_view'],
  },
];

// 限制登录尝试次数 - 增强版
interface LoginAttemptInfo {
  count: number;
  lastAttempt: number;
  usernamesAttempted: Set<string>;
  lockExpires?: number;
}

const loginAttempts = new Map<string, LoginAttemptInfo>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const MAX_USER_ATTEMPTS = 3;
const USER_LOCK_TIME = 30 * 60 * 1000;

function hashIpAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default_salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

function checkRateLimit(ip: string, username?: string): { 
  allowed: boolean; 
  message?: string;
  isUserLocked?: boolean;
} {
  const hashedIp = hashIpAddress(ip);
  const attempts = loginAttempts.get(hashedIp) || { 
    count: 0, 
    lastAttempt: 0,
    usernamesAttempted: new Set()
  };
  
  const now = Date.now();
  
  if (attempts.lockExpires && attempts.lockExpires < now) {
    attempts.count = 0;
    attempts.usernamesAttempted.clear();
    delete attempts.lockExpires;
  }
  
  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingMinutes = Math.ceil((attempts.lockExpires! - now) / 60000);
    return { 
      allowed: false, 
      message: `登录尝试次数过多，请在${remainingMinutes}分钟后重试`,
      isUserLocked: false
    };
  }
  
  if (username) {
    const isUserAttemptedRecently = attempts.usernamesAttempted.has(username);
    
    if (isUserAttemptedRecently && attempts.count >= MAX_USER_ATTEMPTS) {
      return { 
        allowed: false, 
        message: `该账号尝试次数过多，请在${Math.ceil(USER_LOCK_TIME / 60000)}分钟后重试`,
        isUserLocked: true
      };
    }
  }
  
  return { allowed: true };
}

function incrementAttempts(ip: string, username: string) {
  const hashedIp = hashIpAddress(ip);
  const attempts = loginAttempts.get(hashedIp) || { 
    count: 0, 
    lastAttempt: 0,
    usernamesAttempted: new Set()
  };
  
  const now = Date.now();
  
  attempts.count++;
  attempts.lastAttempt = now;
  attempts.usernamesAttempted.add(username);
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockExpires = now + LOCK_TIME;
  }
  
  loginAttempts.set(hashedIp, attempts);
  
  cleanupExpiredAttempts();
}

function cleanupExpiredAttempts() {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [ipHash, info] of loginAttempts.entries()) {
    if (now - info.lastAttempt > 24 * 60 * 60 * 1000) {
      loginAttempts.delete(ipHash);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0 && loginAttempts.size % 10 === 0) {
    console.log(`清理了${deletedCount}条过期的登录尝试记录，当前剩余${loginAttempts.size}条`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    await Logger.info(LogType.AUTH, '登录请求到达', {
      ip: clientIp,
      contentType: request.headers.get('content-type') || 'unknown',
      hasCsrfHeader: !!request.headers.get('x-csrf-token'),
    });
    
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      await Logger.warn(LogType.AUTH, '请求体解析失败', { ip: clientIp });
      return createApiResponse(null, { status: 400, message: '无效的JSON格式' });
    }
    
    const username = (typeof body.username === 'string' ? body.username : '').replace(/[<>'"&]/g, '').trim();
    
    const rateLimitCheck = checkRateLimit(clientIp, username);
    if (!rateLimitCheck.allowed) {
      console.warn(`[安全警告] 账户锁定 - IP: ${clientIp}, 用户名: ${username}, 类型: ${rateLimitCheck.isUserLocked ? '用户锁定' : 'IP锁定'}`);
      await Logger.warn(LogType.AUTH, '登录被限流/锁定', { ip: clientIp, username, isUserLocked: rateLimitCheck.isUserLocked });
      return createApiResponse(null, { status: 429, message: rateLimitCheck.message || '访问受限' });
    }
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      incrementAttempts(clientIp, username);
      await Logger.warn(LogType.AUTH, '请求参数验证失败', { ip: clientIp, username, issues: validation.error.issues?.map(i => ({ path: i.path, message: i.message })) });
      return createApiResponse(null, {
        status: 400,
        message: validation.error.message || '请求参数验证失败',
      });
    }
    
    const data = sanitizeInput(validation.data);
    
    const captchaMatch = data.captcha.toLowerCase() === data.generatedCaptcha.toLowerCase();
    await Logger.debug(LogType.AUTH, '验证码比较', { ip: clientIp, username: data.username, match: captchaMatch });
    if (!captchaMatch) {
      incrementAttempts(clientIp, data.username);
      return createApiResponse(null, { status: 400, message: '验证码错误' });
    }
    
    const csrfValid = await validateRequestCsrfToken(request);
    if (!csrfValid) {
      incrementAttempts(clientIp, data.username);
      await Logger.warn(LogType.AUTH, 'CSRF令牌验证失败', { ip: clientIp, username: data.username });
      return createApiResponse(null, { status: 403, message: 'CSRF令牌验证失败' });
    }
    
    const user = mockUsers.find(u => u.username === data.username);
    
    if (!user || !user.isActive) {
      incrementAttempts(clientIp, data.username);
      await Logger.warn(LogType.AUTH, '用户不存在或已禁用', { ip: clientIp, username: data.username });
      return createApiResponse(null, { status: 401, message: '用户名或密码错误' });
    }
    
    const passwordStrength = checkPasswordStrength(data.password);
    if (passwordStrength.score < 3) {
      console.warn(`[安全警告] 弱密码尝试 - IP: ${clientIp}, 用户名: ${data.username}, 强度: ${passwordStrength.score}`);
    }
    
    if (isCommonPassword(data.password)) {
      console.warn(`[安全警告] 常见密码尝试 - IP: ${clientIp}, 用户名: ${data.username}`);
    }
    
    const passwordMatch = await verifyPassword(data.password, user.password);
    
    if (!passwordMatch) {
      incrementAttempts(clientIp, data.username);
      await Logger.warn(LogType.AUTH, '密码不匹配', { ip: clientIp, username: data.username });
      return createApiResponse(null, { status: 401, message: '用户名或密码错误' });
    }
    
    const token = generateToken(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      '24h'
    );
    
    const response = createApiResponse({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        permissions: user.permissions,
      },
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }, { status: 200, message: '登录成功' });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    loginAttempts.delete(clientIp);
    
    console.info(`[登录成功] 用户: ${data.username}, IP: ${clientIp}`);
    await Logger.info(LogType.AUTH, '登录成功', { ip: clientIp, username: data.username });
    
    return response;
    
  } catch (error) {
    console.error('登录处理错误:', error);
    await Logger.error(LogType.AUTH, '登录处理错误', { error: (error as Error)?.message });
    
    if (error instanceof Error) {
      return createApiResponse({ errorCode: 'AUTH_ERROR' } as any, { status: 500, message: '登录过程中发生错误' });
    }
    
    return createApiResponse(null, { status: 500, message: '登录过程中发生错误' });
  }
}
