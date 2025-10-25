// 该文件用于验证 TypeScript 配置是否生效

import { BaseComponentProps, ApiResponse, User } from '@/types/common';

const testProps: BaseComponentProps = {
  className: 'test',
  children: 'Hello',
};

const testResponse: ApiResponse<User> = {
  success: true,
  data: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
};

console.log('TypeScript 配置正常！');
