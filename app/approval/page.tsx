'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
};

export default function ApprovalSystem() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: '1',
      type: '请假',
      title: '年假申请',
      content: '申请3天年假',
      status: 'pending',
      submittedBy: '张三',
      submittedAt: '2023-06-01',
    },
    {
      id: '2',
      type: '报销',
      title: '差旅费报销',
      content: '出差费用报销',
      status: 'approved',
      submittedBy: '李四',
      submittedAt: '2023-05-28',
    },
    {
      id: '3',
      type: '采购',
      title: '办公用品采购',
      content: '采购打印纸和墨盒',
      status: 'rejected',
      submittedBy: '王五',
      submittedAt: '2023-05-25',
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    type: '',
    title: '',
    content: '',
  });

  const addRequest = () => {
    if (newRequest.type && newRequest.title && newRequest.content) {
      const newApprovalRequest: ApprovalRequest = {
        id: String(requests.length + 1),
        ...newRequest,
        status: 'pending',
        submittedBy: '当前用户',
        submittedAt: new Date().toISOString().split('T')[0],
      };
      setRequests([...requests, newApprovalRequest]);
      setNewRequest({ type: '', title: '', content: '' });
    }
  };

  const updateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    setRequests(
      requests.map((request) => (request.id === id ? { ...request, status: newStatus } : request)),
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">OA审批系统</h1>

      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit">提交申请</TabsTrigger>
          <TabsTrigger value="pending">待审批</TabsTrigger>
          <TabsTrigger value="processed">已处理</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="space-y-4 mt-4">
            <Select
              value={newRequest.type}
              onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
            >
              <option value="">选择申请类型</option>
              <option value="请假">请假</option>
              <option value="报销">报销</option>
              <option value="采购">采购</option>
            </Select>
            <Input
              placeholder="申请标题"
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
            />
            <Textarea
              placeholder="申请内容"
              value={newRequest.content}
              onChange={(e) => setNewRequest({ ...newRequest, content: e.target.value })}
            />
            <Button onClick={addRequest}>提交申请</Button>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <ApprovalTable
            requests={requests.filter((r) => r.status === 'pending')}
            updateStatus={updateStatus}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="processed">
          <ApprovalTable
            requests={requests.filter((r) => r.status !== 'pending')}
            updateStatus={updateStatus}
            showActions={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApprovalTable({
  requests,
  updateStatus,
  showActions,
}: {
  requests: ApprovalRequest[];
  updateStatus: (id: string, status: 'approved' | 'rejected') => void;
  showActions: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>类型</TableHead>
          <TableHead>标题</TableHead>
          <TableHead>提交人</TableHead>
          <TableHead>提交时间</TableHead>
          <TableHead>状态</TableHead>
          {showActions && <TableHead>操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.type}</TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>{request.submittedBy}</TableCell>
            <TableCell>{request.submittedAt}</TableCell>
            <TableCell>{request.status}</TableCell>
            {showActions && (
              <TableCell>
                <Button onClick={() => updateStatus(request.id, 'approved')} className="mr-2">
                  批准
                </Button>
                <Button onClick={() => updateStatus(request.id, 'rejected')} variant="destructive">
                  拒绝
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
