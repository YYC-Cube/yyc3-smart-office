import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getRoleById, hasPermission } from '@/models/permission';

// 权限检查中间件
export function permissionMiddleware(permissionCode: string) {
  return async (req: NextRequest) => {
    try {
      // 获取认证令牌
      const token = req.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json({ success: false, message: '未认证' }, { status: 401 });
      }

      // 验证令牌
      const payload = await verifyToken(token);

      // 获取用户角色
      const role = getRoleById(payload.role);

      if (!role) {
        return NextResponse.json({ success: false, message: '无效的角色' }, { status: 403 });
      }

      // 检查权限
      if (!hasPermission(role, permissionCode)) {
        return NextResponse.json({ success: false, message: '权限不足' }, { status: 403 });
      }

      // 权限验证通过
      return NextResponse.next();
    } catch (error) {
      console.error('权限检查错误:', error);
      return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
    }
  };
}
