import { NextRequest } from 'next/server';
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';
import { verifyToken } from '@/lib/auth';
import { getRoleById, hasPermission } from '@/models/permission';
import { z } from 'zod';

export const runtime = 'nodejs';

// 权限检查参数验证模式
const permissionCheckSchema = z.object({
  code: z.string(),
});

// 权限检查处理函数
const permissionCheckHandler = async (req: NextRequest, data: z.infer<typeof permissionCheckSchema>) => {
  try {
    const { code: permissionCode } = data;

    // 获取认证令牌
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return createApiResponse({
        hasPermission: false,
      }, {
        status: 401,
        message: '未认证',
      });
    }

    // 验证令牌
    const payload = await verifyToken(token);

    // 获取用户角色
    const role = getRoleById(payload.role.toString());

    if (!role) {
      return createApiResponse({
        hasPermission: false,
      }, {
        status: 403,
        message: '无效的角色',
      });
    }

    // 检查权限
    const permitted = hasPermission(role, permissionCode);

    return createApiResponse({
      hasPermission: permitted,
    }, {
      status: 200,
      message: '权限检查成功',
    });
  } catch (error) {
    console.error('权限检查错误:', error);
    throw error;
  }
};

export const GET = withApiHandler(permissionCheckHandler, {
  schema: permissionCheckSchema,
  method: 'GET',
  validateCsrf: false, // GET请求不需要CSRF验证
});
