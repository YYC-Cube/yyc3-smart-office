// 不需要NextRequest导入
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';
import { env, validateEnv } from '@/lib/env';

export const runtime = 'nodejs';

// 环境变量验证处理函数
const verifyEnvHandler = async () => {
  try {
    // 验证环境变量
    validateEnv();

    // 返回环境变量状态（不返回实际值，只返回是否设置）
    return createApiResponse(
      {
        environment: env.NODE_ENV,
        jwt_secret_set: env.JWT_SECRET !== 'fallback-secret-key-for-development-only',
      },
      { status: 200, message: '环境变量验证成功' }
    );
  } catch (error) {
    console.error('环境变量验证错误:', error);
    throw error;
  }
};

export const GET = withApiHandler(verifyEnvHandler, {
  method: 'GET',
  validateCsrf: false,
});
