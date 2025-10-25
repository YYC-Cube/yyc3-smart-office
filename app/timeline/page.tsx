'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

type TimelineItem = {
  id: number;
  content: string;
  date: string;
  time: string;
  completed: boolean;
  assignedTo: string;
};

const positions = ['员工', '直属管理', '门店副总'];

export default function Timeline() {
  const { toast } = useToast();
  const [items, setItems] = useState<TimelineItem[]>([
    {
      id: 1,
      content: '项目启动会议',
      date: '2023-06-01',
      time: '09:00',
      completed: true,
      assignedTo: '员工',
    },
    {
      id: 2,
      content: '需求分析阶段',
      date: '2023-06-15',
      time: '14:00',
      completed: true,
      assignedTo: '员工',
    },
    {
      id: 3,
      content: '设计阶段',
      date: '2023-07-01',
      time: '10:00',
      completed: false,
      assignedTo: '员工',
    },
    {
      id: 4,
      content: '开发阶段',
      date: '2023-07-15',
      time: '09:00',
      completed: false,
      assignedTo: '员工',
    },
    {
      id: 5,
      content: '测试阶段',
      date: '2023-08-01',
      time: '13:00',
      completed: false,
      assignedTo: '员工',
    },
  ]);

  const [newItem, setNewItem] = useState({
    content: '',
    date: '',
    time: '',
    assignedTo: '员工',
  });

  const updateItem = useCallback((id: number, field: string, value: string) => {
    setItems(prevItems => prevItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, []); // 不再依赖items，改为使用函数式更新

  const checkReminders = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      const data = await response.json();

      data.reminders?.forEach((reminder: { type: 'reminder' | 'escalation'; message: string; itemId?: number; newAssignee?: string }) => {
        toast({
          title: reminder.type === 'reminder' ? '提醒' : '升级提醒',
          description: reminder.message,
        });

        if (reminder.type === 'escalation' && reminder.itemId !== undefined) {
          updateItem(reminder.itemId, 'assignedTo', reminder.newAssignee || '');
        }
      });
    } catch (error) {
      console.error('检查提醒失败:', error);
    }
  }, [items, toast, updateItem]);

  useEffect(() => {
    const timer = setInterval(() => {
      checkReminders();
    }, 60000); // 每分钟检查一次

    return () => clearInterval(timer);
  }, [checkReminders]);

  const addItem = () => {
    if (newItem.content && newItem.date && newItem.time) {
      setItems([...items, { id: items.length + 1, ...newItem, completed: false }]);
      setNewItem({ content: '', date: '', time: '', assignedTo: '员工' });
    }
  };

  const toggleComplete = (id: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  };



  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">时间节点工作跟踪</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-in">
        <Input
          placeholder="工作内容"
          value={newItem.content}
          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
        />
        <Input
          type="date"
          value={newItem.date}
          onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
        />
        <Input
          type="time"
          value={newItem.time}
          onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
        />
        <Select
          value={newItem.assignedTo}
          onValueChange={(value) => setNewItem({ ...newItem, assignedTo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择负责人" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addItem} className="btn-3d">
          添加节点
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>完成状态</TableHead>
            <TableHead>工作内容</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>时间</TableHead>
            <TableHead>负责人</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleComplete(item.id)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.content}
                  onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={item.date}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, 'time', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.assignedTo}
                  onValueChange={(value) => updateItem(item.id, 'assignedTo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
