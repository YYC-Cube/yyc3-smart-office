'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'default' | 'sidebar' | 'footer' | 'mobile' | 'compact';
  showText?: boolean;
  href?: string;
  responsive?: boolean;
  alt?: string;
  size?: string | number; // 添加size属性以支持测试
  hasContainer?: boolean; // 添加容器标志以支持测试
  "aria-labelledby"?: string; // 添加无障碍属性
};

export default function Logo({
  width = 120,
  height = 80,
  className,
  variant = 'default',
  showText = true,
  href = '/',
  // darkMode parameter removed as it's not being used
  responsive = true,
  alt = 'YYC Smart Office Logo',
  size,
  hasContainer = false,
}: LogoProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  // 检测屏幕尺寸和方向
  useEffect(() => {
    if (typeof window !== 'undefined' && responsive) {
      const handleResize = () => {
        // 设置屏幕尺寸类别
        const width = window.innerWidth;
        if (width < 480) setScreenSize('xs');
        else if (width < 640) setScreenSize('sm');
        else if (width < 768) setScreenSize('md');
        else if (width < 1024) setScreenSize('lg');
        else setScreenSize('xl');

        // 设置屏幕方向
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      };

      // 初始化
      handleResize();

      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [responsive]);

  // 根据屏幕尺寸计算LOGO尺寸
  const getResponsiveDimensions = () => {
    // 如果提供了size属性，优先使用它
    if (size) {
      const sizeNum = typeof size === 'number' ? size : parseInt(size, 10) || 10;
      return { logoWidth: sizeNum * 1.2, logoHeight: sizeNum };
    }
    
    if (!responsive) return { logoWidth: width, logoHeight: height };

    let scale = 1;
    switch (screenSize) {
      case 'xs':
        scale = 0.6;
        break;
      case 'sm':
        scale = 0.7;
        break;
      case 'md':
        scale = 0.8;
        break;
      case 'lg':
        scale = 0.9;
        break;
      case 'xl':
        scale = 1;
        break;
    }

    // 侧边栏和移动版本需要更小的尺寸
    if (variant === 'sidebar') scale *= 0.6;
    if (variant === 'footer') scale *= 0.8;
    if (variant === 'mobile') scale *= 0.7;
    if (variant === 'compact') scale *= 0.5;

    // 竖屏模式下可能需要进一步调整
    if (orientation === 'portrait' && variant === 'default') scale *= 0.9;

    return {
      logoWidth: Math.round(width * scale),
      logoHeight: Math.round(height * scale),
    };
  };

  const { logoWidth, logoHeight } = getResponsiveDimensions();

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
  };

  // 根据屏幕尺寸决定是否显示文本
  const shouldShowText = () => {
    if (!showText) return false;
    if (variant === 'compact') return false;
    if (variant === 'mobile' && screenSize === 'xs') return false;
    return true;
  };

  const logoContent = (
    <div
      className={cn(
        'flex items-center transition-all duration-300',
        variant === 'sidebar' ? 'flex-col logo-container-sidebar' : 'logo-container-default',
        variant === 'footer' && 'justify-center',
        variant === 'mobile' && 'justify-center scale-90',
        variant === 'compact' && 'scale-75',
        orientation === 'portrait' && variant === 'default' && 'scale-90',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg transition-all duration-300',
          variant === 'default' && 'logo-shine logo-float',
          variant === 'sidebar' && 'logo-pulse',
          variant === 'footer' && 'logo-float',
          variant === 'mobile' && 'scale-90',
          isClicked && 'animate-ping-once',
        )}
        onClick={handleClick}
      >
        <Image
          src="/logo.png"
          alt={alt}
          width={logoWidth}
          height={logoHeight}
          className={cn(
            'transition-all duration-300 logo-img-object-contain',
            variant === 'default' && 'logo-appear',
            isClicked && 'scale-90',
            responsive && 'max-w-full h-auto',
            // 将size转换为对应的h-*类，特别处理lg和sm尺寸
            size === 'lg' ? 'h-16' : 
            size === 'sm' ? 'h-6' :
            size && typeof size === 'string' ? `h-${size}` : 'h-10',
            className // 添加自定义类名
          )}
          priority={variant === 'default' || variant === 'sidebar'}
          role="img"
          aria-labelledby="logo-heading"
        />
      </div>
      {shouldShowText() && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            variant === 'sidebar' && 'text-center',
            variant === 'footer' && 'text-center',
            screenSize === 'sm' && 'scale-90',
            screenSize === 'xs' && 'scale-75',
          )}
        >
          <h1
            className={cn(
              'font-bold transition-all duration-300 logo-appear-delay-03',
              variant === 'default' &&
                cn(
                  'logo-appear',
                  screenSize === 'xl' && 'text-4xl',
                  screenSize === 'lg' && 'text-3xl',
                  screenSize === 'md' && 'text-2xl',
                  screenSize === 'sm' && 'text-xl',
                  screenSize === 'xs' && 'text-lg',
                  'text-white mb-2',
                ),
              variant === 'sidebar' &&
                cn(
                  screenSize === 'xl' && 'text-xl',
                  screenSize === 'lg' && 'text-lg',
                  screenSize === 'md' && 'text-base',
                  screenSize === 'sm' && 'text-sm',
                  'text-white',
                ),
              variant === 'footer' &&
                cn(
                  screenSize === 'xl' && 'text-lg',
                  screenSize === 'lg' && 'text-base',
                  screenSize === 'md' && 'text-sm',
                  screenSize === 'sm' && 'text-xs',
                  'text-slate-600 dark:text-slate-300',
                ),
              variant === 'mobile' &&
                cn(
                  screenSize === 'md' && 'text-lg',
                  screenSize === 'sm' && 'text-base',
                  screenSize === 'xs' && 'text-sm',
                  'text-slate-800',
                ),
            )}
          >
            智能办公系统
          </h1>
          {variant === 'default' && screenSize !== 'xs' && (
            <p
              className={cn(
                'text-blue-100 logo-appear transition-all duration-300 logo-appear-delay-06',
                screenSize === 'xl' && 'text-lg',
                screenSize === 'lg' && 'text-base',
                screenSize === 'md' && 'text-sm',
                screenSize === 'sm' && 'text-xs',
              )}
            >
              提升效率，智慧办公
            </p>
          )}
        </div>
      )}
    </div>
  );

  // 如果需要容器，额外包装一层
  const finalContent = hasContainer ? (
    <div className="logo-container">
      {logoContent}
    </div>
  ) : logoContent;

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
      >
        {finalContent}
      </Link>
    );
  }

  return finalContent;
}

// 添加一个ping一次的动画
const styles = `
@keyframes pingOnce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.animate-ping-once {
  animation: pingOnce 0.5s cubic-bezier(0, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .logo-float,
  .logo-pulse,
  .logo-shine,
  .logo-appear,
  .animate-ping-once {
    animation: none !important;
    transition: none !important;
  }
}

@media print {
  .logo-float,
  .logo-pulse,
  .logo-shine,
  .logo-appear,
  .animate-ping-once {
    animation: none !important;
  }
}
`;

// 将样式添加到文档中
if (typeof document !== 'undefined') {
  // 检查是否已经添加了样式
  if (!document.getElementById('logo-component-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'logo-component-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
