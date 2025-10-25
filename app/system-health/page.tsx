'use client'
import React, { useState, useEffect } from 'react';
import { getResilienceStatus, clearResponseCache } from '../../middleware/resilience-middleware';
import { CircuitState } from '../../lib/resilience-service';
// cn 导入已移除，因为未使用
import Head from 'next/head';

// 状态样式映射
export interface StateStyle {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

// 已在顶部定义StateStyle接口

const stateStyles: Record<CircuitState, StateStyle> = {
  [CircuitState.CLOSED]: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: '正常'
  },
  [CircuitState.OPEN]: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: '开路'
  },
  [CircuitState.HALF_OPEN]: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: '半开'
  }
};

// 健康指标卡片组件
interface HealthMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  className?: string;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ title, value, subtitle, trend, icon, className }): JSX.Element => {
  const trendClasses = {
    up: 'text-red-500',
    down: 'text-green-500',
    stable: 'text-gray-500'
  };

  return (
    <div className={`p-4 border rounded-lg shadow-sm bg-white ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm ${trendClasses[trend]}`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
    </div>
  );
};

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  activeCalls: number;
  errorRate: number;
  lastFailureTime: number | null;
}

// 断路器状态表格组件
const CircuitBreakerTable: React.FC<{
  circuitBreakers: Record<string, CircuitBreakerStats>;
}> = ({ circuitBreakers }): JSX.Element => {
  const sortedBreakers = Object.entries(circuitBreakers)
    .sort(([, a]: [string, CircuitBreakerStats], [, b]: [string, CircuitBreakerStats]) => {
      // 优先显示开路状态的断路器
      if (a.state === CircuitState.OPEN && b.state !== CircuitState.OPEN) return -1;
      if (a.state !== CircuitState.OPEN && b.state === CircuitState.OPEN) return 1;
      // 其次显示半开状态的断路器
      if (a.state === CircuitState.HALF_OPEN && b.state !== CircuitState.HALF_OPEN) return -1;
      if (a.state !== CircuitState.HALF_OPEN && b.state === CircuitState.HALF_OPEN) return 1;
      // 最后按错误率排序
      return (b.errorRate || 0) - (a.errorRate || 0);
    })
    .map(([name, stats]) => ({ name, ...stats }));

  // 获取断路器状态样式
  const getCircuitStateStyles = (state: CircuitState): StateStyle => {
    return stateStyles[state] || stateStyles[CircuitState.CLOSED]; // 提供默认值以确保类型安全
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              服务名称
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              失败次数
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              活跃调用
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              错误率
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              上次失败
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBreakers.map((breaker) => {
            const style = getCircuitStateStyles(breaker.state);
            const lastFailureTime = breaker.lastFailureTime 
              ? new Date(breaker.lastFailureTime).toLocaleString() 
              : '-';
            
            return (
              <tr key={breaker.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {breaker.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style.bgColor} ${style.color} ${style.borderColor} border`}
                  >
                    {style.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {breaker.failureCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {breaker.activeCalls}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {breaker.errorRate.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lastFailureTime}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// 指标图表组件（简化版）
const MetricsChart: React.FC<{
  metrics: Record<string, {
    count: number;
    errorRate: number;
    latency: {
      min: number;
      max: number;
      avg: number;
    };
  }>;
}> = ({ metrics }): JSX.Element => {
  const metricsList = Object.entries(metrics).map(([name, data]) => ({ name, ...data }));
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作名称
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              调用次数
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              错误率
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              平均延迟(ms)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最小延迟(ms)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最大延迟(ms)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metricsList.map((metric) => (
            <tr key={metric.name}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {metric.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.count}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${metric.errorRate > 10 ? 'text-red-500' : metric.errorRate > 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                {metric.errorRate.toFixed(2)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.latency.avg.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.latency.min}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.latency.max}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 主系统健康页面
export interface SystemStatus {
  isMockData?: boolean;
  uptime: number;
  circuitBreakers: Record<string, CircuitBreakerStats>;
  cacheStats: {
    size: number;
    lastPruned: number;
  };
  metrics: Record<string, {
    count: number;
    errorRate: number;
    latency: {
      min: number;
      max: number;
      avg: number;
    };
  }>;
}

const SystemHealthPage: React.FC = (): JSX.Element => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 刷新状态数据
  const refreshStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // 直接调用中间件提供的函数获取真实数据
      const currentStatus = getResilienceStatus();
      // 转换为SystemStatus类型，添加类型断言以确保类型兼容性
      const statusToSet: SystemStatus = {
        uptime: currentStatus.uptime,
        circuitBreakers: currentStatus.circuitBreakers as Record<string, CircuitBreakerStats>,
        cacheStats: currentStatus.cacheStats,
        metrics: (currentStatus.metrics || {}) as Record<string, {
          count: number;
          errorRate: number;
          latency: { min: number; max: number; avg: number; };
        }>
      };
      setStatus(statusToSet);
    } catch (err) {
      setError('获取系统状态失败');
      console.error('Error fetching status:', err);
      // 如果获取失败，使用模拟数据并标记
      const mockStatus: SystemStatus = {
        isMockData: true,
        uptime: Math.floor(Math.random() * 86400),
        circuitBreakers: {
          'api/external-service': {
            state: CircuitState.CLOSED,
            failureCount: 0,
            activeCalls: 12,
            errorRate: 2.5,
            lastFailureTime: null
          },
          'api/database': {
            state: CircuitState.CLOSED,
            failureCount: 0,
            activeCalls: 45,
            errorRate: 0.3,
            lastFailureTime: null
          }
        },
        cacheStats: {
          size: Math.floor(Math.random() * 100),
          lastPruned: Date.now() - Math.random() * 3600000
        },
        metrics: {
          'api/external-service': {
            count: 1250,
            errorRate: 2.5,
            latency: {
              min: 50,
              max: 500,
              avg: 120
            }
          },
          'api/database': {
            count: 5400,
            errorRate: 0.3,
            latency: {
              min: 10,
              max: 150,
              avg: 45
            }
          }
        }
      };
      setStatus(mockStatus);
    } finally {
      setLoading(false);
    }
  };
  
  // 清除缓存
  const handleClearCache = async (): Promise<void> => {
    try {
      // 调用中间件提供的清除缓存函数
      clearResponseCache();
      // 刷新状态以反映更改
      refreshStatus();
      alert('缓存已清除');
    } catch (err) {
      alert('清除缓存失败');
      console.error('Error clearing cache:', err);
      // 如果清除失败，至少更新UI状态
      if (status) {
        setStatus((prev: SystemStatus | null) => ({
          ...(prev || {
            uptime: 0,
            circuitBreakers: {},
            cacheStats: { size: 0, lastPruned: Date.now() },
            metrics: {}
          }),
          cacheStats: {
            ...(prev?.cacheStats || { size: 0, lastPruned: Date.now() }),
            size: 0,
            lastPruned: Date.now()
          }
        }));
      }
    }
  };
  
  // 组件挂载时获取状态
  useEffect(() => {
    refreshStatus();
    
    // 每5秒自动刷新一次，与页脚说明保持一致
    const interval: NodeJS.Timeout = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !status) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline"> {error || '无法加载系统状态'}</span>
          <button onClick={refreshStatus} className="mt-2 text-sm text-red-600 hover:underline">重试</button>
        </div>
      </div>
    );
  }
  
  // 计算摘要指标
  const circuitBreakers = status.circuitBreakers || {};
  const metrics = status.metrics || {};
  const totalBreakers: number = Object.keys(circuitBreakers).length;
  const openBreakers: number = Object.values(circuitBreakers).filter(
    (b) => b.state === CircuitState.OPEN
  ).length;
  const halfOpenBreakers: number = Object.values(circuitBreakers).filter(
    (b) => b.state === CircuitState.HALF_OPEN
  ).length;
  const closedBreakers: number = totalBreakers - openBreakers - halfOpenBreakers;
  
  // 计算平均错误率
  const errorRates: number[] = Object.values(metrics).map((m) => m.errorRate);
  const avgErrorRate: number = errorRates.length > 0 
    ? errorRates.reduce((a: number, b: number) => a + b, 0) / errorRates.length 
    : 0;
  
  // 计算总调用次数
  const totalCalls: number = Object.values(metrics).reduce((sum: number, m) => sum + m.count, 0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>系统健康 - 智能办公经管系统</title>
      </Head>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统健康监控</h1>
          <p className="text-gray-500 mt-1">实时监控故障自修复系统状态</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={refreshStatus} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            刷新状态
          </button>
          <button 
            onClick={handleClearCache} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            清除缓存
          </button>
        </div>
      </div>
      
      {/* 系统概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <HealthMetricCard 
          title="断路器总数" 
          value={totalBreakers} 
          subtitle={`正常: ${closedBreakers}, 开路: ${openBreakers}, 半开: ${halfOpenBreakers}`}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>}
        />
        <HealthMetricCard 
          title="平均错误率" 
          value={`${avgErrorRate.toFixed(2)}%`} 
          trend={avgErrorRate > 10 ? 'up' : avgErrorRate > 5 ? 'stable' : 'down'}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>}
          className={avgErrorRate > 10 ? 'border-red-200' : avgErrorRate > 5 ? 'border-yellow-200' : 'border-green-200'}
        />
        <HealthMetricCard 
          title="缓存大小" 
          value={status.cacheStats?.size || 0} 
          subtitle="缓存响应数量"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>}
        />
        <HealthMetricCard 
          title="总调用次数" 
          value={totalCalls} 
          subtitle="自系统启动以来"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>}
        />
      </div>
      
      {/* 系统信息 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">系统信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">系统运行时间</p>
            <p className="text-lg font-medium">{Math.floor(status.uptime / 60)}分钟 {Math.floor(status.uptime % 60)}秒</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">最后缓存清理</p>
            <p className="text-lg font-medium">
              {new Date(status.cacheStats.lastPruned || Date.now()).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">健康状态</p>
            <p className={`text-lg font-medium ${openBreakers > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {openBreakers > 0 ? '部分服务降级' : '全部正常'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">监控时间</p>
            <p className="text-lg font-medium">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* 断路器状态 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">断路器状态</h2>
        {totalBreakers > 0 ? (
          <CircuitBreakerTable circuitBreakers={circuitBreakers} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无断路器数据
          </div>
        )}
      </div>
      
      {/* 性能指标 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">性能指标</h2>
        {Object.keys(metrics).length > 0 ? (
          <MetricsChart metrics={metrics} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无性能指标数据
          </div>
        )}
      </div>
      
      {/* 页脚说明 */}
      {/* 数据来源提示 */}
      {status.isMockData && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          <strong>注意：</strong>当前显示的是模拟数据，系统无法获取真实的故障自修复系统状态。
        </div>
      )}
      
      {/* 页脚说明 */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>故障自修复系统监控面板 | 每5秒自动刷新</p>
        <p className="mt-1">系统基于断路器模式、重试机制和降级策略实现自动故障恢复</p>
      </div>
    </div>
  );
};

export default SystemHealthPage;