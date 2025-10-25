// 故障自修复系统服务

// 断路器状态
export enum CircuitState {
  CLOSED = 'closed',      // 正常状态
  OPEN = 'open',          // 开路状态
  HALF_OPEN = 'half_open' // 半开状态，尝试恢复
}

// 断路器配置接口
interface CircuitBreakerConfig {
  failureThreshold: number;      // 故障阈值
  resetTimeout: number;          // 重置超时时间(ms)
  halfOpenMaxCalls: number;      // 半开状态最大调用次数
  errorThresholdPercentage: number; // 错误阈值百分比
}

// 默认断路器配置
const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30秒
  halfOpenMaxCalls: 3,
  errorThresholdPercentage: 50
};

// 断路器类
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private activeCalls = 0;
  private config: CircuitBreakerConfig;
  private name: string;
  private errorRates: Array<{ timestamp: number; errors: number; total: number }> = [];
  
  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
    this.logStateChange('初始化断路器');
  }
  
  // 执行受断路器保护的函数
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 检查断路器状态
    if (this.state === CircuitState.OPEN) {
      // 检查是否可以尝试重置
      if (this.canAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.logStateChange('从开路转到半开状态');
      } else {
        const error = new Error(`断路器[${this.name}]处于开路状态`);
        throw error;
      }
    }
    
    // 半开状态下控制并发调用
    if (this.state === CircuitState.HALF_OPEN && this.activeCalls >= this.config.halfOpenMaxCalls) {
      throw new Error(`断路器[${this.name}]半开状态下达到最大调用限制`);
    }
    
    this.activeCalls++;
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    } finally {
      this.activeCalls--;
    }
  }
  
  // 记录成功
  private recordSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.reset();
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = Math.max(0, this.failureCount - 1); // 成功时减少失败计数
    }
    
    this.recordMetrics(false);
  }
  
  // 记录失败
  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    this.recordMetrics(true);
    
    // 检查是否达到故障阈值
    if (this.state === CircuitState.CLOSED && this.failureCount >= this.config.failureThreshold) {
      this.trip();
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.trip();
    }
  }
  
  // 断路器跳闸
  private trip() {
    this.state = CircuitState.OPEN;
    this.logStateChange(`触发跳闸，故障计数: ${this.failureCount}`);
  }
  
  // 重置断路器
  private reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.logStateChange('重置断路器');
  }
  
  // 检查是否可以尝试重置
  private canAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }
  
  // 记录指标
  private recordMetrics(isError: boolean) {
    const now = Date.now();
    this.errorRates.push({ timestamp: now, errors: isError ? 1 : 0, total: 1 });
    
    // 清理1分钟前的数据
    const oneMinuteAgo = now - 60000;
    this.errorRates = this.errorRates.filter(item => item.timestamp > oneMinuteAgo);
    
    // 检查错误率
    this.checkErrorRate();
  }
  
  // 检查错误率
  private checkErrorRate() {
    if (this.errorRates.length < 10) return; // 样本不足时不检查
    
    const totalErrors = this.errorRates.reduce((sum, item) => sum + item.errors, 0);
    const totalCalls = this.errorRates.reduce((sum, item) => sum + item.total, 0);
    const errorRate = (totalErrors / totalCalls) * 100;
    
    if (this.state === CircuitState.CLOSED && errorRate >= this.config.errorThresholdPercentage) {
      this.logStateChange(`错误率过高: ${errorRate.toFixed(2)}%，触发跳闸`);
      this.trip();
    }
  }
  
  // 获取当前状态
  getState(): CircuitState {
    return this.state;
  }
  
  // 获取统计信息
  getStats() {
    const totalErrors = this.errorRates.reduce((sum, item) => sum + item.errors, 0);
    const totalCalls = this.errorRates.reduce((sum, item) => sum + item.total, 0);
    
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      activeCalls: this.activeCalls,
      errorRate: totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  // 记录状态变化
  private logStateChange(message: string) {
    console.log(`[断路器][${this.name}] ${message} - 状态: ${this.state}`);
  }
}

// 重试策略配置
interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // 初始延迟(ms)
  maxDelay: number;     // 最大延迟(ms)
  backoffMultiplier: number; // 退避乘数
  retryableErrors: Array<(error: Error) => boolean>; // 可重试的错误类型
}

// 默认重试配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [(error: Error) => error.name !== 'TypeError' && error.name !== 'ReferenceError']
};

// 重试装饰器
async function withRetry<T>(
  fn: () => Promise<T>, 
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          mergedConfig.initialDelay * Math.pow(mergedConfig.backoffMultiplier, attempt - 1),
          mergedConfig.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`重试第 ${attempt} 次，延迟 ${delay}ms`);
      }
      
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 检查是否可以重试
      const canRetry = mergedConfig.retryableErrors.some(check => check(lastError));
      if (!canRetry || attempt === mergedConfig.maxRetries) {
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}

// 缓存结果接口
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiry: number;
}

// 简单的内存缓存
class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 300000) { // 默认5分钟
    this.defaultTTL = defaultTTL;
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, timestamp: Date.now(), expiry });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // 清理过期缓存
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// 监控指标收集器
class MetricsCollector {
  private metrics: Map<string, {
    count: number;
    errors: number;
    latency: {
      sum: number;
      min: number;
      max: number;
      values: number[];
    };
    lastUpdated: number;
  }> = new Map();
  
