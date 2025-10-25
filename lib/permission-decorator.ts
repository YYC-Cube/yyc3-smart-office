import type { NextRequest } from 'next/server';
import { permissionMiddleware } from '@/middleware/permission';

import type { NextResponse } from 'next/server';

// 权限装饰器
export function withPermission(handler: (req: NextRequest) => Promise<NextResponse>, permissionCode: string) {
  return async (req: NextRequest) => {
    // 应用权限中间件
    const permissionResponse = await permissionMiddleware(permissionCode)(req);

    // 如果权限检查失败，返回错误响应
    if (permissionResponse.status !== 200) {
      return permissionResponse;
    }

    // 权限检查通过，执行原始处理程序
    return handler(req);
  };
}
