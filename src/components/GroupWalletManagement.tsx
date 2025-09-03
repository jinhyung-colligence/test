'use client'

import { useState } from 'react'
import { 
  WalletIcon,
  PlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { useLanguage } from '@/contexts/LanguageContext'

interface GroupWalletManagementProps {
  plan: ServicePlan
}

type GroupType = 'department' | 'project' | 'team'
type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'draft'

interface WalletGroup {
  id: string
  name: string
  type: GroupType
  description: string
  balance: number
  monthlyBudget: number
  budgetUsed: number
  members: string[]
  manager: string
  createdAt: string
}

interface ExpenseRequest {
  id: string
  groupId: string
  title: string
  amount: number
  description: string
  category: string
  requestedBy: string
  requestedAt: string
  status: ExpenseStatus
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
}

export default function GroupWalletManagement({ plan }: GroupWalletManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'groups' | 'expenses' | 'budget'>('groups')
  const { t, language } = useLanguage()

  const [newGroup, setNewGroup] = useState({
    name: '',
    type: 'department' as GroupType,
    description: '',
    monthlyBudget: 0,
    manager: ''
  })

  const [newExpense, setNewExpense] = useState({
    groupId: '',
    title: '',
    amount: 0,
    description: '',
    category: 'operations'
  })

  const mockGroups: WalletGroup[] = [
    {
      id: '1',
      name: 'IT 개발팀',
      type: 'department',
      description: '소프트웨어 개발 및 인프라 관리',
      balance: 45000000,
      monthlyBudget: 50000000,
      budgetUsed: 5000000,
      members: ['김개발자', '이프론트', '박백엔드'],
      manager: '김팀장',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'NFT 마켓플레이스 프로젝트',
      type: 'project',
      description: 'NFT 거래 플랫폼 개발 프로젝트',
      balance: 28500000,
      monthlyBudget: 30000000,
      budgetUsed: 1500000,
      members: ['박프로젝트', '최디자인', '한마케팅'],
      manager: '박PM',
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: '보안팀',
      type: 'team',
      description: '시스템 보안 및 감사',
      balance: 15800000,
      monthlyBudget: 20000000,
      budgetUsed: 4200000,
      members: ['이보안', '최감사'],
      manager: '이CISO',
      createdAt: '2024-01-10'
    }
  ]

  const mockExpenses: ExpenseRequest[] = [
    {
      id: '1',
      groupId: '1',
      title: 'AWS 클라우드 서비스 비용',
      amount: 2500000,
      description: 'EC2, RDS, S3 월 사용료',
      category: 'infrastructure',
      requestedBy: '김개발자',
      requestedAt: '2024-03-10',
      status: 'approved',
      approvedBy: '김팀장',
      approvedAt: '2024-03-11'
    },
    {
      id: '2',
      groupId: '2',
      title: '디자인 소프트웨어 라이선스',
      amount: 800000,
      description: 'Adobe Creative Suite 연간 구독',
      category: 'software',
      requestedBy: '최디자인',
      requestedAt: '2024-03-12',
      status: 'pending'
    },
    {
      id: '3',
      groupId: '3',
      title: '보안 장비 구매',
      amount: 3200000,
      description: '네트워크 보안 장비 및 소프트웨어',
      category: 'equipment',
      requestedBy: '이보안',
      requestedAt: '2024-03-13',
      status: 'rejected',
      rejectedReason: '예산 초과로 인한 반려'
    }
  ]

  const getTypeColor = (type: GroupType) => {
    const colors = {
      department: 'bg-blue-100 text-blue-800',
      project: 'bg-green-100 text-green-800',
      team: 'bg-purple-100 text-purple-800'
    }
    return colors[type]
  }

  const getTypeName = (type: GroupType) => {
    const names = {
      department: '부서',
      project: '프로젝트',
      team: '팀'
    }
    return names[type]
  }

  const getStatusColor = (status: ExpenseStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getStatusName = (status: ExpenseStatus) => {
    const names = {
      draft: '임시저장',
      pending: '승인대기',
      approved: '승인됨',
      rejected: '반려됨'
    }
    return names[status]
  }

  const getStatusIcon = (status: ExpenseStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getBudgetUsagePercentage = (group: WalletGroup) => {
    return Math.round((group.budgetUsed / group.monthlyBudget) * 100)
  }

  const handleCreateGroup = () => {
    console.log('Creating group:', newGroup)
    setShowCreateModal(false)
    setNewGroup({
      name: '',
      type: 'department',
      description: '',
      monthlyBudget: 0,
      manager: ''
    })
  }

  const handleCreateExpense = () => {
    console.log('Creating expense:', newExpense)
    setShowExpenseModal(false)
    setNewExpense({
      groupId: '',
      title: '',
      amount: 0,
      description: '',
      category: 'operations'
    })
  }

  const handleApproveExpense = (expenseId: string) => {
    console.log('Approving expense:', expenseId)
  }

  const handleRejectExpense = (expenseId: string, reason: string) => {
    console.log('Rejecting expense:', expenseId, 'Reason:', reason)
  }

  if (plan !== 'enterprise') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">그룹 지갑 관리</h3>
          <p className="text-gray-500 mb-4">엔터프라이즈 플랜에서만 사용 가능한 기능입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">그룹 지갑 관리</h1>
          <p className="text-gray-600 mt-1">목적별 그룹화로 체계적인 자산관리</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            그룹 생성
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentCheckIcon className="h-5 w-5 mr-2" />
            지출 신청
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            리포트 출력
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'groups', name: '그룹 관리', icon: UserGroupIcon },
            { id: 'expenses', name: '지출 승인', icon: DocumentCheckIcon },
            { id: 'budget', name: '예산 현황', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 그룹 관리 탭 */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <WalletIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(group.type)}`}>
                      {getTypeName(group.type)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{group.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">잔액</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(group.balance)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">월 예산</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(group.monthlyBudget)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">예산 사용률</span>
                    <span className="text-sm text-gray-900">
                      {getBudgetUsagePercentage(group)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getBudgetUsagePercentage(group) > 80 
                          ? 'bg-red-500' 
                          : getBudgetUsagePercentage(group) > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getBudgetUsagePercentage(group), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 지출 한도 표시 */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">지출 한도</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-900">
                      {formatCurrency(Math.round(group.monthlyBudget * 0.8))}
                    </span>
                    {getBudgetUsagePercentage(group) > 80 && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        한도 근접
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-gray-500">관리자: {group.manager}</span>
                    <span className="text-gray-500">구성원: {group.members.length}명</span>
                  </div>
                  
                  {/* 액션 버튼들 */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors">
                      잔고 리포트
                    </button>
                    <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors">
                      한도 설정
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 지출 승인 탭 */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지출 승인 요청</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      그룹
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockExpenses.map((expense) => {
                    const group = mockGroups.find(g => g.id === expense.groupId)
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{expense.title}</p>
                            <p className="text-sm text-gray-500">{expense.description}</p>
                            <p className="text-xs text-gray-400">{formatDate(expense.requestedAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{group?.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(expense.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(expense.status)}`}>
                              {getStatusName(expense.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveExpense(expense.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleRejectExpense(expense.id, '검토 필요')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                반려
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 예산 현황 탭 */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 예산 현황</h3>
            <div className="space-y-4">
              {mockGroups.map((group) => (
                <div key={group.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(group.budgetUsed)} / {formatCurrency(group.monthlyBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        getBudgetUsagePercentage(group) > 80 
                          ? 'bg-red-500' 
                          : getBudgetUsagePercentage(group) > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getBudgetUsagePercentage(group), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500">사용률: {getBudgetUsagePercentage(group)}%</span>
                    <span className="text-gray-500">
                      잔여: {formatCurrency(group.monthlyBudget - group.budgetUsed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지출 요약</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-sm font-medium">승인된 지출</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(mockExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-600 text-sm font-medium">승인 대기</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {formatCurrency(mockExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 text-sm font-medium">반려된 지출</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(mockExpenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-600 text-sm font-medium">전체 그룹</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{mockGroups.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">새 그룹 생성</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹명 *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 유형 *
                </label>
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value as GroupType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="department">부서</option>
                  <option value="project">프로젝트</option>
                  <option value="team">팀</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월 예산 (KRW) *
                </label>
                <input
                  type="number"
                  required
                  value={newGroup.monthlyBudget}
                  onChange={(e) => setNewGroup({ ...newGroup, monthlyBudget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.manager}
                  onChange={(e) => setNewGroup({ ...newGroup, manager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="관리자명을 입력하세요"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 지출 신청 모달 */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">지출 신청</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateExpense(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 선택 *
                </label>
                <select
                  required
                  value={newExpense.groupId}
                  onChange={(e) => setNewExpense({ ...newExpense, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">그룹을 선택하세요</option>
                  {mockGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지출 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="지출 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  금액 (KRW) *
                </label>
                <input
                  type="number"
                  required
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="operations">운영비</option>
                  <option value="software">소프트웨어</option>
                  <option value="infrastructure">인프라</option>
                  <option value="equipment">장비</option>
                  <option value="marketing">마케팅</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명 *
                </label>
                <textarea
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="지출에 대한 상세 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}