import { NextRequest } from 'next/server';
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';
import { hashPassword } from '@/lib/password';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// 注册请求验证模式
const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少需要3个字符')
    .max(50, '用户名不能超过50个字符'),
  password: z.string()
    .min(8, '密码至少需要8个字符')
    .max(100, '密码不能超过100个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含至少一个特殊字符'),
  email: z.string().email('无效的邮箱地址'),
  name: z.string().min(2, '姓名至少需要2个字符').max(100, '姓名不能超过100个字符'),

});

// 注册处理函数
const registerHandler = async (_req: NextRequest, data: z.infer<typeof registerSchema>) => {
  try {
    const { username, password, email, name } = data;

    // 检查用户名是否已存在
    const existingUserResults = await db.select().from(users).where(eq(users.username, username));
    const existingUser = existingUserResults[0];
    if (existingUser) {
      return createApiResponse(null, {
        status: 409,
        message: '用户名已存在',
      });
    }

    // 检查邮箱是否已存在
    const existingEmailResults = await db.select().from(users).where(eq(users.email, email));
    const existingEmail = existingEmailResults[0];
    if (existingEmail) {
      return createApiResponse(null, {
        status: 409,
        message: '邮箱已被使用',
      });
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const [newUser] = await db.insert(users).values({
      username,
      password: hashedPassword,
      email,
      name,
      role: 'user', // 默认角色
      isActive: 1,
    }).returning();

    // 返回成功响应（不包含密码）
    return createApiResponse({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, {
      status: 201,
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册错误:', error);
    throw error;
  }
};

export const POST = withApiHandler(registerHandler, {
  schema: registerSchema,
  method: 'POST',
  validateCsrf: false,
});
