import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getRoleById, hasPermission } from '@/models/permission';
import { createApiResponse } from '@/lib/api-middleware';

// 认证中间件配置
interface AuthMiddlewareOptions {
  required?: boolean;
  permission?: string;
  adminOnly?: boolean;
  except?: string[];
}

// 从请求中提取认证令牌
export function getAuthToken(req: NextRequest): string | null {
  // 从Authorization头获取令牌
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 从cookie获取令牌
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

// 认证中间件
export async function withAuth(req: NextRequest, options: AuthMiddlewareOptions = {}) {
  const { required = true, permission, adminOnly } = options;
  
  try {
    // 从请求中获取令牌
    const token = getAuthToken(req);
    
    // 如果不需要认证，直接返回null（表示未认证但允许通过）
    if (!required && !token) {
      return null;
    }
    
    // 如果需要认证但没有令牌，返回401错误
    if (required && !token) {
      return createApiResponse(null, {
        status: 401,
        message: '未提供认证令牌',
      });
    }
    
    // 验证令牌
    const payload = await verifyToken(token!);
    
    // 检查用户是否已激活
    if (!payload.isActive) {
      return createApiResponse(null, {
        status: 403,
        message: '用户账户已被禁用',
      });
    }
    
    // 如果需要管理员权限，检查用户角色
    if (adminOnly && payload.role !== 'admin') {
      return createApiResponse(null, {
        status: 403,
        message: '需要管理员权限',
      });
    }
    
    // 如果需要特定权限，检查用户是否拥有该权限
    if (permission) {
      const role = getRoleById(payload.role);
      if (!role || !hasPermission(role, permission)) {
        return createApiResponse(null, {
          status: 403,
          message: `缺少必要的权限: ${permission}`,
        });
      }
    }
    
    // 将用户信息附加到请求头，以便在处理函数中使用
    const userInfo = JSON.stringify({
      id: payload.id,
      username: payload.username,
      role: payload.role,
      email: payload.email,
    });
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-Info', encodeURIComponent(userInfo));
    
    // 创建一个新的请求对象，包含更新后的头信息
    const newRequest = new NextRequest(req.url, {
      headers: requestHeaders,
      method: req.method,
      body: req.body
    });
    
    return { req: newRequest, user: payload };
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    // 处理令牌验证失败的情况
    if (error instanceof Error && error.message === 'Token expired') {
      return createApiResponse(null, {
        status: 401,
        message: '认证令牌已过期',
      });
    }
    
    return createApiResponse(null, {
      status: 401,
      message: '认证失败，请重新登录',
    });
  }
}

// 从请求中获取用户信息
export function getUserFromRequest(req: NextRequest) {
  try {
    const userInfoHeader = req.headers.get('X-User-Info');
    if (userInfoHeader) {
      return JSON.parse(decodeURIComponent(userInfoHeader));
    }
  } catch (error) {
    console.error('解析用户信息失败:', error);
  }
  
  return null;
}

// 用户信息类型
export interface UserInfo {
  id: string;
  username: string;
  role: string;
  email: string;
}

// 角色检查辅助函数
export function isAdmin(user: UserInfo | null): boolean {
  return !!user && user.role === 'admin';
}

// 权限检查辅助函数
export async function checkUserPermission(user: UserInfo | null, permissionCode: string): Promise<boolean> {
  if (!user || !user.role) {
    return false;
  }
  
  const role = getRoleById(user.role);
  return !!role && hasPermission(role, permissionCode);
}