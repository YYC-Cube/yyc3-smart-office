import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import type React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s - 智能办公',
    default: '首页 - 智能办公',
  },
  description: '高效管理办公事务的智能系统',
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico'
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <AuthProvider>
          <div className="min-h-screen">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
