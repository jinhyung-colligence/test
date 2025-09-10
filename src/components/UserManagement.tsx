'use client'

import { useState } from 'react'
import { 
  UsersIcon, 
  PlusIcon, 
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessageData, setSuccessMessageData] = useState<{name: string; email: string; type: 'add' | 'edit' | 'deactivate'} | null>(null)
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

  const handleAddUser = async () => {
    setIsSubmitting(true)
    
    try {
      // 이메일 발송 시뮬레이션 (실제로는 API 호출)
      console.log('Sending invitation email to:', newUser.email)
      
      // 3초 대기로 이메일 발송 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 새 사용자를 대기 상태로 추가 (실제로는 서버에 저장)
      const newUserData = {
        ...newUser,
        id: `user-${Date.now()}`,
        status: 'pending' as UserStatus, // 대기 상태로 설정
        lastLogin: '',
        invitedAt: new Date().toISOString()
      }
      
      console.log('User added with pending status:', newUserData)
      
      // 성공 처리
      setSuccessMessageData({ name: newUser.name, email: newUser.email, type: 'add' })
      setShowAddModal(false)
      setShowSuccessMessage(true)
      
      // 폼 리셋
      setNewUser({
        name: '',
        email: '',
        role: 'viewer',
        department: '',
        permissions: []
      })
      
      // 5초 후 성공 메시지 숨김
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessageData(null)
      }, 5000)
      
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      alert('이메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    setIsSubmitting(true)
    
    try {
      // 사용자 정보 업데이트 시뮬레이션 (실제로는 API 호출)
      console.log('Updating user:', editingUser)
      
      // 2초 대기로 업데이트 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 성공 처리
      setShowEditModal(false)
      setEditingUser(null)
      
      // 성공 메시지 표시 (편의상 기존 성공 메시지 재사용)
      setSuccessMessageData({ 
        name: editingUser.name, 
        email: editingUser.email,
        type: 'edit'
      })
      setShowSuccessMessage(true)
      
      // 5초 후 성공 메시지 숨김
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessageData(null)
      }, 5000)
      
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('사용자 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivateUser = (user: User) => {
    setDeactivatingUser(user)
    setShowDeactivateModal(true)
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUser) return
    
    setIsSubmitting(true)
    
    try {
      // 사용자 비활성 처리 시뮬레이션 (실제로는 API 호출)
      console.log('Deactivating user:', deactivatingUser)
      
      // 2초 대기로 비활성 처리 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 성공 처리
      setShowDeactivateModal(false)
      setDeactivatingUser(null)
      
      // 성공 메시지 표시
      setSuccessMessageData({ 
        name: deactivatingUser.name, 
        email: deactivatingUser.email,
        type: 'deactivate'
      })
      setShowSuccessMessage(true)
      
      // 5초 후 성공 메시지 숨김
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessageData(null)
      }, 5000)
      
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      alert('사용자 비활성 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
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
      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                {successMessageData?.type === 'edit' ? '사용자 정보가 업데이트되었습니다' : 
                 successMessageData?.type === 'deactivate' ? '사용자가 비활성 처리되었습니다' : 
                 '사용자 초대 이메일이 발송되었습니다'}
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  {successMessageData?.type === 'edit' ? (
                    `${successMessageData?.name}님의 정보가 성공적으로 업데이트되었습니다.`
                  ) : successMessageData?.type === 'deactivate' ? (
                    `${successMessageData?.name}님의 계정이 비활성 상태로 변경되었습니다. 로그인이 불가능하며 모든 권한이 제한됩니다.`
                  ) : (
                    <>
                      {successMessageData?.name}님의 이메일 ({successMessageData?.email})로 초대 링크가 전송되었습니다.
                      <br />
                      이메일에서 승인을 완료하면 계정이 활성화됩니다.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setShowSuccessMessage(false)}
                  className="inline-flex bg-blue-50 rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-blue-100"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeactivateUser(user)}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                      >
                        비활성
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      이메일 발송 중...
                    </>
                  ) : (
                    '사용자 추가'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 수정 모달 */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">사용자 정보 수정</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
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
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할 *
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole
                    const rolePermissions = {
                      admin: ['permission.all'],
                      manager: ['permission.view_assets', 'permission.approve_transactions', 'permission.manage_users', 'permission.manage_groups', 'permission.approve_expense', 'permission.manage_budget', 'permission.approve_withdrawal'],
                      viewer: ['permission.view_assets', 'permission.view_transactions', 'permission.view_group_assets', 'permission.create_expense', 'permission.view_audit'],
                      approver: ['permission.approve_transactions', 'permission.set_policies', 'permission.approve_expense', 'permission.approve_withdrawal'],
                      initiator: ['permission.view_assets', 'permission.view_transactions', 'permission.initiate_withdrawal', 'permission.create_expense'],
                      required_approver: ['permission.view_assets', 'permission.view_transactions', 'permission.required_approval', 'permission.view_audit'],
                      operator: ['permission.view_assets', 'permission.view_transactions', 'permission.airgap_operation', 'permission.view_audit']
                    }
                    setEditingUser({ 
                      ...editingUser, 
                      role: newRole,
                      permissions: rolePermissions[newRole] || []
                    })
                  }}
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
                  상태 *
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
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
                    {editingUser.permissions.map((permission, index) => (
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
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      업데이트 중...
                    </>
                  ) : (
                    '수정 완료'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 비활성 확인 모달 */}
      {showDeactivateModal && deactivatingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">사용자 비활성 확인</h3>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {deactivatingUser.name}님을 비활성 처리하시겠습니까?
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {deactivatingUser.email} • {getRoleName(deactivatingUser.role)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      비활성 처리 시 주의사항
                    </h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>사용자는 즉시 로그인할 수 없게 됩니다</li>
                        <li>모든 시스템 권한이 제한됩니다</li>
                        <li>진행 중인 작업이 중단될 수 있습니다</li>
                        <li>필요시 나중에 다시 활성화할 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    비활성 처리 중...
                  </>
                ) : (
                  '비활성 처리'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}