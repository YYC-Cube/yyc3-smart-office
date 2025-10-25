// 环境变量配置
export const env = {
  // 基本环境配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 认证相关配置
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-for-development-only',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  CSRF_SECRET: process.env.CSRF_SECRET || 'csrf-secret-key',
  
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite://./db.sqlite',
  
  // 服务器配置
  PORT: process.env.PORT || '3000',
  
  // 安全配置
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // 日志配置
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
};

// 环境变量验证
export function validateEnv() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missingVars.length > 0) {
    console.error(`错误: 以下必要环境变量缺失: ${missingVars.join(', ')}`);
    if (env.NODE_ENV === 'production') {
      throw new Error('生产环境中必须配置所有必要的环境变量');
    }
  }
  
  // 检查JWT密钥是否使用默认值
  if (env.JWT_SECRET === 'fallback-secret-key-for-development-only') {
    console.warn('警告: 使用默认JWT密钥，生产环境中应配置自定义密钥');
  }
  
  console.log('环境变量验证完成');
}
