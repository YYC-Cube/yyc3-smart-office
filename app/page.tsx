/**
 * @file 智能办公系统仪表盘页面
 * @description 提供完整的智能办公系统仪表盘界面，服务端组件入口
 * @module app/page
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React from 'react';
import Head from 'next/head';
import ClientDashboard from '@/components/client/ClientDashboard';

/**
 * 智能办公系统主页面组件
 * @description 作为服务端组件入口，负责渲染页面头部信息和客户端仪表盘组件
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>YYC智能办公系统</title>
        <meta name="description" content="企业智能办公管理系统，提供完整的办公自动化解决方案" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* 客户端仪表盘组件 - 包含所有交互逻辑 */}
      <ClientDashboard />
    </div>
  );
}
