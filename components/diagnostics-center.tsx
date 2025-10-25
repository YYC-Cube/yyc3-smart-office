'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Shield, RefreshCw, Info, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbStatusMonitor } from './db-status-monitor';
import { getResilienceStatus, clearResponseCache } from '../middleware/resilience-middleware';
import { CircuitState } from '../lib/resilience-service';

// 断路器统计信息接口
interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  activeCalls: number;
  errorRate: number;
  lastFailureTime: number;
}

// 性能指标数据接口
interface MetricData {
  count: number;
  errorRate: number;
  latency: {
    avg: number;
    min: number;
    max: number;
    median: number;
  };
  lastUpdated: number;
  // 移除any类型，使用具体类型
  successRate?: number;
  throughput?: number;
  p95?: number;
  p99?: number;
}

// 缓存统计信息接口 - 暂时注释，因为未使用
// interface CacheStats {
//   size?: number;
//   hitRate?: number;
//   evictions?: number;
// }

// 系统弹性状态接口
interface ResilienceStatus {
  uptime: number;
  circuitBreakers: Record<string, CircuitBreakerStats | null>;
  cacheStats: {
    size: number;
    lastPruned: number;
  };
  metrics?: Record<string, MetricData | null>;
  isMockData?: boolean;
  systemStatus?: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated?: number;
}

// 诊断中心配置接口
interface DiagnosticsCenterProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // 毫秒
  showDetailedView?: boolean;
  onStatusChange?: (status: {
    isHealthy: boolean;
    issues: string[];
  }) => void;
}

