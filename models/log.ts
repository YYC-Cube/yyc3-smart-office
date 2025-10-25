// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 日志类型
export enum LogType {
  AUTH = 'auth',
  USER = 'user',
  CUSTOMER = 'customer',
  TASK = 'task',
  SYSTEM = 'system',
}

// 日志接口
export interface Log {
  id: string;
  timestamp: Date;
  level: LogLevel;
  type: LogType;
  message: string;
  userId?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: Error;
  metadata?: Record<string, unknown>;
}
