'use client';

import React, { useState } from 'react';
import { DiagnosticsCenter } from '../../components/diagnostics-center';
import { cn } from '@/lib/utils';

// 简单的UI组件替代
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('border rounded-lg shadow-sm bg-white overflow-hidden', className)}>{children}</div>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onCheckedChange(e.target.checked)} 
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
}

function Typography({ 
  variant, 
  children, 
  className = '' 
}: { 
  variant: 'h6' | 'subtitle2' | 'body2' | 'body1'; 
  children: React.ReactNode; 
  className?: string;
}) {
  const baseClasses: Record<string, string> = {
    'h6': 'text-lg font-semibold',
    'subtitle2': 'text-base font-medium',
    'body1': 'text-base',
    'body2': 'text-sm'
  };
  
  return <div className={cn(baseClasses[variant], className)}>{children}</div>;
}

export default function DiagnosticsTestPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetailedView, setShowDetailedView] = useState(true);
  const [statusHistory, setStatusHistory] = useState<Array<{
    timestamp: Date;
    isHealthy: boolean;
    issues: string[];
  }>>([]);

  // 处理状态变化
  const handleStatusChange = (status: {
    isHealthy: boolean;
    issues: string[];
  }) => {
    const newStatusEntry = {
      timestamp: new Date(),
      ...status
    };
    
    setStatusHistory(prev => {
      const updated = [newStatusEntry, ...prev];
      // 只保留最近10条记录
      return updated.slice(0, 10);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系统诊断中心测试</h1>
        <p className="mt-2 text-gray-600">
          综合监控系统健康状态、数据库连接和故障自修复机制的实时诊断组件
        </p>
      </header>

      {/* 控制面板 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Typography variant="h6">控制面板</Typography>
              <Typography variant="body2" className="text-gray-600">
                调整诊断中心组件的配置参数
              </Typography>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                />
                <span>自动刷新</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showDetailedView} 
                  onCheckedChange={setShowDetailedView}
                />
                <span>显示详细视图</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 诊断中心组件 */}
      <div className="mb-8">
        <DiagnosticsCenter 
          autoRefresh={autoRefresh}
          refreshInterval={5000} // 5秒刷新一次
          showDetailedView={showDetailedView}
          onStatusChange={handleStatusChange}
          className="w-full"
        />
      </div>

      {/* 状态历史记录 */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <Typography variant="h6" className="mb-4">
            状态历史记录 (最近10次) 
          </Typography>
          <div className="space-y-2">
            {statusHistory.length === 0 ? (
              <Typography variant="body2" className="text-gray-500 italic">
                暂无状态历史记录
              </Typography>
            ) : (
              statusHistory.map((entry, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span 
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${ 
                        entry.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.isHealthy ? '正常' : '存在问题'}
                    </span>
                  </div>
                  {entry.issues.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      {entry.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="flex items-start space-x-1">
                          <span className="text-gray-500 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 功能说明 */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h6" className="mb-4">
            诊断中心功能说明
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2" className="font-medium mb-1">
                核心功能
              </Typography>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>综合系统状态监控</li>
                <li>数据库连接实时检测</li>
                <li>断路器状态分析</li>
                <li>性能指标监控</li>
                <li>系统运行时间展示</li>
              </ul>
            </div>
            <div>
              <Typography variant="subtitle2" className="font-medium mb-1">
                交互特性
              </Typography>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>可配置的自动刷新间隔</li>
                <li>详情视图展开/收起</li>
                <li>手动刷新和诊断操作</li>
                <li>响应缓存清除</li>
                <li>状态变化事件通知</li>
              </ul>
            </div>
            <div>
              <Typography variant="subtitle2" className="font-medium mb-1">
                技术实现
              </Typography>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>集成故障自修复系统和数据库监控</li>
                <li>响应式设计，适配不同屏幕尺寸</li>
                <li>实时状态分析和问题检测</li>
                <li>优雅的加载状态和错误处理</li>
                <li>支持模拟数据显示</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}