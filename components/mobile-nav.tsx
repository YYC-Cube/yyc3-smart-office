'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// Logo组件已移除，后续会使用替代方案

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="h-10 w-20"></div> {/* 临时占位，替换已移除的Logo组件 */}
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">关闭菜单</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-auto py-4">{/* 这里可以添加移动导航菜单项 */}</nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
