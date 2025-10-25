'use client';

import { TabContainerExample } from '@/components/tab-container';

export default function TabContainerTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">标签页容器组件测试</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TabContainerExample />
      </div>
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">组件功能说明</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• 点击标签可切换选中状态</li>
          <li>• 点击关闭按钮可删除当前标签</li>
          <li>• 删除选中标签时会自动选中左侧相邻标签</li>
          <li>• 标签过多时支持横向滚动</li>
          <li>• 标签包含logo、标题和关闭按钮</li>
          <li>• 选中和未选中状态有明显的样式区分</li>
        </ul>
      </div>
    </div>
  );
}