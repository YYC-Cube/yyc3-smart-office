import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';

// 创建数据库连接池
let client: postgres.Sql | null = null;

// 初始化数据库连接
export function initDb() {
  if (!client) {
    // 从环境变量获取数据库连接信息
    const connectionString =
      process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/yyc_smart_office';

    client = postgres(connectionString, {
      max: 10, // 连接池最大连接数
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: true,
            }
          : false,
      onnotice: () => {}, // 忽略通知日志
    });
  }
  return client;
}

// 获取数据库实例
export const db = drizzle(initDb(), { schema }) as ReturnType<typeof drizzle<typeof schema>>;

// 数据库连接状态记录
let lastConnectionState = true;
let connectionStateChangeTime: number | null = null;

// 检查数据库连接
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const startTime = performance.now();
    const client = initDb();

    // 使用更详细的查询来验证连接
    await client`SELECT 1 AS connection_test, CURRENT_TIMESTAMP AS current_time`;

    const endTime = performance.now();
    const latency = endTime - startTime;

    // 连接状态变化检测
    if (!lastConnectionState) {
      connectionStateChangeTime = Date.now();
      console.log(`[数据库连接恢复] 连接延迟: ${latency.toFixed(2)}ms`);
    } else if (latency > 500) {
      // 警告高延迟连接
      console.warn(`[数据库连接高延迟] ${latency.toFixed(2)}ms`);
    }

    lastConnectionState = true;
    return true;
  } catch (error) {
    // 记录详细错误信息
    if (error instanceof Error) {
      console.error(`[数据库连接失败] 错误: ${error.name}, 消息: ${error.message}`);
      if (error.cause) {
        console.error(`[数据库连接失败] 原因:`, error.cause);
      }
    } else {
      console.error(`[数据库连接失败] 未知错误类型:`, error);
    }

    // 连接状态变化检测
    if (lastConnectionState) {
      connectionStateChangeTime = Date.now();
    }

    lastConnectionState = false;
    return false;
  }
}

// 获取数据库连接状态信息
export function getDatabaseConnectionInfo() {
  const now = Date.now();
  const timeSinceChange = connectionStateChangeTime ? now - connectionStateChangeTime : null;

  return {
    isConnected: lastConnectionState,
    lastStateChange: connectionStateChangeTime
      ? new Date(connectionStateChangeTime).toISOString()
      : null,
    timeInCurrentState: timeSinceChange ? Math.floor(timeSinceChange / 1000) : null, // 秒
    timeInCurrentStateFormatted: timeSinceChange ? formatDuration(timeSinceChange) : null,
  };
}

// 格式化持续时间
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

// 事务处理助手
export async function withTransaction<T>(
  callback: (
    tx: Parameters<typeof db.transaction>[0] extends (t: infer TxType) => Promise<unknown>
      ? TxType
      : never,
  ) => Promise<T>,
): Promise<T> {
  try {
    // 使用drizzle提供的事务方法
    return await db.transaction(async (tx) => {
      // 自动推断正确的事务类型
      return await callback(tx);
    });
  } catch (error) {
    console.error('事务处理失败:', error);
    throw error;
  }
}

// 防止N+1查询的关联查询助手

export type IncludeOptions = {
  [key: string]: boolean | IncludeOptions;
};

// 定义where条件的类型
import { SQL } from 'drizzle-orm';

type WhereClause = SQL<unknown> | undefined;

// 用户与权限的关联查询
export async function findUsersWithPermissions(
  where?: WhereClause,
  limit: number = 10,
  offset: number = 0,
) {
  // 使用Drizzle的关联查询功能
  const query = db.select().from(schema.users).limit(limit).offset(offset);

  // 只在where条件存在时添加
  if (where) {
    query.where(where);
  }

  const users = await query;

  // 获取用户ID数组
  const userIds = users.map((user) => user.id);

  // 一次查询所有用户的权限
  const userPermissions = await db
    .select()
    .from(schema.userPermissions)
    .where(sql`${schema.userPermissions.userId} IN (${sql.join(userIds)})`);

  // 获取权限ID数组
  const permissionIds = [...new Set(userPermissions.map((up) => up.permissionId))];

  // 一次查询所有权限详情
  const permissions = await db
    .select()
    .from(schema.permissions)
    .where(sql`${schema.permissions.id} IN (${sql.join(permissionIds)})`);

  // 构建权限ID到权限详情的映射
  const permissionMap = new Map(permissions.map((p) => [p.id, p]));

  // 将权限信息附加到用户对象
  return users.map((user) => {
    const userPerms = userPermissions
      .filter((up) => up.userId === user.id)
      .map((up) => permissionMap.get(up.permissionId))
      .filter(Boolean);

    return {
      ...user,
      permissions: userPerms,
    };
  });
}

// 关闭数据库连接
export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
  }
}

// 在应用程序关闭时关闭数据库连接
process.on('SIGTERM', async () => {
  await closeDb();
});
