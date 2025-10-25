import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
// 移除 Node-only 依赖，避免在 Edge Runtime 打包 jsonwebtoken 与 Node crypto
// import { verifyToken } from './lib/auth';
// import { validateCsrfToken } from './lib/csrf';

// 不需要认证的路径
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/status',
  '/api/auth/refresh',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/csrf-token',
  '/api/health',
];

// 敏感操作需要CSRF保护的路径
const csrfProtectedPaths = [
  '/api/auth/*',
  '/api/users/*',
  '/api/settings/*',
  '/api/admin/*',
];

// 检查路径是否为公开路径
function isPublicPath(path: string): boolean {
  // 检查精确匹配
  if (publicPaths.includes(path)) {
    return true;
  }
  
  // 检查路径前缀
  return publicPaths.some(publicPath => 
    publicPath !== '/' && path.startsWith(`${publicPath}/`) 
  );
}

// 检查路径是否需要CSRF保护
function isCsrfProtectedPath(path: string): boolean {
  return csrfProtectedPaths.some(pattern => {
    // 处理通配符路径
    if (pattern.endsWith('/*')) {
      const basePath = pattern.slice(0, -2);
      return path === basePath || path.startsWith(`${basePath}/`);
    }
    return path === pattern;
  });
}

// 获取认证令牌
function getAuthToken(request: NextRequest): string | null {
  // 从Authorization头获取令牌
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 从cookie获取令牌
  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    return token;
  }
  
  return null;
}

// 添加安全头
function addSecurityHeaders(response: NextResponse): NextResponse {
  // 根据环境动态设置CSP（开发环境允许 HMR 所需的 unsafe-eval）
  const isDev = process.env.NODE_ENV !== 'production';
  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: blob:; connect-src 'self' ws:;"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';";

  // 安全头
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

// 边缘运行时兼容：仅解析JWT载荷，不做签名校验（真正校验在 API 路由进行）
function unsafeDecodeJwt(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const jsonStr = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(jsonStr);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 明确跳过 Next 静态资源与公共静态文件，避免拦截与请求对象变更导致 404
  if (
    path.startsWith('/_next/') ||
    path === '/favicon.ico' ||
    path.startsWith('/images/') ||
    path.startsWith('/fonts/')
  ) {
    return addSecurityHeaders(NextResponse.next());
  }
  
  // 为所有响应添加安全头
  let response = NextResponse.next();
  response = addSecurityHeaders(response);
  
  // 跳过公开路径的认证检查
  if (isPublicPath(path)) {
    return response;
  }
  
  try {
    // 获取令牌
    const token = getAuthToken(request);
    
    if (!token) {
      // 未认证，重定向到登录页面
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    
    // 解析令牌载荷（Edge 兼容）。真正的签名校验放在 Node 运行时的 API 路由。
    const payload: any = unsafeDecodeJwt(token);
    
    // 检查令牌是否过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      // 令牌过期，清除cookie并重定向到登录页面
      response.cookies.delete('auth_token');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      loginUrl.searchParams.set('reason', 'expired');
      return NextResponse.redirect(loginUrl);
    }
    
    // 检查令牌是否即将过期（5分钟内）
    const refreshThreshold = now + 300; // 5分钟
    if (payload.exp < refreshThreshold) {
      // 设置标志，通知前端刷新令牌
      response.headers.set('X-Token-Refresh-Required', 'true');
    }
    
    // 验证用户是否处于活动状态（仅基于载荷）
    if (payload.isActive === false) {
      response.cookies.delete('auth_token');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('reason', 'account_disabled');
      return NextResponse.redirect(loginUrl);
    }
    
    // CSRF 基础检查（Edge 兼容）：仅检查存在与长度，真正验证在 Node API 路由执行
    if (request.method !== 'GET' && isCsrfProtectedPath(path)) {
      const csrfToken = request.headers.get('X-CSRF-Token') || request.cookies.get('XSRF-TOKEN')?.value;
      if (!csrfToken || csrfToken.length < 32) {
        if (path.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, message: '缺少或无效的CSRF令牌' },
            { status: 403 }
          );
        }
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // 不再修改请求对象，避免 Next 对静态资源的路由解析受到影响
    // 为响应设置缓存控制头，防止敏感页面被缓存
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    // 清除无效的令牌
    response.cookies.delete('auth_token');
    
    // 认证失败，重定向到登录页面
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    
    // 根据错误类型提供更具体的重定向信息
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        loginUrl.searchParams.set('reason', 'expired');
      } else if (error.message.includes('invalid')) {
        loginUrl.searchParams.set('reason', 'invalid');
      } else {
        loginUrl.searchParams.set('reason', 'error');
      }
    }
    
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/|favicon.ico|images|fonts).*)',
  ],
  // middleware 运行时固定为 Edge，但保留字段以便后续迁移说明
  runtime: 'experimental-edge',
};