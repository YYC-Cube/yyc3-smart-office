'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { X, Menu, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// 延迟加载图标组件，减少初始加载时间
const IconComponents = {
  Home: lazy(() => import('lucide-react').then((module) => ({ default: module.Home }))),
  FileText: lazy(() => import('lucide-react').then((module) => ({ default: module.FileText }))),
  Calendar: lazy(() => import('lucide-react').then((module) => ({ default: module.Calendar }))),
  Users: lazy(() => import('lucide-react').then((module) => ({ default: module.Users }))),
  GitMerge: lazy(() => import('lucide-react').then((module) => ({ default: module.GitMerge }))),
  Briefcase: lazy(() => import('lucide-react').then((module) => ({ default: module.Briefcase }))),
  FileCheck2: lazy(() => import('lucide-react').then((module) => ({ default: module.FileCheck2 }))),
  Clock: lazy(() => import('lucide-react').then((module) => ({ default: module.Clock }))),
  BarChart2: lazy(() => import('lucide-react').then((module) => ({ default: module.BarChart2 }))),
  UserCheck: lazy(() => import('lucide-react').then((module) => ({ default: module.UserCheck }))),
  Palette: lazy(() => import('lucide-react').then((module) => ({ default: module.Palette }))),
  MessageSquare: lazy(() => import('lucide-react').then((module) => ({ default: module.MessageSquare }))),
  Bot: lazy(() => import('lucide-react').then((module) => ({ default: module.Bot }))),
  Tool: lazy(() => import('lucide-react').then((module) => ({ default: module.HelpCircle }))),
  DollarSign: lazy(() => import('lucide-react').then((module) => ({ default: module.DollarSign }))),
  Package: lazy(() => import('lucide-react').then((module) => ({ default: module.Package }))),
  Settings: lazy(() => import('lucide-react').then((module) => ({ default: module.Settings }))),
  ChevronDown: lazy(() => import('lucide-react').then((module) => ({ default: module.ChevronDown }))),
  LogOut: lazy(() => import('lucide-react').then((module) => ({ default: module.LogOut }))),
  User: lazy(() => import('lucide-react').then((module) => ({ default: module.User }))),
  Search: lazy(() => import('lucide-react').then((module) => ({ default: module.Search }))),
};

// 延迟加载的组件
const HonorsShowcase = lazy(() => import('@/components/honors-showcase').then((module) => ({ default: module.HonorsShowcase })));

// 项目状态类型定义
type ProjectStatus = '进行中' | '计划中' | '审核中' | '已完成';



/**
 * @description 客户端仪表盘组件
 * @project YYC-smart-office
 */
