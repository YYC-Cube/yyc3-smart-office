import * as jwt from 'jsonwebtoken';
import { env } from './env';
import { randomBytes } from 'crypto';

// 用户令牌载荷接口
export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  iat: number;
  exp: number;
}

// 生成JWT令牌
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresIn: string = '24h') {
  const jwtSecret = env.JWT_SECRET || 'fallback-secret-key-for-development-only';
  
  // 使用类型断言来解决jsonwebtoken库的类型兼容性问题
  // 这是一种安全的方式，因为我们知道字符串类型的expiresIn是库支持的
  const options = { expiresIn };
  return jwt.sign(payload, jwtSecret, options as jwt.SignOptions);
}

// 验证JWT令牌
export function verifyToken(token: string): TokenPayload {
  const jwtSecret = env.JWT_SECRET || 'fallback-secret-key-for-development-only';
  
  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      // 增强错误信息，便于前端处理
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
    throw new Error('Failed to verify token');
  }
}

// 刷新JWT令牌
export function refreshToken(oldToken: string) {
  try {
    // 忽略过期检查，强制验证令牌
    const jwtSecret = env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = jwt.verify(oldToken, jwtSecret, { ignoreExpiration: true }) as TokenPayload;
    
    // 创建新的令牌，保留原始信息但更新过期时间
    const newToken = generateToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      isActive: decoded.isActive,
    });
    
    return newToken;
  } catch (error) {
    console.error('刷新令牌失败:', error);
    throw new Error('Failed to refresh token');
  }
}

// 验证用户凭据（在实际应用中，这里应该查询数据库验证用户名和密码）
export async function validateCredentials(
  username: string, 
  // eslint-disable-next-line no-unused-vars
  _password: string
) {
  // 注意：这是一个模拟实现
  // 实际应用中，应该从数据库中查询用户并验证密码哈希
  
  // 模拟用户数据
  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      password: '$2a$10$mF7wFgJfL5e4R3T2Y1U0I.KdJhgFdSaMqWeRtYuIoPlKjHgFdSaMq', // 模拟的哈希密码
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    },
    {
      id: '2',
      username: 'user',
      password: '$2a$10$zY9X8W7V6U5T4S3R2Q1P.OnMkJlIiHhGgFfEeDdCcBbAaZzYyXx', // 模拟的哈希密码
      email: 'user@example.com',
      role: 'user',
      isActive: true,
    },
  ];
  
  // 查找用户
  const user = mockUsers.find(u => u.username === username);
  
  if (!user || !user.isActive) {
    return null;
  }
  
  // 在实际应用中，应该使用bcrypt.compare来验证密码
  // 这里为了简化，我们假设密码是正确的
  // const passwordMatch = await bcrypt.compare(password, user.password);
  
  // 由于这是模拟实现，我们假设密码验证总是成功
  const passwordMatch = true;
  
  if (!passwordMatch) {
    return null;
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

// 从请求头或cookie中获取令牌
export function getTokenFromRequest(request: { headers?: { authorization?: string }, cookies?: { auth_token?: string } }): string | null {
  // 尝试从Authorization头获取
  const authHeader = request.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 尝试从cookie中获取
  if (request.cookies && request.cookies.auth_token) {
    return request.cookies.auth_token;
  }
  
  return null;
}

// 生成安全的随机字符串（用于CSRF令牌等）
export function generateSecureToken(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}