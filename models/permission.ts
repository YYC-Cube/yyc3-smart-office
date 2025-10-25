// 权限类型
export interface Permission {
  id: string;
  name: string;
  description: string;
  code: string;
}

// 角色类型
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // 权限ID数组
}

// 预定义权限
export const PERMISSIONS: Permission[] = [
  {
    id: '1',
    name: '用户管理',
    description: '创建、查看、编辑和删除用户',
    code: 'user:manage',
  },
  {
    id: '2',
    name: '用户查看',
    description: '查看用户信息',
    code: 'user:read',
  },
  {
    id: '3',
    name: '角色管理',
    description: '创建、查看、编辑和删除角色',
    code: 'role:manage',
  },
  {
    id: '4',
    name: '角色查看',
    description: '查看角色信息',
    code: 'role:read',
  },
  {
    id: '5',
    name: '客户管理',
    description: '创建、查看、编辑和删除客户',
    code: 'customer:manage',
  },
  {
    id: '6',
    name: '客户查看',
    description: '查看客户信息',
    code: 'customer:read',
  },
  {
    id: '7',
    name: '任务管理',
    description: '创建、查看、编辑和删除任务',
    code: 'task:manage',
  },
  {
    id: '8',
    name: '任务查看',
    description: '查看任务信息',
    code: 'task:read',
  },
  {
    id: '9',
    name: '系统设置',
    description: '管理系统设置',
    code: 'system:manage',
  },
  {
    id: '10',
    name: '日志查看',
    description: '查看系统日志',
    code: 'log:read',
  },
];

// 预定义角色
export const ROLES: Role[] = [
  {
    id: '1',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: PERMISSIONS.map((p) => p.id),
  },
  {
    id: '2',
    name: '经理',
    description: '部门经理，拥有大部分管理权限',
    permissions: ['2', '4', '5', '6', '7', '8', '10'],
  },
  {
    id: '3',
    name: '员工',
    description: '普通员工，拥有基本操作权限',
    permissions: ['2', '6', '8'],
  },
];

// 根据角色ID获取角色
export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find((role) => role.id === roleId);
}

// 根据权限代码获取权限
export function getPermissionByCode(code: string): Permission | undefined {
  return PERMISSIONS.find((permission) => permission.code === code);
}

// 检查角色是否拥有指定权限
export function hasPermission(role: Role, permissionCode: string): boolean {
  const permission = getPermissionByCode(permissionCode);
  if (!permission) return false;
  return role.permissions.includes(permission.id);
}
