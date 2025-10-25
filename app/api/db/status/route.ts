// NextRequest removed as it's not used
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';
import { checkDatabaseConnection, getDatabaseConnectionInfo } from '@/lib/db';

// 数据库连接信息接口 - 根据实际返回数据结构定义
interface DatabaseConnectionInfo {
  isConnected: boolean;
  lastStateChange: string | null;
  timeInCurrentState: number | null;
  timeInCurrentStateFormatted: string | null;
  // 可能还有其他属性
}

// 数据库状态响应接口
interface DbStatusResponse {
  connected: boolean;
  timestamp: string;
  latency: string;
  connectionDetails: DatabaseConnectionInfo;
}

// 错误响应接口
interface ErrorResponse {
  error: string;
}

// 使用console.log作为临时日志记录器
const logger = {
  info: (msg: string) => console.log(`[INFO] db-status: ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] db-status: ${msg}`),
  error: (msg: string, error?: unknown) => console.error(`[ERROR] db-status: ${msg}`, error)
};

// 数据库状态检查处理函数
const dbStatusHandler: import('@/lib/api-middleware').ApiHandler<import('zod').ZodUndefined, DbStatusResponse | ErrorResponse> = async () => {
  try {
    const checkStartTime = performance.now();
    const isConnected = await checkDatabaseConnection();
    const checkEndTime = performance.now();
    const checkLatency = checkEndTime - checkStartTime;
    
    // 获取详细的连接状态信息
    const connectionInfo = getDatabaseConnectionInfo();
    
    // 记录状态检查结果
    if (isConnected) {
      logger.info(`数据库状态检查成功，延迟: ${checkLatency.toFixed(2)}ms`);
    } else {
      logger.warn(`数据库状态检查失败，处于断开状态已${connectionInfo.timeInCurrentStateFormatted}`);
    }

    return createApiResponse<DbStatusResponse>({
      connected: isConnected,
      timestamp: new Date().toISOString(),
      latency: checkLatency.toFixed(2),
      connectionDetails: connectionInfo
    }, {
      status: isConnected ? 200 : 503,
      message: isConnected ? '数据库连接正常' : '数据库连接失败',
    });
  } catch (error) {
    logger.error('数据库状态检查过程中出现异常:', error);
    return createApiResponse<ErrorResponse>(
      { error: '数据库检查失败' },
      { status: 500, message: '内部服务器错误' }
    );
  }
};

export const GET = withApiHandler(dbStatusHandler, {
  method: 'GET',
  validateCsrf: false, // GET请求不需要CSRF验证
});
