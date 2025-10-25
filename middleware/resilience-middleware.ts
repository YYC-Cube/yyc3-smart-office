import { NextRequest, NextResponse } from 'next/server';
import { resilienceService } from '../lib/resilience-service';

// API路由故障自修复中间件配置接口
interface ResilienceMiddlewareConfig {
  // 断路器配置
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
    halfOpenMaxCalls?: number;
    errorThresholdPercentage?: number;
  };
  
  // 重试配置
  retry?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  };
  
  // 缓存配置
  cache?: {
    enabled?: boolean;
    ttl?: number;
    keyGenerator?: (req: NextRequest) => string;
  };
  
  // 降级配置
  fallback?: {
    enabled?: boolean;
    response?: (error: Error) => NextResponse;
  };
  
  // 超时配置
  timeout?: {
    enabled?: boolean;
    ms?: number;
  };
}

// 默认配置
const DEFAULT_CONFIG: ResilienceMiddlewareConfig = {
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenMaxCalls: 3,
    errorThresholdPercentage: 50
  },
  retry: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2
  },
  cache: {
    enabled: false,
    ttl: 60000, // 1分钟
    keyGenerator: (req) => `${req.method}:${req.url}`
  },
  fallback: {
    enabled: false,
    response: (error) => NextResponse.json(
      { error: '服务暂时不可用，请稍后重试', details: error.message },
      { status: 503 }
    )
  },
  timeout: {
    enabled: true,
    ms: 10000 // 10秒
  }
};

