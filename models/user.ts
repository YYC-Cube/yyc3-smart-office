// 用户模型
export interface User {
  id: string;
  username: string;
  password: string; // 存储哈希后的密码
  email: string;
  role: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  avatar?: string; // 用户头像URL
  badge?: string; // 用户徽章/标签
  department?: string; // 部门信息
}

// 用于API响应的用户数据（不包含敏感信息）
export type SafeUser = Omit<User, 'password'>;

// 将用户对象转换为安全的用户对象（移除密码）
export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
