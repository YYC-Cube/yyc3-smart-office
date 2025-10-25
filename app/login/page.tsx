'use client';

import type React from 'react';
import Head from 'next/head';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import RegisterForm from '@/components/register-form';
import ForgotPasswordForm from '@/components/forgot-password-form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

// 临时开发标志：在登录前自动使用右侧验证码
const DEV_AUTO_FILL_CAPTCHA = true;

// Logo占位组件，替换已删除的Logo组件
function LogoPlaceholder() {
  return <div className="h-10 w-20 bg-blue-500/20 rounded-md"></div>; // 临时占位
}
import { loginSchema } from '@/lib/validations';
// 移除不存在的Logo组件导入

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading, generateCaptcha } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // 初始化时生成验证码（并在开发模式自动填充输入框）
  useEffect(() => {
    const code = generateCaptcha();
    setGeneratedCaptcha(code);
    if (DEV_AUTO_FILL_CAPTCHA) {
      setCaptcha(code);
    }
  }, [generateCaptcha]);

  // 如果已认证，重定向到首页或来源页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = searchParams.get('redirect') || '/';
      router.push(from);
    }
  }, [isAuthenticated, router, searchParams]);

  // 定义Zod错误的类型
  interface ZodError {
    path: string[];
    message: string;
  }

  interface ZodValidationError {
    errors: ZodError[];
  }

  // 验证输入
  const validateInputs = () => {
    try {
      loginSchema.parse({
        username,
        password,
        captcha,
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors: Record<string, string> = {};
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const field = String(issue.path[0] ?? 'form');
          errors[field] = issue.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证输入
    if (!validateInputs()) {
      return;
    }

    // 临时：自动将右侧验证码作为输入提交，排除验证码因素
    const effectiveCaptcha = DEV_AUTO_FILL_CAPTCHA ? generatedCaptcha : captcha;
    if (DEV_AUTO_FILL_CAPTCHA) {
      setCaptcha(effectiveCaptcha);
    }

    setIsLoading(true);

    try {
      const result = await login(username, password, effectiveCaptcha);

      if (result.success) {
        toast({ title: '登录成功', description: '欢迎回来！' });
        // 跳转由 isAuthenticated 监听处理，避免重复导航
      } else {
        setError(result.message || '登录失败');
        toast({ title: '登录失败', description: result.message || '用户名或密码错误', variant: 'destructive' });
        // 刷新验证码，并在开发模式自动填充
        const code = generateCaptcha();
        setGeneratedCaptcha(code);
        if (DEV_AUTO_FILL_CAPTCHA) setCaptcha(code);
      }
    } catch {
      setError('服务器错误，请稍后再试');
      toast({ title: '登录失败', description: '服务器错误，请稍后再试', variant: 'destructive' });
      const code = generateCaptcha();
      setGeneratedCaptcha(code);
      if (DEV_AUTO_FILL_CAPTCHA) setCaptcha(code);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen animated-gradient-bg">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to purple-600 flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">YYC</span>
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
            <p className="text-white mt-4 text-center">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden animated-gradient-bg">
      <Head>
        <title>登录 - 智能办公经管系统</title>
      </Head>
      {/* 内容区 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">YYC</span>
          </div>
          <h1 className="text-2xl font-bold text-white">智能办公经管系统</h1>
        </div>

        <Card className="w-full max-w-md glass-card animate-slide-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center gradient-text">用户登录</CardTitle>
            <CardDescription className="text-center">请输入您的账号和密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">用户名</Label>
                  <Input id="username" placeholder="请输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} className={`${validationErrors.username ? 'border-red-500' : ''} bg-white/50`} />
                  {validationErrors.username && <p className="text-sm text-red-500">{validationErrors.username}</p>}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} className={`${validationErrors.password ? 'border-red-500' : ''} bg-white/50`} />
                  {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="captcha">验证码</Label>
                  <div className="flex space-x-2">
                    <Input id="captcha" placeholder="请输入验证码" value={captcha} onChange={(e) => setCaptcha(e.target.value)} className={`${validationErrors.captcha ? 'border-red-500' : ''} bg-white/50`} />
                    {/* 展示右侧验证码（保持原逻辑） */}
                    <div className="flex items-center px-3 rounded-md bg-white/60 font-mono text-sm">{generatedCaptcha}</div>
                    <Button type="button" variant="outline" onClick={() => { const code = generateCaptcha(); setGeneratedCaptcha(code); if (DEV_AUTO_FILL_CAPTCHA) setCaptcha(code); }} className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />刷新
                    </Button>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>错误</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '登录'}
                </Button>
                <div className="flex justify-between mt-4 text-sm">
                  <Link href="#">忘记密码?</Link>
                  <Link href="#">注册新账号</Link>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
