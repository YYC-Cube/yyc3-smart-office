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
import { Gift, DollarSign, Send } from 'lucide-react';

type Interaction = {
  id: number;
  type: 'gift' | 'redPacket' | 'transfer';
  from: string;
  to: string;
  amount: number;
  date: string;
};

const initialInteractions: Interaction[] = [
  {
    id: 1,
    type: 'gift',
    from: '张三',
    to: '李四',
    amount: 50,
    date: '2023-06-10',
  },
  {
    id: 2,
    type: 'redPacket',
    from: '王五',
    to: '全体成员',
    amount: 200,
    date: '2023-06-11',
  },
  {
    id: 3,
    type: 'transfer',
    from: '赵六',
    to: '钱七',
    amount: 100,
    date: '2023-06-12',
  },
];

export function GroupInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);
  const [newInteraction, setNewInteraction] = useState({
    type: 'gift',
    from: '',
    to: '',
    amount: '',
  });

  const handleInteraction = () => {
    if (newInteraction.from && newInteraction.to && newInteraction.amount) {
      setInteractions([
        ...interactions,
        {
          id: interactions.length + 1,
          type: newInteraction.type as 'gift' | 'redPacket' | 'transfer',
          from: newInteraction.from,
          to: newInteraction.to,
          amount: Number(newInteraction.amount),
          date: new Date().toISOString().split('T')[0],
        },
      ]);
      setNewInteraction({ type: 'gift', from: '', to: '', amount: '' });
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">群内互动</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-3d">新互动</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新互动</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    类型
                  </Label>
                  <select
                    id="type"
                    className="col-span-3"
                    aria-label="互动类型"
                    value={newInteraction.type}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="gift">送礼物</option>
                    <option value="redPacket">发红包</option>
                    <option value="transfer">转账</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="from" className="text-right">
                    发送者
                  </Label>
                  <Input
                    id="from"
                    value={newInteraction.from}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        from: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">
                    接收者
                  </Label>
                  <Input
                    id="to"
                    value={newInteraction.to}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        to: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    金额
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInteraction.amount}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        amount: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleInteraction}>确认</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <Card key={interaction.id} className="bg-gray-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {interaction.type === 'gift' && <Gift className="mr-2" />}
                  {interaction.type === 'redPacket' && <DollarSign className="mr-2" />}
                  {interaction.type === 'transfer' && <Send className="mr-2" />}
                  <div>
                    <p className="font-semibold">
                      {interaction.from} → {interaction.to}
                    </p>
                    <p className="text-sm text-gray-500">{interaction.date}</p>
                  </div>
                </div>
                <p className="font-bold text-lg">{interaction.amount} 元</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
