export type UserRole = 'admin' | 'manager' | 'viewer' | 'approver' | 'initiator' | 'required_approver' | 'operator';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  permissions: string[];
  department?: string;
  position?: string;
}

export interface UserPermissions {
  'permission.all': boolean;
  'permission.view_assets': boolean;
  'permission.view_transactions': boolean;
  'permission.view_group_assets': boolean;
  'permission.create_expense': boolean;
  'permission.view_audit': boolean;
  'permission.approve_transactions': boolean;
  'permission.manage_users': boolean;
  'permission.create_transactions': boolean;
  'permission.approve_high_value': boolean;
  'permission.manage_policies': boolean;
  'permission.view_reports': boolean;
  'permission.system_admin': boolean;
}

// 역할별 기본 권한 매핑
export const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, string[]> = {
  admin: ['permission.all'],
  manager: [
    'permission.view_assets',
    'permission.approve_transactions',
    'permission.manage_users',
    'permission.view_reports',
    'permission.create_transactions'
  ],
  viewer: [
    'permission.view_assets',
    'permission.view_transactions',
    'permission.view_group_assets',
    'permission.create_expense',
    'permission.view_audit'
  ],
  approver: [
    'permission.view_assets',
    'permission.view_transactions',
    'permission.approve_transactions',
    'permission.approve_high_value',
    'permission.view_reports'
  ],
  initiator: [
    'permission.view_assets',
    'permission.view_transactions',
    'permission.create_transactions',
    'permission.create_expense'
  ],
  required_approver: [
    'permission.view_assets',
    'permission.view_transactions',
    'permission.approve_transactions',
    'permission.approve_high_value'
  ],
  operator: [
    'permission.view_assets',
    'permission.view_transactions',
    'permission.create_transactions',
    'permission.view_audit'
  ]
};

// 역할별 한국어 이름
export const ROLE_NAMES: Record<UserRole, string> = {
  admin: '관리자',
  manager: '매니저',
  viewer: '조회자',
  approver: '승인자',
  initiator: '신청자',
  required_approver: '필수 승인자',
  operator: '운영자'
};

// 상태별 한국어 이름
export const STATUS_NAMES: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기중'
};