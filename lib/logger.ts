import { LogLevel, LogType } from '../models/log';
import fs from 'fs';
import path from 'path';

// 日志目录
const LOG_DIR = path.join(process.cwd(), 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 格式化时间戳
const formatTimestamp = (): string => {
  return new Date().toISOString();
};

// 生成日志文件名
const generateLogFilename = (level: LogLevel): string => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `${date}_${level}.log`);
};

// 写入文件日志
const writeToFile = (level: LogLevel, message: string, data?: unknown) => {
  try {
    const filename = generateLogFilename(level);
    const logEntry = `${formatTimestamp()} [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(filename, logEntry);
  } catch (error) {
    console.error('写入日志文件失败:', error);
  }
};

// 写入数据库日志（当前未实现，仅保留接口）
const writeToDatabase = async (level: LogLevel, type: LogType, message: string, data?: unknown) => {
  try {
    // 数据库日志功能暂未实现
    // 实际项目中可以根据数据库结构实现此功能
    console.log(`数据库日志记录 (${level}): ${message}`, data);
  } catch (dbError) {
    console.error('写入数据库日志失败:', dbError);
    // 失败时写入文件作为备选
    writeToFile(level, `${message} (DB write failed)`, {
      error: typeof dbError === 'object' && dbError !== null && 'message' in dbError 
        ? (dbError as Error).message 
        : String(dbError),
      originalData: data 
    });
  }
};

// 日志记录器类
class LoggerService {
  // 调试日志
  async debug(type: LogType, message: string, data?: unknown) {
    writeToFile(LogLevel.DEBUG, message, data);
    await writeToDatabase(LogLevel.DEBUG, type, message, data);
  }

  // 信息日志
  async info(type: LogType, message: string, data?: unknown) {
    writeToFile(LogLevel.INFO, message, data);
    await writeToDatabase(LogLevel.INFO, type, message, data);
  }

  // 警告日志
  async warn(type: LogType, message: string, data?: unknown) {
    writeToFile(LogLevel.WARN, message, data);
    await writeToDatabase(LogLevel.WARN, type, message, data);
  }

  // 错误日志
  async error(type: LogType, message: string, data?: unknown) {
    writeToFile(LogLevel.ERROR, message, data);
    await writeToDatabase(LogLevel.ERROR, type, message, data);
  }
}

// 导出日志记录器实例
export const Logger = new LoggerService();