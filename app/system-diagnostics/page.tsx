'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, Info, Activity, Server, Database, Code, GitBranch } from 'lucide-react';

// 系统状态类型定义
interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  version?: string;
  details?: string;
}

// 性能指标类型
interface PerformanceMetric {
  name: string;
  value: number;
  max: number;
}

// 依赖状态类型
interface DependencyStatus {
  name: string;
  version: string;
  status: 'up-to-date' | 'outdated' | 'missing';
}

export default function SystemDiagnosticsPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // 模拟获取系统状态数据
  useEffect(() => {
    // 模拟API调用延迟
    setTimeout(() => {
      setSystemStatus([
        {
          name: 'Next.js',
          status: 'healthy',
          version: '14.2.16',
          details: 'App Router 模式运行正常'
        },
        {
          name: 'React',
          status: 'healthy',
          version: '18.2.0',
          details: '客户端和服务端渲染正常'
        },
        {
          name: 'TypeScript',
          status: 'healthy',
          version: '5.6.2',
          details: '类型检查通过，无编译错误'
        },
        {
          name: 'Tailwind CSS',
          status: 'healthy',
          version: '3.4.17',
          details: '配置文件正确，自定义类已加载'
        },
        {
          name: '构建系统',
          status: 'healthy',
          details: '生产构建成功，无错误'
        },
        {
          name: '页面渲染',
          status: 'healthy',
          details: '所有页面预渲染成功'
        }
      ]);

      setPerformanceMetrics([
        { name: 'JavaScript 大小', value: 87.8, max: 200 },
        { name: 'CSS 大小', value: 15.3, max: 50 },
        { name: '组件数量', value: 42, max: 100 },
        { name: '页面数量', value: 23, max: 50 }
      ]);

      setDependencyStatus([
        { name: 'next', version: '14.2.16', status: 'up-to-date' },
        { name: 'react', version: '18.2.0', status: 'up-to-date' },
        { name: 'react-dom', version: '18.2.0', status: 'up-to-date' },
        { name: 'tailwindcss', version: '3.4.17', status: 'up-to-date' },
        { name: 'typescript', version: '5.6.2', status: 'up-to-date' },
        { name: '@types/node', version: '20.16.11', status: 'up-to-date' }
      ]);

      setLastChecked(new Date());
    }, 500);
  }, []);

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // 获取状态徽章颜色
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up-to-date':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
      case 'outdated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'healthy': '健康',
      'warning': '警告',
      'error': '错误',
      'up-to-date': '最新',
      'outdated': '过时',
      'missing': '缺失'
    };
    return statusMap[status] || status;
  };

  // 计算百分比
  const getPercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">系统诊断中心</h1>
          <p className="text-gray-600 dark:text-gray-400">全面监控项目健康状态和性能指标</p>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Server className="h-4 w-4 mr-2" />
          <span>最后检查: {lastChecked.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 系统状态卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center text-primary">
              <Activity className="h-5 w-5 mr-2" />
              核心系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(item.status)}
                      <span className="ml-2 font-medium">{item.name}</span>
                      {item.version && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.version}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getStatusBadgeVariant(item.status)}`}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  {item.details && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 pl-7">
                      {item.details}
                    </p>
                  )}
                  {index < systemStatus.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 性能指标卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader className="bg-secondary/5">
            <CardTitle className="flex items-center text-secondary">
              <Database className="h-5 w-5 mr-2" />
              性能指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="当前值" />
                  <Bar dataKey="max" fill="#e5e7eb" name="最大值" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {performanceMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm font-medium">{metric.value} / {metric.max}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${getPercentage(metric.value, metric.max)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 依赖状态卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader className="bg-accent/5">
            <CardTitle className="flex items-center text-accent">
              <Code className="h-5 w-5 mr-2" />
              依赖状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dependencyStatus.map((dep, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">{dep.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {dep.version}
                    </Badge>
                  </div>
                  <Badge className={`${getStatusBadgeVariant(dep.status)}`}>
                    {getStatusText(dep.status)}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  项目依赖状态良好，所有核心依赖都是最新版本。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 诊断报告 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">诊断报告摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  系统健康状态: 良好
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  ✅ 构建成功 - 所有页面预渲染正常
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  ✅ 配置正确 - Tailwind CSS 和自定义类定义完整
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  ✅ 依赖完整 - 所有核心依赖版本兼容且为最新
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}