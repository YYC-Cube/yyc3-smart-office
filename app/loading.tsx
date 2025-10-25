import { LogoLoading } from '@/components/logo-loading';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg">
      <LogoLoading size="lg" fullScreen={true} />
    </div>
  );
}
