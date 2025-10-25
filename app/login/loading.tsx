import { LogoLoading } from '@/components/logo-loading';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg">
      <LogoLoading size="lg" message="正在加载登录页面..." />
    </div>
  );
}
