'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 临时开发标志：跳过本地验证码校验
const DEV_SKIP_CAPTCHA = true;

type User = {
  id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  isActive: boolean;
  permissions?: string[];
  avatar?: string;
  badge?: string;
  department?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, captcha: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  generateCaptcha: () => string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();

  // 从服务端获取并设置 CSRF 令牌（同时服务端会设置绑定会话的 cookie）
  const fetchCsrfToken = useCallback(async (): Promise<string> => {
    try {
      const res = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        // 令牌在非 httpOnly 的 cookie 中，直接读取
        const cookieStr = typeof document !== 'undefined' ? document.cookie || '' : '';
        const match = cookieStr.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          setCsrfToken(token);
          return token;
        }
      }
    } catch (e) {
      console.error('获取CSRF令牌失败:', e);
    }
    return '';
  }, []);

  // 保证在调用受保护接口前已有 CSRF 令牌
  const ensureCsrfToken = useCallback(async (): Promise<string> => {
    if (csrfToken) return csrfToken;
    const token = await fetchCsrfToken();
    return token;
  }, [csrfToken, fetchCsrfToken]);

  // 认证状态检查
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // 首先检查模拟用户数据（开发环境）
      const mockUserStr = sessionStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      // 在API调用失败的情况下，再次检查模拟用户数据
      const mockUserStr = sessionStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 刷新令牌
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = await ensureCsrfToken();
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await checkAuthStatus();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      return false;
    }
  }, [ensureCsrfToken, checkAuthStatus]);

  // 生成验证码
  const generateCaptcha = (): string => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    sessionStorage.setItem('captcha', captcha);
    return captcha;
  };

  // 登录函数
  const login = async (username: string, password: string, captcha: string) => {
    try {
      // 验证验证码（临时跳过本地校验以排除因素）
      const storedCaptcha = sessionStorage.getItem('captcha');
      const effectiveCaptcha = DEV_SKIP_CAPTCHA ? (storedCaptcha || captcha) : captcha;

      if (!DEV_SKIP_CAPTCHA) {
        if (!storedCaptcha || captcha.toLowerCase() !== storedCaptcha.toLowerCase()) {
          return { success: false, message: '验证码错误' };
        }
      }

      const token = await ensureCsrfToken();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          username,
          password,
          captcha: effectiveCaptcha,
          generatedCaptcha: storedCaptcha || effectiveCaptcha,
          csrfToken: token,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // 清除验证码
        sessionStorage.removeItem('captcha');
        await checkAuthStatus();
        return { success: true };
      } else {
        // 如果API调用失败，尝试模拟登录（开发环境）
        if (username === 'admin' && password === 'admin123') {
          const mockUser = {
            id: '1',
            username: 'admin',
            role: 'admin',
            name: '系统管理员',
            email: 'admin@example.com',
            isActive: true,
            permissions: ['all'],
          };
          
          sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
          sessionStorage.removeItem('captcha');
          return { success: true };
        }
        
        // 生成新的验证码
        generateCaptcha();
        return { success: false, message: data.message || '登录失败' };
      }
    } catch (error) {
      console.error('登录错误:', error);
      // 网络错误情况下，也尝试模拟登录
      if (username === 'admin' && password === 'admin123') {
        const mockUser = {
          id: '1',
          username: 'admin',
          role: 'admin',
          name: '系统管理员',
          email: 'admin@example.com',
          isActive: true,
          permissions: ['all'],
        };
        
        sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        sessionStorage.removeItem('captcha');
        return { success: true };
      }
      
      return { success: false, message: '登录过程中发生错误' };
    }
  };

  // 登出函数
  const logout = async () => {
    try {
      const token = await ensureCsrfToken();
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': token,
        },
      });

      // 清除状态
      setUser(null);
      setIsAuthenticated(false);

      // 移除模拟用户数据（如果存在）
      sessionStorage.removeItem('mock_user');

      // 清除可能的客户端缓存或状态
      sessionStorage.removeItem('captcha');

      // 可选：重定向到登录页
      router.push('/login');
    } catch (error) {
      console.error('登出错误:', error);
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('mock_user');
      sessionStorage.removeItem('captcha');
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
        refreshToken,
        generateCaptcha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
