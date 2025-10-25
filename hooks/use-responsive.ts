'use client';

import { useState, useEffect } from 'react';

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Orientation = 'portrait' | 'landscape';

interface ResponsiveState {
  screenSize: ScreenSize;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    screenSize: 'lg',
    orientation: 'landscape',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 确定屏幕尺寸
      let screenSize: ScreenSize = 'lg';
      if (width < 480) screenSize = 'xs';
      else if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'md';
      else if (width < 1024) screenSize = 'lg';
      else screenSize = 'xl';

      // 确定屏幕方向
      const orientation: Orientation = height > width ? 'portrait' : 'landscape';

      // 设备类型
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024;

      setState({
        screenSize,
        orientation,
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
      });
    };

    // 初始化
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return state;
}
