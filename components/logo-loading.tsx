'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LogoLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSpinner?: boolean;
  message?: string;
  className?: string;
  darkMode?: boolean;
  fullScreen?: boolean;
}

export function LogoLoading({
  size = 'md',
  showText = true,
  showSpinner = true,
  message = '加载中...',
  className,
  darkMode = false,
  fullScreen = false,
}: LogoLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible] = useState(true);

  // 模拟加载进度
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isVisible) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 10;
          return next > 100 ? 100 : next;
        });
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisible]);

  // 尺寸映射
  const sizeMap = {
    sm: { width: 80, height: 50, textSize: 'text-sm', spinnerSize: 16 },
    md: { width: 120, height: 80, textSize: 'text-base', spinnerSize: 20 },
    lg: { width: 160, height: 100, textSize: 'text-lg', spinnerSize: 24 },
    xl: { width: 200, height: 120, textSize: 'text-xl', spinnerSize: 28 },
  };

  const { width, height, textSize, spinnerSize } = sizeMap[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen && 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className="relative">
        <div className="logo-pulse overflow-hidden rounded-lg">
          <Image
            src="/logo.png"
            alt="智能办公系统"
            width={width}
            height={height}
            className="logo-appear"
            priority
          />
        </div>

        {/* 光晕效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-logo-shine"></div>
      </div>

      {showText && (
        <div className="mt-4 text-center">
          <p className={cn('font-medium', textSize, darkMode ? 'text-slate-800' : 'text-white')}>
            {message}
          </p>

          {/* 进度条 */}
          <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className={cn(
                'h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-in-out animate-progress-bar',
                progress < 2 && 'w-0',
                progress >= 2 && progress < 8 && 'w-1/24',
                progress >= 8 && progress < 16 && 'w-1/12',
                progress >= 16 && progress < 24 && 'w-1/8',
                progress >= 24 && progress < 32 && 'w-1/6',
                progress >= 32 && progress < 40 && 'w-1/5',
                progress >= 40 && progress < 48 && 'w-1/4',
                progress >= 48 && progress < 56 && 'w-1/3',
                progress >= 56 && progress < 64 && 'w-2/5',
                progress >= 64 && progress < 72 && 'w-1/2',
                progress >= 72 && progress < 80 && 'w-3/5',
                progress >= 80 && progress < 88 && 'w-2/3',
                progress >= 88 && progress < 94 && 'w-5/6',
                progress >= 94 && progress < 98 && 'w-11/12',
                progress >= 98 && 'w-full',
              )}
            ></div>
          </div>
        </div>
      )}

      {showSpinner && (
        <Loader2
          className={cn('animate-spin mt-4', darkMode ? 'text-slate-800' : 'text-white')}
          size={spinnerSize}
        />
      )}
    </div>
  );
}

// 添加动画样式
const styles = `
@keyframes logo-shine {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-logo-shine {
  animation: logo-shine 2s infinite;
}
`;

// 将样式添加到文档中
if (typeof document !== 'undefined') {
  // 检查是否已经添加了样式
  if (!document.getElementById('logo-loading-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'logo-loading-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
