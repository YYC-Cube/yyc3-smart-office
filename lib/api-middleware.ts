import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCsrfToken } from '@/lib/csrf';

export interface ApiHandlerOptions<T extends z.ZodTypeAny> {
  schema?: T;
  requireAuth?: boolean;
  validateCsrf?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
}

// 统一的API响应接口
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

// 简化ApiHandler类型定义
export type ApiHandler<T extends z.ZodTypeAny, R = null> = (
  req: NextRequest,
  data: z.infer<T>,
) => Promise<NextResponse<ApiResponse<R>>>;

// 统一的API错误处理类
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// 统一的API响应格式化函数
export function createApiResponse<T = null>(
  data: T,
  options?: { status?: number; message?: string },
) {
  const { 
    status = 200, 
    message = status < 300 ? '操作成功' : '操作失败',
  } = options || {};

  return NextResponse.json(
    {
      success: status < 400,
      message,
      data,
    } as ApiResponse<T>,
    { status },
  );
}

// 统一的API处理函数包装器
export function withApiHandler<T extends z.ZodTypeAny, R = null>(
  handler: ApiHandler<T, R>,
  options?: ApiHandlerOptions<T>,
) {
  return async (req: NextRequest) => {
    try {
      // 检查HTTP方法
      if (options?.method && req.method !== options.method) {
        return createApiResponse(null, {
          status: 405,
          message: `不支持的方法: ${req.method}`,
        });
      }

      // 处理OPTIONS请求（预检请求）
      if (req.method === 'OPTIONS') {
        return NextResponse.json({}, { status: 200 });
      }

      let data: unknown = null;

      // 解析请求体（非GET请求）
      if (req.method !== 'GET') {
        try {
          data = await req.json();
        } catch {
          return createApiResponse(null, {
            status: 400,
            message: '请求体格式无效',
          });
        }

        // 验证CSRF令牌（如果需要）
        if (options?.validateCsrf && data && typeof data === 'object' && 'csrfToken' in data && !validateCsrfToken(String(data.csrfToken))) {
          return createApiResponse(null, {
            status: 403,
            message: '无效的CSRF令牌',
          });
        }
      } else {
        // 对于GET请求，从查询参数中获取数据
        const searchParams = new URL(req.url).searchParams;
        data = Object.fromEntries(searchParams.entries());
      }

      // 验证请求数据（如果提供了schema）
      if (options?.schema) {
        try {
          const parsedData = options.schema.parse(data);
          return await handler(req, parsedData as z.infer<T>);
        } catch (error) {
          if (error instanceof z.ZodError) {
            // 检查error对象是否有issues属性（新版zod）或errors属性（旧版zod）
            // 直接返回验证失败响应
            
            // 直接返回验证失败响应，不再计算未使用的validationErrors
            return createApiResponse(null, {
              status: 400,
              message: '请求参数验证失败',
            });
          }
          throw error;
        }
      }

      // 调用实际的处理函数
      return await handler(req, data as z.infer<T>);
    } catch (error) {
      console.error('API处理错误:', error);

      if (error instanceof ApiError) {
        // 包含可选的错误详情
        const responseOptions: { status: number; message: string } = {
          status: error.status,
          message: error.message,
        };
        return createApiResponse(null, responseOptions);
      }

      // 未知错误
      return createApiResponse(null, {
        status: 500,
        message: '服务器内部错误，请稍后重试',
      });
    }
  };
}