  // 记录操作开始
  startOperation(key: string): number {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        count: 0,
        errors: 0,
        latency: {
          sum: 0,
          min: Infinity,
          max: 0,
          values: []
        },
        lastUpdated: Date.now()
      });
    }
    return Date.now();
  }
  
  // 记录操作完成
  endOperation(key: string, startTime: number, isError: boolean = false): void {
    const metric = this.metrics.get(key);
    if (!metric) return;
    
    const duration = Date.now() - startTime;
    
    metric.count++;
    if (isError) metric.errors++;
    metric.latency.sum += duration;
    metric.latency.min = Math.min(metric.latency.min, duration);
    metric.latency.max = Math.max(metric.latency.max, duration);
    metric.latency.values.push(duration);
    metric.lastUpdated = Date.now();
    
    // 保留最近1000个延迟值
    if (metric.latency.values.length > 1000) {
      metric.latency.values.shift();
    }
  }
  
  // 获取指标
  getMetrics(key: string) {
    const metric = this.metrics.get(key);
    if (!metric) return null;
    
    const avgLatency = metric.count > 0 ? metric.latency.sum / metric.count : 0;
    
    // 计算中位数延迟
    const sortedLatencies = [...metric.latency.values].sort((a, b) => a - b);
    const medianLatency = sortedLatencies.length > 0 
      ? sortedLatencies[Math.floor(sortedLatencies.length / 2)] 
      : 0;
    
    return {
      count: metric.count,
      errorRate: metric.count > 0 ? (metric.errors / metric.count) * 100 : 0,
      latency: {
        avg: avgLatency,
        min: metric.latency.min === Infinity ? 0 : metric.latency.min,
        max: metric.latency.max,
        median: medianLatency
      },
      lastUpdated: metric.lastUpdated
    };
  }
  
  // 获取所有指标
  getAllMetrics() {
    const result: Record<string, unknown> = {};
    this.metrics.forEach((metric, key) => {
      result[key] = this.getMetrics(key);
    });
    return result;
  }
  
  // 清理过期指标（超过5分钟未更新）
  cleanup() {
    const threshold = Date.now() - 300000; // 5分钟
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.lastUpdated < threshold) {
        this.metrics.delete(key);
      }
    }
  }
}

// 故障自修复系统主服务
export class ResilienceService {
  private static instance: ResilienceService;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private cache: SimpleCache<unknown>;
  private metrics: MetricsCollector;
  
  private constructor() {
    this.cache = new SimpleCache();
    this.metrics = new MetricsCollector();
    
    // 定期清理缓存和指标
    setInterval(() => {
      this.cache.prune();
      this.metrics.cleanup();
    }, 60000); // 每分钟清理一次
  }
  
  // 单例模式
  static getInstance(): ResilienceService {
    if (!ResilienceService.instance) {
      ResilienceService.instance = new ResilienceService();
    }
    return ResilienceService.instance;
  }
  
  // 获取或创建断路器
  getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, config));
    }
    return this.circuitBreakers.get(name)!;
  }
  
  // 执行受保护的函数（综合使用断路器、重试和降级）
  async executeProtected<T>(
    name: string,
    fn: () => Promise<T>,
    options: {
      circuitConfig?: Partial<CircuitBreakerConfig>;
      retryConfig?: Partial<RetryConfig>;
      fallback?: { shouldFallback: (error: Error) => boolean; getFallbackValue: () => Promise<T> };
      cacheKey?: string;
      cacheTTL?: number;
    } = {}
  ): Promise<T> {
    // 检查缓存
    if (options.cacheKey) {
      const cachedValue = this.cache.get(options.cacheKey);
      if (cachedValue !== null) {
        return cachedValue as T;
      }
    }
    
    // 开始记录指标
    const startTime = this.metrics.startOperation(name);
    
    try {
      // 获取断路器
      const circuitBreaker = this.getCircuitBreaker(name, options.circuitConfig);
      
      // 使用断路器执行
      const result = await circuitBreaker.execute(() => {
        // 使用重试策略
        return withRetry(fn, options.retryConfig);
      });
      
      // 缓存结果
      if (options.cacheKey) {
        this.cache.set(options.cacheKey, result, options.cacheTTL);
      }
      
      // 记录成功
      this.metrics.endOperation(name, startTime, false);
      
      return result;
    } catch (error) {
      // 记录失败
      this.metrics.endOperation(name, startTime, true);
      
      // 如果有降级策略，尝试使用
      if (options.fallback && options.fallback.shouldFallback(error as Error)) {
        try {
          const fallbackResult = await options.fallback.getFallbackValue();
          // 缓存降级结果
          if (options.cacheKey) {
            this.cache.set(options.cacheKey, fallbackResult, options.cacheTTL);
          }
          return fallbackResult;
        } catch {
          // 降级也失败，抛出原始错误
          throw error;
        }
      }
      
      throw error;
    }
  }
  
  // 获取系统状态
  getSystemStatus() {
    const circuitStats: Record<string, unknown> = {};
    this.circuitBreakers.forEach((breaker, name) => {
      circuitStats[name] = breaker.getStats();
    });
    
    return {
      circuitBreakers: circuitStats,
      metrics: this.metrics.getAllMetrics(),
      cacheSize: this.cache['cache'].size,
      uptime: process.uptime()
    };
  }
  
  // 手动重置所有断路器
  resetAllCircuitBreakers() {
    this.circuitBreakers.forEach((breaker) => {
      // 由于 reset 是私有方法，我们可以添加一个公共方法来重置断路器
      // 这里假设为了修复该问题，我们应该将 CircuitBreaker 类中的 reset 方法改为公共方法
      // 但在现有代码结构下，我们可以考虑将断路器状态手动设置为关闭并重置计数
      breaker['state'] = CircuitState.CLOSED;
      breaker['failureCount'] = 0;
      breaker['successCount'] = 0;
      breaker['logStateChange']('手动重置断路器');
    });
  }
  
  // 手动清除缓存
  clearCache() {
    this.cache.clear();
  }
}

// 导出便捷方法
export const resilienceService = ResilienceService.getInstance();