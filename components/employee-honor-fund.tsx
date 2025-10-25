'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

type HonorFund = {
  id: number;
  employeeName: string;
  balance: number;
  lastContribution: number;
  lastContributionDate: string;
};

const initialFunds: HonorFund[] = [
  {
    id: 1,
    employeeName: '张三',
    balance: 5000,
    lastContribution: 500,
    lastContributionDate: '2023-06-01',
  },
  {
    id: 2,
    employeeName: '李四',
    balance: 3500,
    lastContribution: 300,
    lastContributionDate: '2023-06-05',
  },
  {
    id: 3,
    employeeName: '王五',
    balance: 6000,
    lastContribution: 600,
    lastContributionDate: '2023-06-03',
  },
];

export function EmployeeHonorFund() {
  const [funds, setFunds] = useState<HonorFund[]>(initialFunds);
  const [newContribution, setNewContribution] = useState({
    employeeId: 0,
    amount: '',
  });

  const handleContribution = () => {
    if (newContribution.employeeId && newContribution.amount) {
      setFunds(
        funds.map((fund) =>
          fund.id === newContribution.employeeId
            ? {
                ...fund,
                balance: fund.balance + Number(newContribution.amount),
                lastContribution: Number(newContribution.amount),
                lastContributionDate: new Date().toISOString().split('T')[0],
              }
            : fund,
        ),
      );
      setNewContribution({ employeeId: 0, amount: '' });
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">员工荣誉基金账户</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-3d">添加贡献</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新的贡献</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    员工
                  </Label>
                  <select
                    id="employee"
                    className="col-span-3"
                    aria-label="选择员工"
                    value={newContribution.employeeId}
                    onChange={(e) =>
                      setNewContribution({
                        ...newContribution,
                        employeeId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>选择员工</option>
                    {funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    金额
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newContribution.amount}
                    onChange={(e) =>
                      setNewContribution({
                        ...newContribution,
                        amount: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleContribution}>确认贡献</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>员工姓名</TableHead>
              <TableHead>当前余额</TableHead>
              <TableHead>最近贡献</TableHead>
              <TableHead>最近贡献日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((fund) => (
              <TableRow key={fund.id}>
                <TableCell>{fund.employeeName}</TableCell>
                <TableCell>{fund.balance}</TableCell>
                <TableCell>{fund.lastContribution}</TableCell>
                <TableCell>{fund.lastContributionDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
