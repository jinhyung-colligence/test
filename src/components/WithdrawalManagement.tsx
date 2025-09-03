'use client'

import { useState } from 'react'
import { 
  ArrowUpOnSquareIcon,
  PlusIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CpuChipIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { useLanguage } from '@/contexts/LanguageContext'

interface WithdrawalManagementProps {
  plan: ServicePlan
}

type WithdrawalStatus = 
  | 'draft'           // 임시저장
  | 'submitted'       // 출금 신청
  | 'approved'        // 결재 완료
  | 'pending'         // 출금 대기
  | 'processing'      // 출금 진행 (Air-gap)
  | 'completed'       // 출금 완료
  | 'rejected'        // 반려
  | 'cancelled'       // 취소

type UserRole = 'initiator' | 'approver' | 'required_approver' | 'operator' | 'admin'

interface WithdrawalRequest {
  id: string
  title: string
  fromAddress: string
  toAddress: string
  amount: number
  currency: string
  groupId: string
  initiator: string
  initiatedAt: string
  status: WithdrawalStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  
  // 결재 관련
  requiredApprovals: string[]
  approvals: Array<{
    userId: string
    userName: string
    role: UserRole
    approvedAt: string
    signature?: string
  }>
  rejections: Array<{
    userId: string
    userName: string
    rejectedAt: string
    reason: string
  }>
  
  // Air-gap 관련
  airGapSessionId?: string
  securityReviewBy?: string
  securityReviewAt?: string
  signatureCompleted?: boolean
  txHash?: string
  blockConfirmations?: number
  
  // 감사 추적
  auditTrail: Array<{
    timestamp: string
    action: string
    userId: string
    userName: string
    details: string
    ipAddress?: string
  }>
}

export default function WithdrawalManagement({ plan }: WithdrawalManagementProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'approval' | 'airgap' | 'audit'>('requests')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<WithdrawalStatus | 'all'>('all')
  const { t, language } = useLanguage()

  const [newRequest, setNewRequest] = useState({
    title: '',
    fromAddress: '',
    toAddress: '',
    amount: 0,
    currency: 'BTC',
    groupId: '',
    description: '',
    priority: 'medium' as const
  })

  const mockRequests: WithdrawalRequest[] = [
    {
      id: '1',
      title: '파트너사 결제 - Q1 정산',
      fromAddress: 'bc1q...4x8z',
      toAddress: 'bc1q...7y2m',
      amount: 5.5,
      currency: 'BTC',
      groupId: '1',
      initiator: '김기안자',
      initiatedAt: '2024-03-15T09:00:00Z',
      status: 'approved',
      priority: 'high',
      description: '1분기 파트너사 수수료 정산을 위한 출금',
      requiredApprovals: ['박CFO', '이CISO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-15T10:30:00Z' },
        { userId: '3', userName: '이CISO', role: 'required_approver', approvedAt: '2024-03-15T11:15:00Z' }
      ],
      rejections: [],
      auditTrail: [
        { timestamp: '2024-03-15T09:00:00Z', action: '출금 신청', userId: '1', userName: '김기안자', details: '출금 신청서 작성 완료' },
        { timestamp: '2024-03-15T10:30:00Z', action: '1차 승인', userId: '2', userName: '박CFO', details: 'CFO 승인 완료' },
        { timestamp: '2024-03-15T11:15:00Z', action: '최종 승인', userId: '3', userName: '이CISO', details: 'CISO 최종 승인 완료' }
      ]
    },
    {
      id: '2',
      title: 'DeFi 프로토콜 유동성 공급',
      fromAddress: '0x...3f2a',
      toAddress: '0x...8b4c',
      amount: 100000,
      currency: 'USDC',
      groupId: '2',
      initiator: '최투자팀장',
      initiatedAt: '2024-03-15T14:20:00Z',
      status: 'processing',
      priority: 'critical',
      description: 'Uniswap V3 ETH/USDC 풀 유동성 공급',
      requiredApprovals: ['박CFO', '이CISO', '김CTO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-15T15:00:00Z' },
        { userId: '3', userName: '이CISO', role: 'required_approver', approvedAt: '2024-03-15T15:30:00Z' },
        { userId: '4', userName: '김CTO', role: 'required_approver', approvedAt: '2024-03-15T16:00:00Z' }
      ],
      rejections: [],
      airGapSessionId: 'AGS-2024-0315-001',
      securityReviewBy: '이보안담당자',
      securityReviewAt: '2024-03-15T16:30:00Z',
      auditTrail: [
        { timestamp: '2024-03-15T14:20:00Z', action: '출금 신청', userId: '5', userName: '최투자팀장', details: '고액 출금 신청서 작성' },
        { timestamp: '2024-03-15T15:00:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '재무 검토 및 승인' },
        { timestamp: '2024-03-15T15:30:00Z', action: 'CISO 승인', userId: '3', userName: '이CISO', details: '보안 검토 및 승인' },
        { timestamp: '2024-03-15T16:00:00Z', action: 'CTO 승인', userId: '4', userName: '김CTO', details: '기술 검토 및 최종 승인' },
        { timestamp: '2024-03-15T16:30:00Z', action: 'Air-gap 진입', userId: '6', userName: '이보안담당자', details: 'Air-gap 환경으로 이관, 보안 검토 시작' }
      ]
    },
    {
      id: '3',
      title: '급여 지급 - 3월분',
      fromAddress: '0x...1a2b',
      toAddress: '0x...9c8d',
      amount: 50000,
      currency: 'USDT',
      groupId: '3',
      initiator: '박인사팀장',
      initiatedAt: '2024-03-14T16:00:00Z',
      status: 'submitted',
      priority: 'medium',
      description: '직원 급여 지급을 위한 스테이블코인 출금',
      requiredApprovals: ['박CFO'],
      approvals: [],
      rejections: [],
      auditTrail: [
        { timestamp: '2024-03-14T16:00:00Z', action: '출금 신청', userId: '7', userName: '박인사팀장', details: '3월 급여 지급 신청서 제출' }
      ]
    },
    {
      id: '4',
      title: '거래소 차익거래 - 긴급',
      fromAddress: 'bc1q...2m4n',
      toAddress: 'bc1q...6k7l',
      amount: 2.8,
      currency: 'BTC',
      groupId: '2',
      initiator: '정트레이더',
      initiatedAt: '2024-03-15T08:30:00Z',
      status: 'rejected',
      priority: 'critical',
      description: '김치프리미엄 차익거래 기회 포착',
      requiredApprovals: ['박CFO', '이CISO'],
      approvals: [],
      rejections: [
        { userId: '3', userName: '이CISO', rejectedAt: '2024-03-15T09:00:00Z', reason: '리스크 관리 정책 위반 - 단일 거래 한도 초과' }
      ],
      auditTrail: [
        { timestamp: '2024-03-15T08:30:00Z', action: '긴급 출금 신청', userId: '8', userName: '정트레이더', details: '차익거래 기회로 인한 긴급 출금 요청' },
        { timestamp: '2024-03-15T09:00:00Z', action: '신청 반려', userId: '3', userName: '이CISO', details: '리스크 한도 초과로 인한 반려' }
      ]
    }
  ]

  const getStatusInfo = (status: WithdrawalStatus) => {
    const statusConfig = {
      draft: { name: '임시저장', color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
      submitted: { name: '출금 신청', color: 'bg-blue-100 text-blue-800', icon: ArrowUpOnSquareIcon },
      approved: { name: '결재 완료', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      pending: { name: '출금 대기', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      processing: { name: '출금 진행', color: 'bg-purple-100 text-purple-800', icon: CpuChipIcon },
      completed: { name: '출금 완료', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircleIcon },
      rejected: { name: '반려', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      cancelled: { name: '취소', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    }
    return statusConfig[status] || statusConfig.draft
  }

  const getPriorityInfo = (priority: string) => {
    const priorityConfig = {
      low: { name: '낮음', color: 'bg-green-100 text-green-800' },
      medium: { name: '보통', color: 'bg-yellow-100 text-yellow-800' },
      high: { name: '높음', color: 'bg-orange-100 text-orange-800' },
      critical: { name: '긴급', color: 'bg-red-100 text-red-800' }
    }
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'BTC') return `₿${amount.toFixed(8)}`
    if (currency === 'ETH') return `Ξ${amount.toFixed(6)}`
    return `$${amount.toLocaleString()}`
  }

  const formatDateTime = (timestamp: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const handleCreateRequest = () => {
    console.log('Creating withdrawal request:', newRequest)
    setShowCreateModal(false)
    setNewRequest({
      title: '',
      fromAddress: '',
      toAddress: '',
      amount: 0,
      currency: 'BTC',
      groupId: '',
      description: '',
      priority: 'medium'
    })
  }

  const handleApproval = (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action}ing request ${requestId}`, reason ? `Reason: ${reason}` : '')
  }

  const filteredRequests = mockRequests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  )

  if (plan !== 'enterprise') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">출금 관리 시스템</h3>
          <p className="text-gray-500 mb-4">엔터프라이즈 플랜에서만 사용 가능한 기능입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">단계별 출금 관리</h1>
          <p className="text-gray-600 mt-1">보안과 효율성을 모두 갖춘 기업용 출금 시스템</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          출금 신청
        </button>
      </div>

      {/* 보안 상태 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.586-3L12 6.414 7.414 11M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-semibold text-gray-900">100% 콜드 월렛</p>
                <div className="h-2 w-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-600">인터넷 완전 분리</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.792.127L10.5 16.5l-3.5-3.5 1.461-2.679c.153-.633.224-1.229.127-1.792A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-semibold text-gray-900">MPC 키 분산</p>
                <div className="h-2 w-2 bg-blue-500 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-600">키 유출 방지</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
              <LockClosedIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-semibold text-gray-900">Air-gap 실행</p>
                <div className="h-2 w-2 bg-purple-500 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-600">물리적 격리 환경</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
              <EyeIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-semibold text-gray-900">완전 감사 추적</p>
                <div className="h-2 w-2 bg-orange-500 rounded-full ml-2"></div>
              </div>
              <p className="text-sm text-gray-600">모든 활동 기록</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'requests', name: '출금 신청 관리', icon: DocumentCheckIcon },
            { id: 'approval', name: '결재 승인', icon: CheckCircleIcon },
            { id: 'airgap', name: 'Air-gap 실행', icon: LockClosedIcon },
            { id: 'audit', name: '감사 추적', icon: EyeIcon }
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

      {/* 출금 신청 관리 탭 */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">출금 신청 현황</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체 상태</option>
              <option value="submitted">출금 신청</option>
              <option value="approved">결재 완료</option>
              <option value="pending">출금 대기</option>
              <option value="processing">출금 진행</option>
              <option value="completed">출금 완료</option>
              <option value="rejected">반려</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출금 내용</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기안자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">우선순위</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">진행률</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusInfo(request.status)
                    const priorityInfo = getPriorityInfo(request.priority)
                    const StatusIcon = statusInfo.icon
                    const approvalProgress = (request.approvals.length / request.requiredApprovals.length) * 100

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{request.title}</p>
                            <p className="text-sm text-gray-500">{request.description}</p>
                            <p className="text-xs text-gray-400">{formatDateTime(request.initiatedAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(request.amount, request.currency)}
                            </p>
                            <p className="text-gray-500">{request.currency}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.initiator}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${priorityInfo.color}`}>
                            {priorityInfo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className="h-4 w-4 mr-2" />
                            <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                              {statusInfo.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.status === 'submitted' && (
                            <div className="w-full">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>승인 진행률</span>
                                <span>{request.approvals.length}/{request.requiredApprovals.length}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${approvalProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedRequest(request.id)}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            상세보기
                          </button>
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

      {/* 결재 승인 탭 */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">결재 승인 대기 목록</h3>
          
          <div className="grid gap-4">
            {mockRequests.filter(r => r.status === 'submitted').map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-gray-900 mr-3">{request.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityInfo(request.priority).color}`}>
                        {getPriorityInfo(request.priority).name}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex-1">
                        <span className="text-gray-500">출금 금액:</span>
                        <span className="font-medium ml-2">{formatCurrency(request.amount, request.currency)}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">기안자:</span>
                        <span className="font-medium ml-2">{request.initiator}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">출금 주소:</span>
                        <span className="font-mono text-xs ml-2">{request.toAddress}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">신청 일시:</span>
                        <span className="ml-2">{formatDateTime(request.initiatedAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">필수 결재자 승인 현황</p>
                      <div className="space-y-1">
                        {request.requiredApprovals.map((approver) => {
                          const approval = request.approvals.find(a => a.userName === approver)
                          return (
                            <div key={approver} className="flex items-center text-sm">
                              {approval ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                              )}
                              <span className={approval ? 'text-green-700' : 'text-yellow-700'}>
                                {approver} {approval && `(${formatDateTime(approval.approvedAt)})`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex space-x-2">
                    <button
                      onClick={() => handleApproval(request.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleApproval(request.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      반려
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Air-gap 실행 탭 */}
      {activeTab === 'airgap' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center">
              <LockClosedIcon className="h-8 w-8 mr-4" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Air-gap 보안 환경</h3>
                <p className="text-blue-100">인터넷에서 완전히 분리된 물리적 보안 환경에서 서명 수행</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {mockRequests.filter(r => r.status === 'processing').map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <CpuChipIcon className="h-6 w-6 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        Air-gap 처리 중
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex-1">
                        <span className="text-gray-500">세션 ID:</span>
                        <span className="font-mono ml-2">{request.airGapSessionId}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">보안 검토자:</span>
                        <span className="ml-2">{request.securityReviewBy}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">출금 금액:</span>
                        <span className="font-semibold ml-2">{formatCurrency(request.amount, request.currency)}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">검토 시작:</span>
                        <span className="ml-2">{request.securityReviewAt && formatDateTime(request.securityReviewAt)}</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-2">보안 검토 체크리스트</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-700">이상거래 패턴 검토 완료</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-700">출금 주소 화이트리스트 확인</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-yellow-700">디지털 서명 진행 중</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">블록체인 전송 대기</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mockRequests.filter(r => r.status === 'processing').length === 0 && (
            <div className="text-center py-12">
              <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">현재 Air-gap 처리 중인 출금이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 감사 추적 탭 */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">출금 감사 추적</h3>
          
          <div className="space-y-4">
            {mockRequests.map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded mr-3 ${getStatusInfo(request.status).color}`}>
                      {getStatusInfo(request.status).name}
                    </span>
                    <span className="text-sm text-gray-500">{formatCurrency(request.amount, request.currency)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {request.auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <span className="text-xs text-gray-500">{formatDateTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        <p className="text-xs text-gray-400">담당자: {entry.userName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 출금 신청 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">새 출금 신청</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateRequest(); }} className="space-y-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">출금 제목 *</label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="출금 목적을 간략히 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">암호화폐 *</label>
                  <select
                    value={newRequest.currency}
                    onChange={(e) => setNewRequest({ ...newRequest, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                    <option value="USDT">Tether (USDT)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">출금 금액 *</label>
                  <input
                    type="number"
                    step="0.00000001"
                    required
                    value={newRequest.amount}
                    onChange={(e) => setNewRequest({ ...newRequest, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">출금 주소 *</label>
                <input
                  type="text"
                  required
                  value={newRequest.toAddress}
                  onChange={(e) => setNewRequest({ ...newRequest, toAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder="대상 지갑 주소를 입력하세요"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위 *</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">낮음 - 일반 출금</option>
                  <option value="medium">보통 - 정기 업무</option>
                  <option value="high">높음 - 중요 거래</option>
                  <option value="critical">긴급 - 즉시 처리</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
                <textarea
                  required
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="출금 목적과 상세 내용을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm font-medium">보안 알림</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  모든 출금은 필수 결재자의 승인을 받아야 하며, Air-gap 환경에서 최종 서명이 진행됩니다.
                </p>
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
                  신청 제출
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}