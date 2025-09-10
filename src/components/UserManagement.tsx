'use client'

import { useState } from 'react'
import { 
  UsersIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserManagementProps {
  plan: ServicePlan
}

type UserRole = 'admin' | 'manager' | 'viewer' | 'approver' | 'initiator' | 'required_approver' | 'operator'
type UserStatus = 'active' | 'inactive' | 'pending'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  permissions: string[]
  department?: string
}

export default function UserManagement({ plan }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
    department: '',
    permissions: [] as string[]
  })
  const { t, language } = useLanguage()

  const mockUsers: User[] = [
    {
      id: '1',
      name: '김관리자',
      email: 'admin@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-03-15T10:30:00Z',
      permissions: ['permission.all'],
      department: 'IT팀'
    },
    {
      id: '2',
      name: '이매니저',
      email: 'manager@company.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-03-15T09:15:00Z',
      permissions: ['permission.view_assets', 'permission.approve_transactions', 'permission.manage_users'],
      department: '재무팀'
    },
    {
      id: '3',
      name: '박조회자',
      email: 'viewer@company.com',
      role: 'viewer',
      status: 'active',
      lastLogin: '2024-03-14T16:45:00Z',
      permissions: ['permission.view_assets', 'permission.view_transactions'],
      department: '회계팀'
    },
    {
      id: '4',
      name: '최승인자',
      email: 'approver@company.com',
      role: 'approver',
      status: 'pending',
      lastLogin: '2024-03-13T14:20:00Z',
      permissions: ['permission.approve_transactions', 'permission.set_policies'],
      department: '리스크팀'
    }
  ]

  const getRoleName = (role: UserRole) => {
    const roleNames = {
      admin: '관리자',
      manager: '매니저',
      viewer: '조회자',
      approver: '승인자',
      initiator: '기안자',
      required_approver: '필수 결재자',
      operator: '운영자'
    }
    return roleNames[role] || role
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'text-red-600 bg-red-50',
      manager: 'text-blue-600 bg-blue-50',
      viewer: 'text-green-600 bg-green-50',
      approver: 'text-purple-600 bg-purple-50',
      initiator: 'text-cyan-600 bg-cyan-50',
      required_approver: 'text-orange-600 bg-orange-50',
      operator: 'text-gray-600 bg-gray-50'
    }
    return colors[role] || 'text-gray-600 bg-gray-50'
  }

  const getStatusColor = (status: UserStatus) => {
    const colors = {
      active: 'text-green-600 bg-green-50',
      inactive: 'text-gray-600 bg-gray-50',
      pending: 'text-yellow-600 bg-yellow-50'
    }
    return colors[status]
  }

  const getStatusName = (status: UserStatus) => {
    return t(`user.status.${status}`)
  }

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const handleAddUser = () => {
    console.log('Adding user:', newUser)
    setShowAddModal(false)
    setNewUser({
      name: '',
      email: '',
      role: 'viewer',
      department: '',
      permissions: []
    })
  }

  const getPermissionName = (permission: string) => {
    const permissionNames = {
      'permission.all': '모든 권한',
      'permission.view_assets': '자산 조회',
      'permission.view_transactions': '거래 내역 조회',
      'permission.approve_transactions': '거래 승인',
      'permission.manage_users': '사용자 관리',
      'permission.set_policies': '정책 설정',
      'permission.manage_groups': '그룹 관리',
      'permission.create_expense': '지출 신청',
      'permission.approve_expense': '지출 승인',
      'permission.manage_budget': '예산 관리',
      'permission.view_group_assets': '그룹 자산 조회',
      'permission.initiate_withdrawal': '출금 신청',
      'permission.approve_withdrawal': '출금 승인',
      'permission.required_approval': '필수 결재',
      'permission.airgap_operation': 'Air-gap 운영',
      'permission.view_audit': '감사 추적 조회'
    }
    return permissionNames[permission as keyof typeof permissionNames] || permission
  }

  const handleRoleChange = (role: UserRole) => {
    const rolePermissions = {
      admin: ['permission.all'],
      manager: ['permission.view_assets', 'permission.approve_transactions', 'permission.manage_users', 'permission.manage_groups', 'permission.approve_expense', 'permission.manage_budget', 'permission.approve_withdrawal'],
      viewer: ['permission.view_assets', 'permission.view_transactions', 'permission.view_group_assets', 'permission.create_expense', 'permission.view_audit'],
      approver: ['permission.approve_transactions', 'permission.set_policies', 'permission.approve_expense', 'permission.approve_withdrawal'],
      initiator: ['permission.view_assets', 'permission.view_transactions', 'permission.initiate_withdrawal', 'permission.create_expense'],
      required_approver: ['permission.view_assets', 'permission.view_transactions', 'permission.required_approval', 'permission.view_audit'],
      operator: ['permission.view_assets', 'permission.view_transactions', 'permission.airgap_operation', 'permission.view_audit']
    }
    
    setNewUser({
      ...newUser,
      role,
      permissions: rolePermissions[role] || []
    })
  }

  if (plan === 'free') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('users.title')}</h3>
          <p className="text-gray-500 mb-4">{t('users.not_available')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
          <p className="text-gray-600 mt-1">{t('users.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('users.add_user')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('users.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mockUsers.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('users.stats.active')}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {mockUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('users.stats.admins')}</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {mockUsers.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <KeyIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('users.stats.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {mockUsers.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('users.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">{t('users.filter_all_roles')}</option>
            <option value="admin">{t('user.role.admin')}</option>
            <option value="manager">{t('user.role.manager')}</option>
            <option value="viewer">{t('user.role.viewer')}</option>
            <option value="approver">{t('user.role.approver')}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.permissions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.last_login')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="font-semibold text-gray-700">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-gray-400">{user.department}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusName(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 2).map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {t(permission)}
                        </span>
                      ))}
                      {user.permissions.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{user.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('users.no_results')}</p>
          </div>
        )}
      </div>


      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">사용자 추가</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할 *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="viewer">조회자 (Viewer)</option>
                  <option value="initiator">기안자 (Initiator)</option>
                  <option value="approver">승인자 (Approver)</option>
                  <option value="required_approver">필수 결재자 (Required Approver)</option>
                  <option value="operator">운영자 (Operator)</option>
                  <option value="manager">매니저 (Manager)</option>
                  <option value="admin">관리자 (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: IT팀, 재무팀"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  권한 (역할에 따라 자동 설정됨)
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {newUser.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {getPermissionName(permission)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  사용자 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}