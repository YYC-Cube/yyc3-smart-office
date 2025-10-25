import { NextRequest } from 'next/server';
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';
import { hashPassword } from '@/lib/password';
import { db } from '@/lib/db';
import { passwordResets, users } from '@/lib/schema';
import { eq, gt, and } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// 密码重置验证模式
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(100, '密码不能超过100个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含至少一个特殊字符'),
  csrfToken: z.string(),
});

// 密码重置处理函数
const resetPasswordHandler = async (_req: NextRequest, data: z.infer<typeof resetPasswordSchema>) => {
  try {
    const { token, newPassword } = data;

    // 验证重置令牌
    const passwordResetResults = await db.select().from(passwordResets).where(
      and(eq(passwordResets.token, token), gt(passwordResets.expiresAt, new Date()))
    );
    const passwordReset = passwordResetResults[0];

    if (!passwordReset) {
      return createApiResponse(null, {
        status: 400,
        message: '无效或已过期的重置令牌',
      });
    }

    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新用户密码
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, passwordReset.userId));

    // 删除已使用的重置令牌
    await db.delete(passwordResets).where(eq(passwordResets.id, passwordReset.id));

    return createApiResponse(null, {
      status: 200,
      message: '密码已成功重置',
    });
  } catch (error) {
    console.error('密码重置错误:', error);
    throw error;
  }
};

export const POST = withApiHandler(resetPasswordHandler, {
  schema: resetPasswordSchema,
  method: 'POST',
  validateCsrf: true,
});
