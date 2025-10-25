'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type TabItem = {
  id: string;
  title: string;
  logo: React.ReactNode;
};

interface TabContainerProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function TabContainer({ tabs, activeTabId, onTabClick, onTabClose }: TabContainerProps) {
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const scrollToActiveTab = React.useCallback(() => {
    if (!tabsContainerRef.current) return;
    
    const activeTab = tabsContainerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`
    ) as HTMLElement;
    
    if (activeTab) {
      const container = tabsContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      
      // 检查是否需要滚动
      if (tabRect.left < containerRect.left) {
        // 向左滚动
        container.scrollTo({
          left: container.scrollLeft + tabRect.left - containerRect.left,
          behavior: 'smooth'
        });
      } else if (tabRect.right > containerRect.right) {
        // 向右滚动
        container.scrollTo({
          left: container.scrollLeft + tabRect.right - containerRect.right,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTabId]);

  React.useEffect(() => {
    scrollToActiveTab();
  }, [scrollToActiveTab]);

  return (
    <div className="w-full h-[50px] border-b border-gray-200 bg-white">
      <div
        ref={tabsContainerRef}
        className="flex items-center h-full overflow-x-auto scrollbar-hide whitespace-nowrap"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={cn(
              'flex items-center h-[36px] px-[12px] py-[8px] rounded-[4px] cursor-pointer transition-all duration-200 mr-[8px] flex-shrink-0',
              activeTabId === tab.id
                ? 'bg-white text-[#333] border border-[#eee] border-b-2 border-[#2c83f2]'
                : 'bg-[#f5f5f5] text-[#666] border border-[#eee] hover:bg-[#eaeaea]'
            )}
            onClick={() => onTabClick(tab.id)}
          >
            <div className="w-[20px] h-[20px] mr-[8px] flex items-center justify-center">
              {tab.logo}
            </div>
            <span className="text-[14px] font-medium">{tab.title}</span>
            <button
              className="w-[16px] h-[16px] ml-[12px] flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={(e) => handleTabClose(e, tab.id)}
              aria-label={`关闭 ${tab.title}`}
            >
              <X className="w-[12px] h-[12px] text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 示例使用组件
export function TabContainerExample() {
  const [tabs, setTabs] = React.useState<TabItem[]>([
    {
      id: 'tab1',
      title: '设备管理',
      logo: <div className="w-full h-full bg-blue-500 rounded"></div>,
    },
    {
      id: 'tab2',
      title: '用户设置',
      logo: <div className="w-full h-full bg-green-500 rounded"></div>,
    },
    {
      id: 'tab3',
      title: '系统监控',
      logo: <div className="w-full h-full bg-purple-500 rounded"></div>,
    },
  ]);
  
  const [activeTabId, setActiveTabId] = React.useState('tab1');

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    
    // 如果关闭的是当前活动标签
    if (tabId === activeTabId) {
      // 找到关闭标签的左侧相邻标签
      const closedTabIndex = tabs.findIndex((tab) => tab.id === tabId);
      const leftAdjacentIndex = Math.max(0, closedTabIndex - 1);
      
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[leftAdjacentIndex].id);
      }
    }
  };

  return (
    <div className="w-full">
      <TabContainer
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
      />
      <div className="p-6 bg-gray-50">
        <h2>标签内容展示区域</h2>
        <p>当前选中标签: {tabs.find(t => t.id === activeTabId)?.title}</p>
      </div>
    </div>
  );
}