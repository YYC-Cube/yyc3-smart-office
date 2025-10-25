'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  type: string;
  message: string;
  username?: string;
  ip?: string;
}

interface LogResponse {
  data: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API响应接口
interface ApiResponse<T> {
  data: T;
  pagination?: LogResponse['pagination'];
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiClient } from '@/lib/api-client';
import { LogLevel, LogType } from '@/models/log';
import { format } from 'date-fns';

export default function LogsPage() {
  const api = useApiClient();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<LogResponse['pagination']>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    type: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);

      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (filters.level) {
        params.append('level', filters.level);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      // 使用正确的ApiResponse类型，避免any类型
      const response = await api.get<ApiResponse<LogEntry[]>>(`/api/logs?${params.toString()}`);
      if (response && response.data) {
        setLogs(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, filters, api]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 获取日志级别的样式
  const getLevelStyle = (level: string) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-500';
      case LogLevel.INFO:
        return 'text-blue-500';
      case LogLevel.WARN:
        return 'text-yellow-500';
      case LogLevel.ERROR:
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">系统日志</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>日志筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">日志级别</label>
              <Select
                value={filters.level}
                onValueChange={(value) => handleFilterChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value={LogLevel.DEBUG}>调试</SelectItem>
                  <SelectItem value={LogLevel.INFO}>信息</SelectItem>
                  <SelectItem value={LogLevel.WARN}>警告</SelectItem>
                  <SelectItem value={LogLevel.ERROR}>错误</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">日志类型</label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value={LogType.AUTH}>认证</SelectItem>
                  <SelectItem value={LogType.USER}>用户</SelectItem>
                  <SelectItem value={LogType.CUSTOMER}>客户</SelectItem>
                  <SelectItem value={LogType.TASK}>任务</SelectItem>
                  <SelectItem value={LogType.SYSTEM}>系统</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">开始日期</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">结束日期</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">搜索</label>
              <div className="flex">
                <Input
                  placeholder="搜索日志..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="mr-2"
                />
                <Button onClick={handleSearch}>搜索</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>时间</TableHead>
            <TableHead>级别</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>消息</TableHead>
            <TableHead>用户</TableHead>
            <TableHead>IP地址</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                加载中...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                没有找到日志
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log: LogEntry) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell className={getLevelStyle(log.level)}>
                  {log.level.toUpperCase()}
                </TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.username || '-'}</TableCell>
                <TableCell>{log.ip || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div>
          显示 {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total}{' '}
          条
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
