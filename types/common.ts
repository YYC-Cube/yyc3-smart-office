// types/common.ts
import { ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Toast {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export {};
