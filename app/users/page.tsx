'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApiClient } from '@/lib/api-client';
// 移除未使用的 Badge 导入
import PermissionGate from '@/components/permission-gate';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive';
}

// API响应接口
interface ApiResponse<T> {
  data: T;
}

export default function UsersPage() {
  const api = useApiClient();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<User[]>>(`/api/users?search=${search}`);
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>

        <PermissionGate permissionCode="user:manage">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 添加用户
          </Button>
        </PermissionGate>
      </div>

      <div className="flex mb-4">
        <Input
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm mr-2"
        />
        <Button onClick={handleSearch}>搜索</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                加载中...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                没有找到用户
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <PermissionGate permissionCode="user:manage">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