export default function ClientDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [progress, setProgress] = useState(13);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 刷新用户数据
  const refreshUserData = async () => {
    setIsRefreshing(true);
    try {
      // 从sessionStorage获取用户数据
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        // 如果有存储的用户数据，重新解析并更新UI
        setError(null);
      } else {
        // 如果没有存储的用户数据，设置错误提示
        setError('未找到用户数据，请重新登录');
      }
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 渐进式加载进度条
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  // 检查屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 优化的导航项组件，使用懒加载的图标
  const LazyNavItem = ({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) => (
    <a
      href={href}
      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
    >
      <Icon size={20} className="mr-3" />
      <span>{label}</span>
    </a>
  );

  // 骨架屏优化组件
  const NavItemSkeleton = ({ isOpen }: { isOpen: boolean }) => (
    <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md">
      <Skeleton className="w-5 h-5 mr-3 rounded" />
      {isOpen && <Skeleton className="w-20 h-4 rounded" />}
    </div>
  );

  // 仪表盘卡片组件
  const DashboardCard = ({
    title,
    count,
    icon,
    description,
    color,
  }: {
    title: string;
    count: number;
    icon: React.ReactNode;
    description: string;
    color: 'blue' | 'purple' | 'indigo';
  }) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
      <Card className="hover-lift overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[color]} opacity-10 rounded-bl-full`}
        ></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <h3 className="text-3xl font-bold mt-1">{count}</h3>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <div className="p-3 rounded-lg bg-white shadow-sm">{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 项目项组件
  const ProjectItem = ({ name, status, progress, team }: { name: string; status: ProjectStatus; progress: number; team: string[] }) => {
    const statusColors: Record<ProjectStatus, string> = {
      进行中: 'bg-green-100 text-green-800',
      计划中: 'bg-yellow-100 text-yellow-800',
      审核中: 'bg-blue-100 text-blue-800',
      已完成: 'bg-purple-100 text-purple-800',
    };

    return (
      <div className="bg-white/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-slate-800">{name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>{status}</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>进度</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-slate-100"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {team.map((member, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-[10px]">{member[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-2">{team.length} 名成员</span>
        </div>
      </div>
    );
  };

  // 仪表盘卡片骨架屏
  const DashboardCardSkeleton = () => (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );

  // 项目项骨架屏
  const ProjectItemSkeleton = () => (
    <div className="p-4 border border-slate-200 rounded-lg bg-white/50 animate-pulse">
      <div className="h-5 w-48 bg-slate-200 rounded mb-2"></div>
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
        <div className="h-4 w-10 bg-slate-200 rounded"></div>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded mb-3"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
      </div>
    </div>
  );



  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏背景 */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isSidebarOpen && !isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 侧边栏 */}
      <aside
        className={`fixed lg:relative z-30 h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'} w-64 lg:w-64 flex-shrink-0`}
      >
        <div className="h-full flex flex-col bg-slate-800 overflow-y-auto">
          {/* 侧边栏内容区域 */}
          <div className="p-4 flex items-center justify-between">
            <div className="h-8 w-32"></div>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} className="text-white lg:hidden">
                <X size={24} />
              </button>
            )}
          </div>

          <div className="mt-2 px-3">
            {isSidebarOpen && (
              <div className="relative mb-4">
                <Suspense fallback={<div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-600 rounded" />}>
                  <IconComponents.Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </Suspense>
                <Input
                  placeholder="搜索..."
                  className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex-1 py-2">
            <div className="px-3 py-2">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">主要功能</p>
              )}
              <nav className="space-y-1">
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Home} label="首页" href="/" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.FileText} label="文档管理" href="/documents" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Calendar} label="日程安排" href="/calendar" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Users} label="员工管理" href="/employee" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.GitMerge} label="组织架构" href="/organization" />
                </Suspense>
              </nav>
            </div>

            <div className="px-3 py-2">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">业务功能</p>
              )}
              <nav className="space-y-1">
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Briefcase} label="岗位设置" href="/position-settings" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.FileCheck2} label="OA审批" href="/approval" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Clock} label="时间节点" href="/timeline" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.BarChart2} label="落地情况" href="/progress" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.UserCheck} label="客户回访" href="/customer-followup" />
                </Suspense>
              </nav>
            </div>

            <div className="px-3 py-2">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">智能工具</p>
              )}
              <nav className="space-y-1">
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Palette} label="推广设计" href="/design-tools" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.MessageSquare} label="信息中心" href="/message-center" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Bot} label="AI助理" href="/ai-assistant" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Tool} label="AI机维" href="/ai-maintenance" />
                </Suspense>
              </nav>
            </div>

            <div className="px-3 py-2">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">管理功能</p>
              )}
              <nav className="space-y-1">
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.DollarSign} label="收银管理" href="/cashier" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Package} label="仓库管理" href="/inventory" />
                </Suspense>
                <Suspense fallback={<NavItemSkeleton isOpen={isSidebarOpen} />}>
                  <LazyNavItem icon={IconComponents.Settings} label="系统设置" href="/settings" />
                </Suspense>
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700">
            {isSidebarOpen ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  {isLoading ? (
                    <div className="h-10 w-10 rounded-full bg-slate-700 animate-pulse"></div>
                  ) : (
                    <Avatar className="h-10 w-10 ring-2 ring-blue-500">
                      <AvatarImage
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                        alt={user?.name || '用户头像'}
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="ml-3 flex-1">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-white">{user?.name || '用户'}</p>
                          {user?.badge && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                              {user.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {user?.department || (user?.role === 'admin' ? '管理员' : '普通用户')}
                        </p>
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-slate-400 hover:text-white"
                      >
                        <Suspense fallback={<div className="w-4 h-4" />}>
                          <IconComponents.ChevronDown size={16} />
                        </Suspense>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                          <IconComponents.User size={16} className="mr-2" />
                        </Suspense>
                        个人资料
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                          <IconComponents.Settings size={16} className="mr-2" />
                        </Suspense>
                        账户设置
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-500">
                        <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                          <IconComponents.LogOut size={16} className="mr-2" />
                        </Suspense>
                        退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full text-slate-400 hover:text-white"
                onClick={logout}
              >
                <IconComponents.LogOut size={20} />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={24} />
              </Button>
              <h2 className="text-xl font-semibold text-slate-800">仪表盘</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" className="relative">
                <Suspense fallback={<div className="w-5 h-5" />}>
                  <Bell size={20} />
                </Suspense>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                      />
                      <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                      <IconComponents.User size={16} className="mr-2" />
                    </Suspense>
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                      <IconComponents.Settings size={16} className="mr-2" />
                    </Suspense>
                    账户设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <Suspense fallback={<div className="w-4 h-4 mr-2" />}>
                      <IconComponents.LogOut size={16} className="mr-2" />
                    </Suspense>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {/* 全局加载状态覆盖层 */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="flex flex-col items-center p-8 rounded-xl bg-white shadow-lg">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">正在加载您的工作环境</h3>
                <p className="text-slate-500 text-center">
                  请稍候，我们正在准备您的智能办公仪表盘...
                </p>
                <div className="mt-6 w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-slate-400">{progress}% 已完成</p>
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto">
            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-lg text-red-700 transition-all duration-300 ease-in-out animate-fade-in transform hover:scale-[1.01]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">加载失败</h3>
                      <p className="text-sm text-red-600 mt-0.5">{error}</p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={refreshUserData}
                    disabled={isRefreshing}
                    className="bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105"
                  >
                    {isRefreshing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>刷新中...</span>
                      </div>
                    ) : (
                      '重新加载'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                欢迎回来，{isLoading ? '加载中...' : user?.name || '用户'}
              </h1>
              <p className="text-slate-600">
                {isLoading
                  ? '正在准备您的工作环境...'
                  : `今天是 ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}，让我们开始吧！`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Suspense fallback={<DashboardCardSkeleton />}>
                <DashboardCard
                  title="待办任务"
                  count={5}
                  icon={
                    <Suspense fallback={<div className="w-8 h-8 bg-slate-200 rounded" />}>
                      <IconComponents.Clock className="w-8 h-8 text-blue-500" />
                    </Suspense>
                  }
                  description="今日需要完成的任务"
                  color="blue"
                />
              </Suspense>
              <Suspense fallback={<DashboardCardSkeleton />}>
                <DashboardCard
                  title="今日会议"
                  count={2}
                  icon={
                    <Suspense fallback={<div className="w-8 h-8 bg-slate-200 rounded" />}>
                      <IconComponents.Users className="w-8 h-8 text-purple-500" />
                    </Suspense>
                  }
                  description="已安排的会议"
                  color="purple"
                />
              </Suspense>
              <Suspense fallback={<DashboardCardSkeleton />}>
                <DashboardCard
                  title="未读消息"
                  count={3}
                  icon={
                    <Suspense fallback={<div className="w-8 h-8 bg-slate-200 rounded" />}>
                      <IconComponents.MessageSquare className="w-8 h-8 text-indigo-500" />
                    </Suspense>
                  }
                  description="需要查看的新消息"
                  color="indigo"
                />
              </Suspense>
            </div>

            <Tabs defaultValue="tasks" className="mb-8 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-slate-600">加载数据中...</p>
                  </div>
                </div>
              )}
              <TabsList className="bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  任务进度
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  项目概览
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tasks">
                <Card className="backdrop-blur-sm bg-white/70">
                  <CardHeader>
                    <CardTitle>本周任务完成进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Progress value={progress} className="w-full h-3 bg-blue-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">已完成</div>
                        <div className="text-2xl font-bold text-slate-800">8</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">进行中</div>
                        <div className="text-2xl font-bold text-slate-800">4</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">待处理</div>
                        <div className="text-2xl font-bold text-slate-800">3</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="projects">
                <Card className="backdrop-blur-sm bg-white/70">
                  <CardHeader>
                    <CardTitle>进行中的项目</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Suspense fallback={<ProjectItemSkeleton />}>
                        <ProjectItem
                          name="智能办公系统升级"
                          status="进行中"
                          progress={75}
                          team={['张三', '李四', '王五']}
                        />
                      </Suspense>
                      <Suspense fallback={<ProjectItemSkeleton />}>
                        <ProjectItem
                          name="客户管理系统优化"
                          status="计划中"
                          progress={25}
                          team={['赵六', '钱七']}
                        />
                      </Suspense>
                      <Suspense fallback={<ProjectItemSkeleton />}>
                        <ProjectItem
                          name="年度财务报告"
                          status="审核中"
                          progress={90}
                          team={['孙八', '周九', '吴十']}
                        />
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Suspense
              fallback={
                <div className="backdrop-blur-sm bg-white/70 p-8 rounded-xl">
                  <div className="h-64 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                </div>
              }
            >
              <HonorsShowcase />
            </Suspense>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center">
          <div className="flex justify-center items-center mb-2">
            <div className="h-8 w-32"></div>
          </div>
          <p className="text-sm text-gray-500">© 2025 言语(河南)智能科技有限公司. 保留所有权利.</p>
        </footer>
      </main>
    </div>
  );
}