"use client";

import React from 'react';
import {
  UserRole,
  ROLE_NAMES
} from '@/types/user';
import {
  groupPermissionsByCategory,
  getPermissionCategoryName,
  getRoleColor,
  getPermissionStatusIcon,
  getPermissionStatusColor
} from '@/utils/permissionUtils';
import {
  LightBulbIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface PermissionPreviewProps {
  role: UserRole;
  permissions: string[];
  className?: string;
}

// 권한별 세부 설명
const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'permission.assets.view': '자산 현황 및 거래 내역 조회',
  'permission.assets.view_transactions': '거래 내역 상세 조회',
  'permission.assets.create_transactions': '거래 신청 및 실행',
  'permission.users.view': '사용자 목록 조회',
  'permission.users.create': '사용자 추가',
  'permission.users.edit': '사용자 정보 수정',
  'permission.users.manage_permissions': '사용자 권한 관리',
  'permission.policies.view': '정책 조회',
  'permission.policies.create': '정책 생성',
  'permission.policies.edit': '정책 수정',
  'permission.system.view_audit': '감사 로그 확인',
  'permission.system.notifications': '알림 설정',
  'permission.system.security_settings': '보안 설정',
  'permission.system.admin': '시스템 전체 관리'
};


// 카테고리별 아이콘
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  assets: ChartBarIcon,
  users: UserIcon,
  policies: DocumentTextIcon,
  system: CogIcon
};

// 제한사항 정의
const ROLE_LIMITATIONS: Record<UserRole, string[]> = {
  admin: [], // 관리자는 제한사항 없음
  manager: [
    '고액 거래 정책 승인 불가',
    '시스템 보안 설정 변경 불가'
  ],
  operator: [
    '사용자 관리 불가',
    '정책 수정 불가',
    '고액 거래 승인 불가'
  ],
  viewer: [
    '데이터 수정 불가',
    '거래 신청 불가',
    '승인 권한 없음',
    '사용자 관리 불가'
  ]
};

export default function PermissionPreview({
  role,
  permissions,
  className = ''
}: PermissionPreviewProps) {
  const isAdmin = role === 'admin' || permissions.includes('permission.all');
  const groupedPermissions = groupPermissionsByCategory(permissions);
  const limitations = ROLE_LIMITATIONS[role];

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center mb-4">
        <LightBulbIcon className="w-6 h-6 text-gray-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">권한 미리보기</h3>
      </div>

      {/* 역할 정보 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)}`}>
            {ROLE_NAMES[role]}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {ROLE_NAMES[role]} 역할로 다음 기능을 사용할 수 있습니다:
        </p>
      </div>

      <div className="space-y-6">
        {/* 관리자 안내 메시지 */}
        {isAdmin && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-600 mr-2" />
              <p className="text-sm font-medium text-indigo-800">
                관리자는 아래 모든 권한을 자동으로 보유합니다
              </p>
            </div>
          </div>
        )}

        {/* 권한별 상세 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">보유 권한</h4>
          <div className="space-y-3">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
              const IconComponent = CATEGORY_ICONS[category] || CogIcon;
              const categoryName = getPermissionCategoryName(category);

              return (
                <div key={category} className={`border border-gray-200 rounded-lg p-3 ${
                  isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
                }`}>
                  <div className="flex items-center mb-2">
                    <IconComponent className={`w-4 h-4 mr-2 ${
                      isAdmin ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isAdmin ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {categoryName}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {categoryPermissions.map((permission) => (
                      <div key={permission} className="flex items-center text-xs">
                        <span className={`mr-2 ${
                          isAdmin ? 'text-indigo-600' : getPermissionStatusColor(true)
                        }`}>
                          {getPermissionStatusIcon(true)}
                        </span>
                        <span className={`${
                          isAdmin ? 'text-indigo-700' : 'text-gray-600'
                        }`}>
                          {PERMISSION_DESCRIPTIONS[permission] || permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 제한사항 (관리자가 아닌 경우만) */}
        {!isAdmin && limitations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">제한사항</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="space-y-1">
                {limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <span className="mr-2 text-gray-400">
                      {getPermissionStatusIcon(false)}
                    </span>
                    <span className="text-gray-600">{limitation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 요약 정보 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm">
          <div>
            <span className="text-gray-500">보유 권한:</span>
            <span className="ml-1 font-medium text-gray-900">
              {isAdmin ? '전체 시스템 권한' : `${Object.keys(groupedPermissions).length}개 카테고리`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}