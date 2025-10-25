// components/ui/base-page.tsx
import { ReactNode } from 'react';

interface BasePageProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function BasePage({ title, children, className = '' }: BasePageProps) {
  return (
    <div className={`p-6 animate-fade-in ${className}`}>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  );
}
