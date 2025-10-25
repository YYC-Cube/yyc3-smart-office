'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { registerSchema } from '@/lib/validations';

type RegisterFormProps = {
  onSuccess: () => void;
  csrfToken: string;
};

export default function RegisterForm({ onSuccess, csrfToken }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  // 验证输入
  const validateInputs = () => {
    try {
      registerSchema.parse({
        username,
        password,
        confirmPassword,
        email,
        name,
        csrfToken,
      });
      setValidationErrors({});
      return true;
    } catch (error: unknown) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        const typedError = error as { errors: Array<{ path: string[]; message: string }> };
        typedError.errors.forEach((err) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证输入
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // 这里应该是实际的注册逻辑
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟发送验证码
      setShowVerification(true);
    } catch {
      setError('注册失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 这里应该是实际的验证逻辑
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟注册成功
      onSuccess();
    } catch {
      setError('验证失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <form onSubmit={handleVerification} className="space-y-4">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="verificationCode">验证码</Label>
            <Input
              id="verificationCode"
              placeholder="请输入验证码"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <p className="text-sm text-gray-500">验证码已发送至您的邮箱，请查收</p>
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? '验证中...' : '验证'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={validationErrors.username ? 'border-red-500' : ''}
          />
          {validationErrors.username && (
            <p className="text-sm text-red-500">{validationErrors.username}</p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={validationErrors.password ? 'border-red-500' : ''}
          />
          {validationErrors.password && (
            <p className="text-sm text-red-500">{validationErrors.password}</p>
          )}
          <p className="text-xs text-gray-500">密码必须包含大小写字母、数字和特殊字符</p>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={validationErrors.confirmPassword ? 'border-red-500' : ''}
          />
          {validationErrors.confirmPassword && (
            <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            placeholder="请输入姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={validationErrors.name ? 'border-red-500' : ''}
          />
          {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? '注册中...' : '注册'}
      </Button>
    </form>
  );
}