// 创建超时Promise
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时: ${ms}ms`)), ms);
  });
}

// 缓存响应数据接口
export interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
  expiry: number;
}

// 系统健康状态接口
export interface SystemHealthStatus {
  uptime: number;
  circuitBreakers: Record<string, unknown>;
  cacheStats: {
    size: number;
    lastPruned: number;
  };
  metrics?: Record<string, unknown>;
}

// 全局启动时间
const globalStartTime = Date.now();

// 内存响应缓存
class ResponseCache {
  private static instance: ResponseCache;
  private cache: Map<string, CachedResponse> = new Map();
  private lastPruneTime: number = Date.now();
  
  private constructor() {
    // 每分钟清理过期缓存
    setInterval(() => this.prune(), 60000);
  }
  
  static getInstance(): ResponseCache {
    if (!ResponseCache.instance) {
      ResponseCache.instance = new ResponseCache();
    }
    return ResponseCache.instance;
  }
  
  get(key: string): CachedResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }
  
  set(key: string, response: CachedResponse): void {
    this.cache.set(key, response);
  }
  
  prune(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
    this.lastPruneTime = now;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      lastPruned: this.lastPruneTime
    };
  }
}

const responseCache = ResponseCache.getInstance();

// 故障自修复中间件工厂函数
export function createResilienceMiddleware(
  config: Partial<ResilienceMiddlewareConfig> = {}
) {
  // 合并配置
  const mergedConfig: ResilienceMiddlewareConfig = {
    circuitBreaker: { ...DEFAULT_CONFIG.circuitBreaker, ...config.circuitBreaker },
    retry: { ...DEFAULT_CONFIG.retry, ...config.retry },
    cache: { ...DEFAULT_CONFIG.cache, ...config.cache },
    fallback: { ...DEFAULT_CONFIG.fallback, ...config.fallback },
    timeout: { ...DEFAULT_CONFIG.timeout, ...config.timeout }
  };
  
  // 创建中间件函数
  return async function resilienceMiddleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    // 为当前API路径创建断路器名称
    const apiPath = new URL(req.url).pathname;
    const circuitName = `api:${apiPath}`;
    
    // 检查缓存
    if (mergedConfig.cache?.enabled) {
      const cacheKey = mergedConfig.cache.keyGenerator!(req);
      const cached = responseCache.get(cacheKey);
      if (cached) {
        // 记录缓存命中
        console.log(`[缓存命中] ${cacheKey}`);
        
        // 重建响应
        const res = NextResponse.json(cached.body, { status: cached.status });
        
        // 设置缓存头
        res.headers.set('X-Resilience-Cache', 'HIT');
        res.headers.set('X-Resilience-Cache-Time', String(Date.now() - cached.timestamp));
        
        // 复制缓存的头部
        Object.entries(cached.headers).forEach(([key, value]) => {
          if (!res.headers.has(key)) {
            res.headers.set(key, value);
          }
        });
        
        return res;
      }
    }
    
    try {
      // 执行受保护的请求处理
      const response = await resilienceService.executeProtected(
        circuitName,
        async () => {
          // 如果启用了超时保护
          if (mergedConfig.timeout?.enabled) {
            return Promise.race([
              next(),
              createTimeout(mergedConfig.timeout.ms!)
            ]);
          }
          
          // 否则直接执行
          return await next();
        },
        {
          // 配置断路器
          circuitConfig: mergedConfig.circuitBreaker,
          
          // 配置重试
          retryConfig: mergedConfig.retry,
          
          // 配置降级
          fallback: mergedConfig.fallback?.enabled ? {
            shouldFallback: () => true,
            getFallbackValue: async () => mergedConfig.fallback!.response!(new Error('服务降级'))
          } : undefined
        }
      );
      
      // 缓存成功响应
      if (mergedConfig.cache?.enabled && response.status < 400) {
        try {
          // 读取响应体
          const body = await response.clone().json();
          
          // 创建缓存条目
          const cacheKey = mergedConfig.cache.keyGenerator!(req);
          const expiry = Date.now() + (mergedConfig.cache.ttl || 60000);
          
          // 收集响应头
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          
          // 缓存响应
          responseCache.set(cacheKey, {
            status: response.status,
            headers,
            body,
            timestamp: Date.now(),
            expiry
          });
          
          // 设置缓存状态头
          response.headers.set('X-Resilience-Cache', 'MISS');
          
        } catch {
          // 无法解析JSON的响应不缓存
          console.debug('无法缓存非JSON响应');
        }
      }
      
      // 设置断路器状态头
      const circuitBreaker = resilienceService.getCircuitBreaker(circuitName);
      response.headers.set('X-Resilience-Circuit-State', circuitBreaker.getState());
      
      return response;
      
    } catch (error) {
      // 处理所有异常情况
      const err = error as Error;
      
      // 记录错误
      console.error(`[API错误] ${apiPath}: ${err.message}`, err);
      
      // 如果启用了降级策略
      if (mergedConfig.fallback?.enabled) {
        return mergedConfig.fallback.response!(err);
      }
      
      // 默认错误响应
      return NextResponse.json(
        {
          error: '内部服务器错误',
          message: err.message,
          path: apiPath,
          timestamp: Date.now()
        },
        { 
          status: err.message.includes('超时') ? 408 : 500,
          headers: {
            'X-Resilience-Error': err.name,
            'X-Resilience-Circuit-State': resilienceService.getCircuitBreaker(circuitName).getState()
          }
        }
      );
    }
  };
}

// 创建默认的故障自修复中间件
export const defaultResilienceMiddleware = createResilienceMiddleware();

// 针对不同API场景的预设配置
export const resiliencePresets = {
  // 高频读取接口的预设
  highFrequencyRead: createResilienceMiddleware({
    cache: {
      enabled: true,
      ttl: 30000, // 30秒缓存
      keyGenerator: (req) => `read:${req.method}:${req.url}:${req.headers.get('if-none-match') || ''}`
    },
    circuitBreaker: {
      failureThreshold: 10,
      resetTimeout: 15000
    }
  }),
  
  // 数据写入接口的预设
  dataWrite: createResilienceMiddleware({
    cache: {
      enabled: false // 写入操作不缓存
    },
    retry: {
      maxRetries: 3,
      initialDelay: 1000
    },
    fallback: {
      enabled: true,
      response: () => NextResponse.json(
        { error: '数据写入暂时失败，系统将稍后重试', code: 'WRITE_PENDING' },
        { status: 503 }
      )
    }
  }),
  
  // 第三方API调用的预设
  thirdPartyApi: createResilienceMiddleware({
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 20000,
      errorThresholdPercentage: 30
    },
    retry: {
      maxRetries: 3,
      initialDelay: 2000,
      backoffMultiplier: 2
    },
    timeout: {
      enabled: true,
      ms: 8000 // 第三方API调用8秒超时
    },
    fallback: {
      enabled: true,
      response: () => NextResponse.json(
        { error: '外部服务暂时不可用', code: 'EXTERNAL_SERVICE_UNAVAILABLE' },
        { status: 503 }
      )
    }
  }),
  
  // 关键业务接口的预设
  criticalBusiness: createResilienceMiddleware({
    circuitBreaker: {
      failureThreshold: 3,
      resetTimeout: 10000,
      errorThresholdPercentage: 20
    },
    retry: {
      maxRetries: 2,
      initialDelay: 500
    },
    timeout: {
      enabled: true,
      ms: 5000 // 关键接口5秒超时
    },
    fallback: {
      enabled: true,
      response: (error) => NextResponse.json(
        {
          error: '关键服务暂时异常',
          details: error.message,
          code: 'CRITICAL_SERVICE_ERROR',
          timestamp: Date.now()
        },
        { status: 503 }
      )
    }
  })
};

// 导出用于手动清除缓存的工具函数
export function clearResponseCache(): void {
  responseCache.clear();
}

// 导出用于获取系统健康状态的函数
export function getResilienceStatus(): SystemHealthStatus {
  const now = Date.now();
  const status = resilienceService.getSystemStatus();
  
  return {
    uptime: Math.floor((now - globalStartTime) / 1000), // 转换为秒
    circuitBreakers: status.circuitBreakers || {},
    cacheStats: {
      ...responseCache.getStats()
    },
    metrics: status.metrics
  };
}