'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { customerSchema } from '@/lib/validations';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useApiClient } from '@/lib/api-client';
import { useCsrf } from '@/hooks/use-csrf';

interface CustomerData {
  id?: string;
  name?: string;
  phone?: string;
  memberNo?: string;
  date?: string;
  notes?: string;
  lastContact?: string;
  nextContact?: string;
}

interface CustomerFormProps {
  onSuccess: () => void;
  initialData?: CustomerData;
}

export default function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const { csrfToken } = useCsrf();
  const api = useApiClient();
  const { validate, getFieldError } = useFormValidation(customerSchema);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    memberNo: initialData?.memberNo || '',
    date: initialData?.date || '',
    notes: initialData?.notes || '',
    lastContact: initialData?.lastContact || '',
    nextContact: initialData?.nextContact || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 添加CSRF令牌
    const dataWithCsrf = { ...formData, csrfToken };

    // 验证表单数据
    if (!validate(dataWithCsrf)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (initialData) {
        // 更新现有客户
        await api.put(`/api/customers/${initialData.id}`, dataWithCsrf);
      } else {
        // 创建新客户
        await api.post('/api/customers', dataWithCsrf);
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message || '保存客户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">姓名 *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={getFieldError('name') ? 'border-red-500' : ''}
          />
          {getFieldError('name') && <p className="text-sm text-red-500">{getFieldError('name')}</p>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="phone">电话 *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={getFieldError('phone') ? 'border-red-500' : ''}
          />
          {getFieldError('phone') && (
            <p className="text-sm text-red-500">{getFieldError('phone')}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="memberNo">会员编号 *</Label>
          <Input
            id="memberNo"
            name="memberNo"
            value={formData.memberNo}
            onChange={handleChange}
            className={getFieldError('memberNo') ? 'border-red-500' : ''}
          />
          {getFieldError('memberNo') && (
            <p className="text-sm text-red-500">{getFieldError('memberNo')}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className={getFieldError('date') ? 'border-red-500' : ''}
          />
          {getFieldError('date') && <p className="text-sm text-red-500">{getFieldError('date')}</p>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="lastContact">上次联系</Label>
          <Input
            id="lastContact"
            name="lastContact"
            type="date"
            value={formData.lastContact}
            onChange={handleChange}
            className={getFieldError('lastContact') ? 'border-red-500' : ''}
          />
          {getFieldError('lastContact') && (
            <p className="text-sm text-red-500">{getFieldError('lastContact')}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="nextContact">下次联系</Label>
          <Input
            id="nextContact"
            name="nextContact"
            type="date"
            value={formData.nextContact}
            onChange={handleChange}
            className={getFieldError('nextContact') ? 'border-red-500' : ''}
          />
          {getFieldError('nextContact') && (
            <p className="text-sm text-red-500">{getFieldError('nextContact')}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="notes">备注</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className={getFieldError('notes') ? 'border-red-500' : ''}
          />
          {getFieldError('notes') && (
            <p className="text-sm text-red-500">{getFieldError('notes')}</p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full mt-4" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? '保存中...' : initialData ? '更新客户' : '添加客户'}
      </Button>
    </form>
  );
}
