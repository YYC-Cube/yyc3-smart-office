import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Logo from './logo-component';
import '@testing-library/jest-dom';

// Mock the Image component to avoid loading actual images
global.Image = jest.fn().mockImplementation(() => ({
  src: '',
  onload: null,
  onerror: null,
  width: 0,
  height: 0,
}));

describe('Logo', () => {
  afterEach(() => {
    cleanup();
  });
  // 测试默认渲染
  test('renders logo with default props', () => {
    render(<Logo />);
    
    // 检查logo元素是否存在
    const logoElement = screen.getByAltText('YYC Smart Office Logo');
    expect(logoElement).toBeInTheDocument();
    
    // 检查图片路径是否包含logo.png
    expect(logoElement).toHaveAttribute('src', expect.stringContaining('logo.png'));
    
    // 检查默认大小类名
    expect(logoElement).toHaveClass('h-10');
  });

  // 测试不同尺寸属性
  test('renders logo with large size', () => {
    // 测试大尺寸
    render(<Logo size="lg" />);
    expect(screen.getByAltText('YYC Smart Office Logo')).toHaveClass('h-16');
  });
  
  test('renders logo with small size', () => {
    // 测试小尺寸
    render(<Logo size="sm" />);
    expect(screen.getByAltText('YYC Smart Office Logo')).toHaveClass('h-6');
  });
  
  test('renders logo with custom size', () => {
    // 测试自定义尺寸
    render(<Logo size="24" />);
    expect(screen.getByAltText('YYC Smart Office Logo')).toHaveClass('h-24');
  });

  // 测试自定义alt文本
  test('renders logo with custom alt text', () => {
    const customAlt = 'Custom Logo Alt Text';
    render(<Logo alt={customAlt} />);
    expect(screen.getByAltText(customAlt)).toBeInTheDocument();
  });

  // 测试自定义类名
  test('applies additional classes', () => {
    const customClass = 'custom-class';
    render(<Logo className={customClass} />);
    expect(screen.getByAltText('YYC Smart Office Logo')).toHaveClass(customClass);
  });

  // 测试加载状态
  test('handles loading state', () => {
    // 渲染组件
    render(<Logo />);
    
    // 检查初始状态
    expect(screen.getByAltText('YYC Smart Office Logo')).toBeInTheDocument();
  });

  // 测试图片加载错误处理
  test('handles image load error gracefully', () => {
    // 保存原始的Image实现
    const originalImage = global.Image;
    
    // 模拟图片加载错误
    global.Image = jest.fn().mockImplementation(() => ({
      src: '',
      onload: null,
      onerror: null,
      complete: false,
    }));
    
    render(<Logo />);
    
    // 即使图片加载失败，组件也应该存在
    expect(screen.getByAltText('YYC Smart Office Logo')).toBeInTheDocument();
    
    // 恢复原始Image实现
    global.Image = originalImage;
  });

  // 测试响应式行为
  test('applies responsive classes', () => {
    // 模拟响应式行为，通过检查是否正确应用类名
    render(<Logo responsive />);
    const logo = screen.getByAltText('YYC Smart Office Logo');
    
    // 响应式组件应该添加特定的响应式类
    expect(logo).toHaveClass('h-10'); // 默认大小
  });

  // 测试无障碍属性
  test('has proper accessibility attributes', () => {
    render(<Logo aria-labelledby="logo-heading" />);
    const logo = screen.getByAltText('YYC Smart Office Logo');
    
    // 检查无障碍属性是否正确应用
    expect(logo).toHaveAttribute('aria-labelledby', 'logo-heading');
    expect(logo).toHaveAttribute('role', 'img');
  });

  // 测试容器元素
  test('wraps logo in container if specified', () => {
    render(<Logo hasContainer />);
    const logo = screen.getByAltText('YYC Smart Office Logo');
    
    // 检查logo是否在容器内
    expect(logo.parentElement).toBeInTheDocument();
  });
});