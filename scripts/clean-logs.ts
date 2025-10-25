import fs from 'fs';
import path from 'path';
import { Logger } from '../lib/logger';
import { LogType } from '../models/log';

// 日志目录
const LOG_DIR = path.join(process.cwd(), 'logs');

// 日志保留配置（天数）
const LOG_RETENTION = {
  debug: 7, // 调试日志保留7天
  info: 30, // 信息日志保留30天
  warn: 90, // 警告日志保留90天
  error: 365, // 错误日志保留365天
};

// 类型定义
interface LogRetentionType {
  [key: string]: number;
}

// 类型断言
const logRetention = LOG_RETENTION as LogRetentionType;

async function cleanLogs() {
  console.log('开始清理日志...');

  try {
    // 确保日志目录存在
    if (!fs.existsSync(LOG_DIR)) {
      console.log('日志目录不存在，无需清理');
      return;
    }

    // 获取所有日志文件
    const files = fs.readdirSync(LOG_DIR);

    // 按日志级别分组
    const debugFiles = files.filter((file) => file.endsWith('_debug.log'));
    const infoFiles = files.filter((file) => file.endsWith('_info.log'));
    const warnFiles = files.filter((file) => file.endsWith('_warn.log'));
    const errorFiles = files.filter((file) => file.endsWith('_error.log'));

    // 清理调试日志
    const debugCount = cleanLogsByLevel(debugFiles, 'debug');
    console.log(`已清理 ${debugCount} 个调试日志文件`);

    // 清理信息日志
    const infoCount = cleanLogsByLevel(infoFiles, 'info');
    console.log(`已清理 ${infoCount} 个信息日志文件`);

    // 清理警告日志
    const warnCount = cleanLogsByLevel(warnFiles, 'warn');
    console.log(`已清理 ${warnCount} 个警告日志文件`);

    // 清理错误日志
    const errorCount = cleanLogsByLevel(errorFiles, 'error');
    console.log(`已清理 ${errorCount} 个错误日志文件`);

    // 记录清理操作
    await Logger.info(
      LogType.SYSTEM,
      `日志清理完成: 调试(${debugCount}), 信息(${infoCount}), 警告(${warnCount}), 错误(${errorCount})`,
    );

    console.log('日志清理完成');
  } catch (error) {
    console.error('日志清理失败:', error);

    // 记录清理错误
    await Logger.error(LogType.SYSTEM, '日志清理失败', error);
  }
}

// 按日志级别清理日志
function cleanLogsByLevel(files: string[], level: string): number {
  const now = new Date();
  const retentionDays = logRetention[level];
  const retentionDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  let count = 0;

  for (const file of files) {
    try {
      // 从文件名中提取日期 (格式: YYYY-MM-DD_level.log)
      const dateStr = file.split('_')[0];
      const fileDate = new Date(dateStr);

      // 如果文件日期早于保留日期，则删除
      if (fileDate < retentionDate) {
        fs.unlinkSync(path.join(LOG_DIR, file));
        count++;
      }
    } catch (error) {
      console.error(`清理日志文件 ${file} 失败:`, error);
    }
  }

  return count;
}

// 执行清理
cleanLogs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
