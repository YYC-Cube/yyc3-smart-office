'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, PlusCircle, Search, MoreHorizontal, Clock, Users, Star, MapPin, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// Tooltip imports removed as they're not used
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

// 定义日程类型接口
interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  participants: Participant[];
  creator: Participant;
  isStarred: boolean;
  isAllDay: boolean;
  reminders: number[]; // 提前提醒时间（分钟）
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  status?: 'accepted' | 'declined' | 'pending';
}

// 模拟用户数据
const currentUser: Participant = {
  id: '1',
  name: '张三',
  avatar: 'https://ui-avatars.com/api/?name=张三&background=random',
  role: '管理员'
};

// 模拟参与者数据
const mockParticipants: Participant[] = [
  currentUser,
  {
    id: '2',
    name: '李四',
    avatar: 'https://ui-avatars.com/api/?name=李四&background=random',
    role: '产品经理'
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://ui-avatars.com/api/?name=王五&background=random',
    role: '开发工程师'
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://ui-avatars.com/api/?name=赵六&background=random',
    role: '设计师'
  },
  {
    id: '5',
    name: '孙七',
    avatar: 'https://ui-avatars.com/api/?name=孙七&background=random',
    role: '测试工程师'
  }
];

// 生成模拟日程数据
const generateMockSchedules = (): Schedule[] => {
  const categories = ['会议', '任务', '提醒', '休假', '其他'];
  const locations = ['线上会议', '会议室A', '会议室B', '办公室', '客户现场'];
  const titles = [
    '周例会', '产品需求评审', '项目进度同步', '设计评审', '代码审查',
    '客户演示', '团队建设活动', '技术分享会', '培训课程', '产品发布准备'
  ];
  
  const schedules: Schedule[] = [];
  
  // 生成未来30天的日程
  for (let i = 0; i < 20; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30) - 15); // 过去15天到未来15天
    
    const isAllDay = Math.random() > 0.7;
    let startTime, endTime;
    
    if (isAllDay) {
      startTime = format(randomDate, 'yyyy-MM-dd');
      endTime = format(randomDate, 'yyyy-MM-dd');
    } else {
      const startHour = 9 + Math.floor(Math.random() * 8); // 9点到17点之间
      randomDate.setHours(startHour, 0, 0, 0);
      startTime = format(randomDate, 'yyyy-MM-dd HH:mm');
      
      const duration = 1 + Math.floor(Math.random() * 3); // 1到3小时
      randomDate.setHours(startHour + duration, 0, 0, 0);
      endTime = format(randomDate, 'yyyy-MM-dd HH:mm');
    }
    
    // 随机选择2-4个参与者
    const selectedParticipants: Participant[] = [];
    const participantCount = 2 + Math.floor(Math.random() * 3);
    const shuffledParticipants = [...mockParticipants].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < participantCount; j++) {
      selectedParticipants.push({
        ...shuffledParticipants[j],
        status: ['accepted', 'declined', 'pending'][Math.floor(Math.random() * 3)] as 'accepted' | 'declined' | 'pending'
      });
    }
    
    schedules.push({
      id: `schedule-${i + 1}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: '这是一个模拟的日程描述，包含了日程的详细信息和讨论要点。',
      startTime,
      endTime,
      category: categories[Math.floor(Math.random() * categories.length)],
      status: ['pending', 'confirmed', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      location: isAllDay ? undefined : locations[Math.floor(Math.random() * locations.length)],
      participants: selectedParticipants,
      creator: mockParticipants[Math.floor(Math.random() * mockParticipants.length)],
      isStarred: Math.random() > 0.8,
      isAllDay,
      reminders: Math.random() > 0.5 ? [[15, 30, 60][Math.floor(Math.random() * 3)]] : [] as number[]
    });
  }
  
  return schedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

// 获取日程分类的颜色
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    '会议': 'bg-blue-100 text-blue-800',
    '任务': 'bg-green-100 text-green-800',
    '提醒': 'bg-yellow-100 text-yellow-800',
    '休假': 'bg-purple-100 text-purple-800',
    '其他': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors['其他'];
};

// 获取状态的颜色
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-green-100 text-green-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || colors['pending'];
};

const SchedulePage = () => {
  // 状态管理
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
    endTime: format(new Date(new Date().getTime() + 60 * 60 * 1000), 'yyyy-MM-dd HH:mm'),
    category: '会议',
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    location: '',
    participants: [currentUser],
    isAllDay: false,
    reminders: []
  });
  const [showCompleted, setShowCompleted] = useState(false);
  const [categories, setCategories] = useState<string[]>(['all']);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      setTimeout(() => {
        const data = generateMockSchedules();
        setSchedules(data);
        
        // 提取所有分类
        const uniqueCategories = Array.from(new Set(data.map(s => s.category)));
        setCategories(['all', ...uniqueCategories]);
        
        setIsLoading(false);
      }, 800);
    };
    
    loadData();
  }, []);

  // 过滤日程
  useEffect(() => {
    let result = [...schedules];
    
    // 应用搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(schedule => 
        schedule.title.toLowerCase().includes(query) || 
        schedule.description.toLowerCase().includes(query) ||
        schedule.location?.toLowerCase().includes(query) ||
        schedule.participants.some(p => p.name.toLowerCase().includes(query))
      );
    }
    
    // 应用分类过滤
    if (filterCategory !== 'all') {
      result = result.filter(schedule => schedule.category === filterCategory);
    }
    
    // 应用状态过滤
    if (filterStatus !== 'all') {
      result = result.filter(schedule => schedule.status === filterStatus);
    }
    
    // 应用已完成过滤
    if (!showCompleted) {
      result = result.filter(schedule => schedule.status !== 'completed');
    }
    
    // 按时间排序
    result = result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    setFilteredSchedules(result);
  }, [schedules, searchQuery, filterCategory, filterStatus, showCompleted]);

  // 切换星标状态功能已移除

  // 添加新日程
  const addSchedule = () => {
    if (!newSchedule.title.trim()) {
      toast({ title: '错误', description: '日程标题不能为空', variant: 'destructive' });
      return;
    }
    
    if (new Date(newSchedule.startTime) >= new Date(newSchedule.endTime)) {
      toast({ title: '错误', description: '结束时间必须晚于开始时间', variant: 'destructive' });
      return;
    }
    
    const schedule: Schedule = {
      ...newSchedule,
      id: `schedule-${schedules.length + 1}`,
      creator: currentUser,
      isStarred: false
    };
    
    setSchedules([...schedules, schedule]);
    setNewSchedule({
      title: '',
      description: '',
      startTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
      endTime: format(new Date(new Date().getTime() + 60 * 60 * 1000), 'yyyy-MM-dd HH:mm'),
      category: '会议',
      status: 'pending',
      location: '',
      participants: [currentUser],
      isAllDay: false,
      reminders: []
    });
    setIsAddDialogOpen(false);
    toast({ title: '创建成功', description: `日程 "${schedule.title}" 已创建` });
  };

  // 更新日程
  const updateSchedule = () => {
    if (!currentSchedule?.title.trim()) {
      toast({ title: '错误', description: '日程标题不能为空', variant: 'destructive' });
      return;
    }
    
    if (new Date(currentSchedule.startTime) >= new Date(currentSchedule.endTime)) {
      toast({ title: '错误', description: '结束时间必须晚于开始时间', variant: 'destructive' });
      return;
    }
    
    setSchedules(prev => prev.map(schedule => 
      schedule.id === currentSchedule.id ? currentSchedule : schedule
    ));
    setIsEditDialogOpen(false);
    toast({ title: '更新成功', description: `日程 "${currentSchedule.title}" 已更新` });
  };

  // 删除日程
  const deleteSchedule = (id: string) => {
    const scheduleToDelete = schedules.find(s => s.id === id);
    if (scheduleToDelete) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast({ title: '删除成功', description: `日程 "${scheduleToDelete.title}" 已删除` });
    }
  };

  // 打开编辑对话框
  const openEditDialog = (schedule: Schedule) => {
    setCurrentSchedule({...schedule});
    setIsEditDialogOpen(true);
  };

  // 打开详情对话框
  const openDetailDialog = (schedule: Schedule) => {
    setCurrentSchedule({...schedule});
    setIsDetailDialogOpen(true);
  };

  // 渲染日程项
  const renderScheduleItem = (schedule: Schedule) => (
    <Card key={schedule.id} className="mb-3 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(schedule.category)}>{schedule.category}</Badge>
            {schedule.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetailDialog(schedule)}>
                <Eye className="mr-2 h-4 w-4" /> 查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(schedule)}>
                <Edit className="mr-2 h-4 w-4" /> 编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => deleteSchedule(schedule.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> 删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="text-lg font-semibold mb-1 cursor-pointer hover:text-blue-600" onClick={() => openDetailDialog(schedule)}>
          {schedule.title}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {schedule.isAllDay ? '全天' : `${format(new Date(schedule.startTime), 'HH:mm')} - ${format(new Date(schedule.endTime), 'HH:mm')}`}
          </div>
          {schedule.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {schedule.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Badge className={getStatusColor(schedule.status)} variant="outline">
              {schedule.status === 'pending' && '待确认'}
              {schedule.status === 'confirmed' && '已确认'}
              {schedule.status === 'completed' && '已完成'}
              {schedule.status === 'cancelled' && '已取消'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {schedule.participants.slice(0, 3).map(participant => (
            <Avatar key={participant.id} className="h-7 w-7 border-2 border-white">
              <AvatarImage src={participant.avatar} alt={participant.name} />
              <AvatarFallback>{participant.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          {schedule.participants.length > 3 && (
            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
              +{schedule.participants.length - 3}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-6">
          {/* 页面标题 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">日程安排</h1>
              <p className="text-gray-600 dark:text-gray-400">管理您的会议、任务和提醒</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                新建日程
              </Button>
            </div>
          </div>

          {/* 工具栏 */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="搜索日程..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 分类过滤 */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? '全部分类' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 状态过滤 */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待确认</SelectItem>
                  <SelectItem value="confirmed">已确认</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 额外过滤选项 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-completed">显示已完成</Label>
                <Switch
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                />
              </div>

              {/* 视图切换 */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">视图:</span>
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'day' | 'week' | 'month')}>
                  <TabsList className="grid w-[220px] grid-cols-3">
                    <TabsTrigger value="day">日</TabsTrigger>
                    <TabsTrigger value="week">周</TabsTrigger>
                    <TabsTrigger value="month">月</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* 日历导航 */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <Button variant="ghost" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              if (currentView === 'day') {
                newDate.setDate(newDate.getDate() - 1);
              } else if (currentView === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setMonth(newDate.getMonth() - 1);
              }
              setSelectedDate(newDate);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">
              {currentView === 'day' ? format(selectedDate, 'yyyy年MM月dd日') :
               currentView === 'week' ? `第${format(selectedDate, 'w', { locale: zhCN })}周 (${format(new Date(selectedDate.getTime() - selectedDate.getDay() * 24 * 60 * 60 * 1000), 'MM月dd日')} - ${format(new Date(selectedDate.getTime() + (6 - selectedDate.getDay()) * 24 * 60 * 60 * 1000), 'MM月dd日')})` :
               format(selectedDate, 'yyyy年MM月')}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              if (currentView === 'day') {
                newDate.setDate(newDate.getDate() + 1);
              } else if (currentView === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setMonth(newDate.getMonth() + 1);
              }
              setSelectedDate(newDate);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 主内容区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              // 加载状态 - 骨架屏
              <div className="p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between">
                      <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="flex space-x-4">
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="flex space-x-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSchedules.length === 0 ? (
              // 空状态
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-1">暂无日程</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">当前没有符合条件的日程安排</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setShowCompleted(true);
                }}>
                  清除筛选条件
                </Button>
              </div>
            ) : (
              // 日程列表
              <div className="p-6 space-y-2">
                {filteredSchedules.map(renderScheduleItem)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加日程对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新建日程</DialogTitle>
            <DialogDescription>创建新的会议、任务或提醒</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">标题</Label>
              <Input
                id="title"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">描述</Label>
              <Textarea
                id="description"
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">开始时间</Label>
              <Input
                type="datetime-local"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">结束时间</Label>
              <Input
                type="datetime-local"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">分类</Label>
              <Select value={newSchedule.category} onValueChange={(value) => setNewSchedule({ ...newSchedule, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="会议">会议</SelectItem>
                  <SelectItem value="任务">任务</SelectItem>
                  <SelectItem value="提醒">提醒</SelectItem>
                  <SelectItem value="休假">休假</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">状态</Label>
              <Select value={newSchedule.status} onValueChange={(value) => setNewSchedule({ ...newSchedule, status: value as 'pending' | 'confirmed' | 'completed' | 'cancelled' })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待确认</SelectItem>
                  <SelectItem value="confirmed">已确认</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">地点</Label>
              <Input
                id="location"
                value={newSchedule.location}
                onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">全天</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  checked={newSchedule.isAllDay}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, isAllDay: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>取消</Button>
            <Button onClick={addSchedule}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑日程对话框 */}
      {currentSchedule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>编辑日程</DialogTitle>
              <DialogDescription>修改现有日程的详细信息</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">标题</Label>
                <Input
                  id="edit-title"
                  value={currentSchedule.title}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right mt-2">描述</Label>
                <Textarea
                  id="edit-description"
                  value={currentSchedule.description}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">开始时间</Label>
                <Input
                  type="datetime-local"
                  value={currentSchedule.startTime}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, startTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">结束时间</Label>
                <Input
                  type="datetime-local"
                  value={currentSchedule.endTime}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, endTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">分类</Label>
                <Select value={currentSchedule.category} onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="会议">会议</SelectItem>
                    <SelectItem value="任务">任务</SelectItem>
                    <SelectItem value="提醒">提醒</SelectItem>
                    <SelectItem value="休假">休假</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">状态</Label>
                <Select value={currentSchedule.status} onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, status: value as 'pending' | 'confirmed' | 'completed' | 'cancelled' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待确认</SelectItem>
                    <SelectItem value="confirmed">已确认</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">地点</Label>
                <Input
                  id="edit-location"
                  value={currentSchedule.location || ''}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">全天</Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    checked={currentSchedule.isAllDay}
                    onCheckedChange={(checked) => setCurrentSchedule({ ...currentSchedule, isAllDay: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
              <Button onClick={updateSchedule}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 日程详情对话框 */}
      {currentSchedule && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentSchedule.title}</DialogTitle>
              <DialogDescription>{currentSchedule.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(currentSchedule.category)}>{currentSchedule.category}</Badge>
                  {currentSchedule.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
                <Badge className={getStatusColor(currentSchedule.status)}>
                  {currentSchedule.status === 'pending' && '待确认'}
                  {currentSchedule.status === 'confirmed' && '已确认'}
                  {currentSchedule.status === 'completed' && '已完成'}
                  {currentSchedule.status === 'cancelled' && '已取消'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex gap-2 items-center">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">时间</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentSchedule.isAllDay ? '全天' : `${format(new Date(currentSchedule.startTime), 'yyyy年MM月dd日 HH:mm')} - ${format(new Date(currentSchedule.endTime), 'HH:mm')}`}
                    </div>
                  </div>
                </div>
                
                {currentSchedule.location && (
                  <div className="flex gap-2 items-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">地点</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{currentSchedule.location}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 items-start">
                  <Users className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="font-medium">参与者</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentSchedule.participants.map(participant => (
                        <div key={participant.id} className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDetailDialogOpen(false)}>关闭</Button>
              <Button onClick={() => {
                setIsDetailDialogOpen(false);
                openEditDialog(currentSchedule);
              }}>编辑</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SchedulePage;