import { z } from 'zod';

// 通用验证函数
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

// 格式化验证错误
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  if ('issues' in errors) {
    (errors.issues as Array<{ path: (string | number)[]; message: string }>).forEach((err) => {
      const path = err.path.join('.');
      formattedErrors[path] = err.message;
    });
  }

  return formattedErrors;
}

// 基本验证模式
export const basicStringSchema = z.string();
export const basicNumberSchema = z.number();
export const basicBooleanSchema = z.boolean();
