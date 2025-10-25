'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGateProps {
  permissionCode: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export default function PermissionGate({
  permissionCode,
  children,
  fallback = null,
  loadingComponent = <Skeleton className="h-10 w-full" />,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermission(permissionCode);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  return <>{hasPermission ? children : fallback}</>;
}