// 综合诊断中心组件
export function DiagnosticsCenter({
  className,
  autoRefresh = true,
  refreshInterval = 10000, // 默认10秒刷新
  showDetailedView = true,
  onStatusChange,
}: DiagnosticsCenterProps) {
  const [resilienceStatus, setResilienceStatus] = useState<ResilienceStatus | null>(null);
  const [refreshTimestamp, setRefreshTimestamp] = useState<Date | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(showDetailedView);

  // 刷新系统状态
  const refreshStatus = async () => {
    try {
      const status = await getResilienceStatus();
      
      // 确保状态对象符合ResilienceStatus接口
      const normalizedStatus: ResilienceStatus = {
        uptime: status.uptime,
        circuitBreakers: (status.circuitBreakers || {}) as Record<string, CircuitBreakerStats | null>,
        cacheStats: status.cacheStats || { size: 0, lastPruned: 0 },
        metrics: (status.metrics || {}) as Record<string, MetricData | null>
      };
      
      setResilienceStatus(normalizedStatus);
      setRefreshTimestamp(new Date());
      
      // 分析问题并触发状态变更
      if (onStatusChange) {
        const issues = analyzeIssues(normalizedStatus).map(issue => issue.description);
        onStatusChange({
          isHealthy: issues.length === 0,
          issues
        });
      }
    } catch (error) {
      console.error('获取系统弹性状态失败:', error);
      // 错误情况下设置为不健康
      if (onStatusChange) {
        onStatusChange({
          isHealthy: false,
          issues: ['无法获取系统弹性状态']
        });
      }
    }
  };

  // 系统问题类型定义
  interface SystemIssue {
    type: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    component: string;
  }
  
  // 分析系统问题
    const analyzeIssues = (status: ResilienceStatus): SystemIssue[] => {
      const issues: SystemIssue[] = [];
      
      // 暂时移除模拟数据检查，避免类型错误
    
    // 检查断路器状态
      if (status.circuitBreakers) {
        Object.entries(status.circuitBreakers).forEach(([name, stats]) => {
          if (stats && typeof stats === 'object') {
            // 安全地检查状态
            if ('state' in stats && stats.state === CircuitState.OPEN) {
              issues.push({
                type: 'circuit_breaker',
                severity: 'critical',
                title: '断路器开路',
                description: `服务 "${name}" 断路器处于开路状态`,
                component: name
              });
            } else if ('state' in stats && stats.state === CircuitState.HALF_OPEN) {
              issues.push({
                type: 'circuit_breaker',
                severity: 'warning',
                title: '断路器半开',
                description: `服务 "${name}" 断路器处于半开状态`,
                component: name
              });
            }
            // 安全地检查错误率
            if ('errorRate' in stats && typeof stats.errorRate === 'number' && stats.errorRate > 10) {
              issues.push({
                type: 'error_rate',
                severity: 'warning',
                title: '错误率过高',
                description: `服务 "${name}" 错误率过高: ${stats.errorRate.toFixed(2)}%`,
                component: name
              });
            }
          }
        });
      }
    
    // 检查性能指标
    if (status.metrics) {
      Object.entries(status.metrics).forEach(([name, data]) => {
          if (data && typeof data === 'object' && 'latency' in data && 
              data.latency && typeof data.latency === 'object' && 
              'avg' in data.latency && typeof data.latency.avg === 'number' && 
              data.latency.avg > 1000) {
            issues.push({
              type: 'high_latency',
              severity: 'warning',
              title: '延迟过高',
              description: `操作 "${name}" 平均延迟过高: ${data.latency.avg.toFixed(2)}ms`,
              component: name
            });
          }
        });
    }
    
    return issues;
  };

  // 清除缓存
  const handleClearCache = () => {
    try {
      clearResponseCache();
      refreshStatus();
      alert('缓存已清除');
    } catch (error) {
      console.error('清除缓存失败:', error);
      alert('清除缓存失败');
    }
  };

  useEffect(() => {
    // 直接在effect内部定义刷新逻辑，避免外部依赖
    const fetchStatus = async () => {
      try {
        const status = await getResilienceStatus();
        
        // 确保状态对象符合ResilienceStatus接口
      const normalizedStatus: ResilienceStatus = {
        uptime: status.uptime,
        circuitBreakers: (status.circuitBreakers || {}) as Record<string, CircuitBreakerStats | null>,
        cacheStats: status.cacheStats || { size: 0, lastPruned: 0 },
        metrics: (status.metrics || {}) as Record<string, MetricData | null>
      };
        
        setResilienceStatus(normalizedStatus);
        setRefreshTimestamp(new Date());
        
        // 分析问题并触发状态变更
        if (onStatusChange) {
          // 使用统一的分析逻辑
          const issues: string[] = [];
          
          // 检查断路器状态
          const circuitBreakers = normalizedStatus.circuitBreakers || {};
          Object.entries(circuitBreakers).forEach(([name, stats]) => {
            if (stats && stats.state === CircuitState.OPEN) {
              issues.push(`服务 "${name}" 断路器处于开路状态`);
            } else if (stats && stats.errorRate > 5) {
              issues.push(`服务 "${name}" 错误率过高: ${stats.errorRate.toFixed(1)}%`);
            }
          });
          
          // 检查性能指标
          const metrics = normalizedStatus.metrics || {};
          Object.entries(metrics).forEach(([name, data]) => {
            if (data && data.latency?.avg && data.latency.avg > 1000) {
              issues.push(`操作 "${name}" 平均延迟过高: ${data.latency.avg.toFixed(2)}ms`);
            }
          });
          
          onStatusChange({
            isHealthy: issues.length === 0,
            issues
          });
        }
      } catch (error) {
        console.error('获取系统弹性状态失败:', error);
        if (onStatusChange) {
          onStatusChange({
            isHealthy: false,
            issues: ['无法获取系统弹性状态']
          });
        }
      }
    };
    
    fetchStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, autoRefresh, onStatusChange]);

  // 系统健康状态
  const isSystemHealthy = resilienceStatus && !resilienceStatus.isMockData && 
    (!resilienceStatus.circuitBreakers || 
     Object.values(resilienceStatus.circuitBreakers).every((b) => 
       b && b.state === CircuitState.CLOSED && b.errorRate <= 5));

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // 格式化运行时间
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  return (
    <div className={cn('bg-white border rounded-lg shadow-sm overflow-hidden', className)}>
      {/* 诊断中心头部 */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">系统诊断中心</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={refreshStatus} 
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title="刷新状态"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setShowFullDetails(!showFullDetails)} 
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title={showFullDetails ? "收起详情" : "展开详情"}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 核心状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b">
        {/* 系统状态 */}
        <div className="p-4 flex items-start space-x-3 border-r last:border-r-0">
          <div className={`p-2 rounded-full ${isSystemHealthy ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isSystemHealthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm text-gray-500">系统状态</p>
            <p className={`font-medium ${isSystemHealthy ? 'text-green-700' : 'text-red-700'}`}>
              {isSystemHealthy ? '正常' : '存在问题'}
            </p>
            {refreshTimestamp && (
              <p className="text-xs text-gray-400">最后刷新: {formatTime(refreshTimestamp)}</p>
            )}
          </div>
        </div>

        {/* 数据库状态 */}
        <div className="p-4 border-r last:border-r-0">
          <DbStatusMonitor 
            showLabel={false} 
            pollingInterval={5000}
            className="w-full"
          />
        </div>

        {/* 运行时间 */}
        <div className="p-4 flex items-start space-x-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">系统运行时间</p>
            <p className="font-medium text-gray-900">
              {resilienceStatus ? formatUptime(resilienceStatus.uptime) : '--'}
            </p>
            {resilienceStatus?.isMockData && (
              <p className="text-xs text-yellow-600">模拟数据</p>
            )}
          </div>
        </div>
      </div>

      {/* 详细信息部分 */}
      {showFullDetails && (
        <div className="p-4">
          {/* 问题警告 */}
          {resilienceStatus && !isSystemHealthy && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">检测到潜在问题</h4>
                  <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                    {analyzeIssues(resilienceStatus).map((issue, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 诊断操作 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={handleClearCache}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              清除响应缓存
            </button>
            <button 
              onClick={refreshStatus}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
            >
              立即诊断
            </button>
          </div>

          {/* 断路器状态摘要 */}
          {resilienceStatus?.circuitBreakers && Object.keys(resilienceStatus.circuitBreakers).length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">断路器状态摘要</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(resilienceStatus.circuitBreakers).map(([name, stats]) => {
                  if (!stats) return null;
                  
                  let statusClass = 'bg-gray-100 text-gray-700';
                  let statusText = '未知';
                  
                  if (stats.state === CircuitState.CLOSED) {
                    statusClass = 'bg-green-100 text-green-700';
                    statusText = '正常';
                  } else if (stats.state === CircuitState.OPEN) {
                    statusClass = 'bg-red-100 text-red-700';
                    statusText = '开路';
                  } else if (stats.state === CircuitState.HALF_OPEN) {
                    statusClass = 'bg-yellow-100 text-yellow-700';
                    statusText = '半开';
                  }
                  
                  return (
                    <div 
                      key={name} 
                      className={`px-2 py-1 rounded-md text-xs ${statusClass}`}
                      title={`${name}: 错误率 ${stats?.errorRate?.toFixed(2) || 0}%`}
                    >
                      {name.split('/').pop() || name}: {statusText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 性能指标摘要 */}
          {resilienceStatus?.metrics && Object.keys(resilienceStatus.metrics).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">性能指标摘要</h4>
              <div className="space-y-2">
                {Object.entries(resilienceStatus.metrics).map(([name, data]) => {
                  if (!data) return null;
                  
                  const avgLatency = data.latency?.avg || 0;
                  const latencyClass = 
                    avgLatency > 1000 ? 'text-red-600' :
                    avgLatency > 500 ? 'text-yellow-600' : 'text-green-600';
                  
                  return (
                    <div key={name} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{name.split('/').pop() || name}</span>
                        <span className={`font-medium ${latencyClass}`}>
                          {avgLatency.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                        <div 
                          className={`h-1 rounded-full ${latencyClass}`} 
                          style={{ 
                            width: `${Math.min(100, (avgLatency / 2000) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}