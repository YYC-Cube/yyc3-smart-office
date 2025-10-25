/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 保留现有设置并补充域名白名单
    unoptimized: true,
    domains: ['assets.example.com', 'ui-avatars.com'],
  },
  // 统一输出模式，方便容器化/部署
  output: 'standalone',
  async headers() {
    // 合并 CORS（API 路由）与全站 CSP（含开发模式兼容）
    const isDev = process.env.NODE_ENV !== 'production';
    const csp = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' assets.example.com ui-avatars.com data:; connect-src 'self' ws:;"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' assets.example.com ui-avatars.com data:; connect-src 'self';";

    return [
      {
        // API 路由的 CORS 头
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: isDev ? '*' : 'https://your-production-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,X-CSRF-Token' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        // 全局 CSP 头
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;