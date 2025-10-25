'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type PaymentChannel = {
  id: number;
  name: string;
  type: 'wechat' | 'alipay';
  accountId: string;
  status: 'active' | 'inactive';
};

const initialChannels: PaymentChannel[] = [
  {
    id: 1,
    name: '公司微信',
    type: 'wechat',
    accountId: 'company_wechat_001',
    status: 'active',
  },
  {
    id: 2,
    name: '公司支付宝',
    type: 'alipay',
    accountId: 'company_alipay_001',
    status: 'active',
  },
];

export function PaymentChannels() {
  const [channels, setChannels] = useState<PaymentChannel[]>(initialChannels);
  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'wechat',
    accountId: '',
  });

  const handleAddChannel = () => {
    if (newChannel.name && newChannel.accountId) {
      setChannels([
        ...channels,
        {
          id: channels.length + 1,
          name: newChannel.name,
          type: newChannel.type as 'wechat' | 'alipay',
          accountId: newChannel.accountId,
          status: 'active',
        },
      ]);
      setNewChannel({ name: '', type: 'wechat', accountId: '' });
    }
  };

  const toggleChannelStatus = (id: number) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id
          ? {
              ...channel,
              status: channel.status === 'active' ? 'inactive' : 'active',
            }
          : channel,
      ),
    );
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">收款通道管理</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-3d">添加新通道</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新收款通道</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    名称
                  </Label>
                  <Input
                    id="name"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    类型
                  </Label>
                  <select
                    id="type"
                    className="col-span-3"
                    aria-label="通道类型"
                    value={newChannel.type}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        type: e.target.value as 'wechat' | 'alipay',
                      })
                    }
                  >
                    <option value="wechat">微信</option>
                    <option value="alipay">支付宝</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountId" className="text-right">
                    账户ID
                  </Label>
                  <Input
                    id="accountId"
                    value={newChannel.accountId}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        accountId: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddChannel}>添加通道</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>账户ID</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell>{channel.name}</TableCell>
                <TableCell>{channel.type === 'wechat' ? '微信' : '支付宝'}</TableCell>
                <TableCell>{channel.accountId}</TableCell>
                <TableCell>{channel.status === 'active' ? '活跃' : '停用'}</TableCell>
                <TableCell>
                  <Button onClick={() => toggleChannelStatus(channel.id)}>
                    {channel.status === 'active' ? '停用' : '激活'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
