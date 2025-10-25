import { z } from 'zod';

// 登录表单验证
export const loginSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符').max(100, '密码不能超过100个字符'),
  captcha: z.string().min(4, '验证码必须是4个字符').max(4, '验证码必须是4个字符'),
  // 仅用于客户端校验时可选，服务端会单独校验
  generatedCaptcha: z.string().optional(),
  csrfToken: z.string().optional(),
});

// 用户注册表单验证
export const registerSchema = z
  .object({
    username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
    password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(100, '密码不能超过100个字符')
      .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
      .regex(/[a-z]/, '密码必须包含至少一个小写字母')
      .regex(/[0-9]/, '密码必须包含至少一个数字')
      .regex(/[^A-Za-z0-9]/, '密码必须包含至少一个特殊字符'),
    confirmPassword: z.string(),
    email: z.string().email('请输入有效的电子邮件地址'),
    name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
    csrfToken: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword'],
  });

// 客户表单验证
export const customerSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  memberNo: z.string().min(1, '会员编号不能为空'),
  date: z.string().optional(),
  notes: z.string().optional(),
  lastContact: z.string().optional(),
  nextContact: z.string().optional(),
  csrfToken: z.string(),
});

// 任务表单验证
export const taskSchema = z.object({
  content: z.string().min(1, '任务内容不能为空').max(200, '任务内容不能超过200个字符'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, '时间格式必须为HH:MM'),
  assignedTo: z.string().min(1, '必须指定负责人'),
  csrfToken: z.string(),
});

// 添加缺少的userQuerySchema
export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// 添加缺少的formatValidationErrors函数
export function formatValidationErrors(errors: z.ZodError) {
  const formattedErrors: Record<string, string> = {};

  if ('issues' in errors) {
    (errors.issues as Array<{ path: (string | number)[]; message: string }>).forEach((error) => {
      if (error.path) {
        formattedErrors[error.path.join('.')] = error.message;
      }
    });
  }

  return formattedErrors;
}

// 验证函数
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<{ success: boolean; data?: T; errors?: z.ZodError }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
