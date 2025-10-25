import { NextRequest, NextResponse } from 'next/server';
import { defaultResilienceMiddleware } from '@/middleware/resilience-middleware';

// 测试API处理函数
async function testHandler() {
  try {
    // 模拟一些业务逻辑
    const random = Math.random();
    
    // 模拟随机失败，用于测试断路器
    if (random < 0.3) {
      throw new Error('随机业务逻辑失败');
    }
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return NextResponse.json({
      success: true,
      message: '测试API成功响应',
      timestamp: new Date().toISOString(),
      random: random.toFixed(2)
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : '内部服务器错误') },
      { status: 500 }
    );
  }
}

// 导出GET处理函数，应用resilience中间件
export const GET = async (request: NextRequest) => {
  return defaultResilienceMiddleware(request, testHandler);
};