'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

type ForgotPasswordFormProps = {
  onSuccess: () => void;
  csrfToken: string;
};

// 忘记密码表单验证
const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的电子邮件地址'),
  csrfToken: z.string(),
});

// 验证码验证
const verificationCodeSchema = z.object({
  verificationCode: z.string().min(4, '验证码至少需要4个字符').max(8, '验证码不能超过8个字符'),
  csrfToken: z.string(),
});

// 重置密码验证
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(100, '密码不能超过100个字符')
      .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
      .regex(/[a-z]/, '密码必须包含至少一个小写字母')
      .regex(/[0-9]/, '密码必须包含至少一个数字')
      .regex(/[^A-Za-z0-9]/, '密码必须包含至少一个特殊字符'),
    confirmPassword: z.string(),
    csrfToken: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword'],
  });

export default function ForgotPasswordForm({ onSuccess, csrfToken }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 验证输入 - 步骤1
  const validateStep1 = () => {
    try {
      forgotPasswordSchema.parse({
        email,
        csrfToken,
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        (error as { errors: Array<{ path: string[]; message: string }> }).errors.forEach((err) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  // 验证输入 - 步骤2
  const validateStep2 = () => {
    try {
      verificationCodeSchema.parse({
        verificationCode,
        csrfToken,
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        (error as { errors: Array<{ path: string[]; message: string }> }).errors.forEach((err) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  // 验证输入 - 步骤3
  const validateStep3 = () => {
    try {
      resetPasswordSchema.parse({
        newPassword,
        confirmPassword,
        csrfToken,
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        (error as { errors: Array<{ path: string[]; message: string }> }).errors.forEach((err) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 根据当前步骤验证输入
    let isValid = false;
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      if (step === 1) {
        // 发送重置密码邮件
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStep(2);
      } else if (step === 2) {
        // 验证验证码
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStep(3);
      } else if (step === 3) {
        // 重置密码
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onSuccess();
      }
    } catch {
      setError('操作失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入您的注册邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
          <p className="text-sm text-gray-500">我们将向您的邮箱发送重置密码的验证码</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="verificationCode">验证码</Label>
          <Input
            id="verificationCode"
            placeholder="请输入验证码"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className={validationErrors.verificationCode ? 'border-red-500' : ''}
          />
          {validationErrors.verificationCode && (
            <p className="text-sm text-red-500">{validationErrors.verificationCode}</p>
          )}
          <p className="text-sm text-gray-500">验证码已发送至您的邮箱，请查收</p>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={validationErrors.newPassword ? 'border-red-500' : ''}
            />
            {validationErrors.newPassword && (
              <p className="text-sm text-red-500">{validationErrors.newPassword}</p>
            )}
            <p className="text-xs text-gray-500">密码必须包含大小写字母、数字和特殊字符</p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={validationErrors.confirmPassword ? 'border-red-500' : ''}
            />
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? '处理中...' : step === 1 ? '发送验证码' : step === 2 ? '验证' : '重置密码'}
      </Button>
    </form>
  );
}
