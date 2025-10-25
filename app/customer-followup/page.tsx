'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  memberNo: string;
  date: string;
  notes: string;
  lastContact: string;
  nextContact: string;
};

export default function CustomerFollowup() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      memberNo: 'M001',
      date: '2023-06-01',
      notes: 'VIP客户',
      lastContact: '2023-05-15',
      nextContact: '2023-06-15',
    },
    {
      id: 2,
      name: '李四',
      phone: '13900139000',
      memberNo: 'M002',
      date: '2023-06-02',
      notes: '新客户',
      lastContact: '2023-05-20',
      nextContact: '2023-06-20',
    },
  ]);

  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    memberNo: '',
    date: '',
    notes: '',
    lastContact: '',
    nextContact: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateCustomer = () => {
    if (!newCustomer.phone || !newCustomer.memberNo) {
      alert('电话和会员NO是必填项');
      return;
    }

    if (isEditing && editingId !== null) {
      setCustomers(
        customers.map((customer) =>
          customer.id === editingId ? { ...newCustomer, id: editingId } : customer,
        ),
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      setCustomers([...customers, { ...newCustomer, id: customers.length + 1 }]);
    }
    setNewCustomer({
      name: '',
      phone: '',
      memberNo: '',
      date: '',
      notes: '',
      lastContact: '',
      nextContact: '',
    });
  };

  const editCustomer = (id: number) => {
    const customerToEdit = customers.find((customer) => customer.id === id);
    if (customerToEdit) {
      setNewCustomer(customerToEdit);
      setIsEditing(true);
      setEditingId(id);
    }
  };

  const deleteCustomer = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">客户回访管理</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-in">
        <div>
          <Label htmlFor="name">姓名</Label>
          <Input id="name" name="name" value={newCustomer.name} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="phone">电话 *</Label>
          <Input
            id="phone"
            name="phone"
            value={newCustomer.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="memberNo">会员NO *</Label>
          <Input
            id="memberNo"
            name="memberNo"
            value={newCustomer.memberNo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={newCustomer.date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="lastContact">上次联系</Label>
          <Input
            id="lastContact"
            name="lastContact"
            type="date"
            value={newCustomer.lastContact}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="nextContact">下次联系</Label>
          <Input
            id="nextContact"
            name="nextContact"
            type="date"
            value={newCustomer.nextContact}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-span-full">
          <Label htmlFor="notes">备注</Label>
          <Textarea
            id="notes"
            name="notes"
            value={newCustomer.notes}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-span-full">
          <Button onClick={addOrUpdateCustomer} className="btn-3d">
            {isEditing ? '更新客户' : '添加客户'}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>电话</TableHead>
            <TableHead>会员NO</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>上次联系</TableHead>
            <TableHead>下次联系</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.memberNo}</TableCell>
              <TableCell>{customer.date}</TableCell>
              <TableCell>{customer.lastContact}</TableCell>
              <TableCell>{customer.nextContact}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => editCustomer(customer.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteCustomer(customer.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
