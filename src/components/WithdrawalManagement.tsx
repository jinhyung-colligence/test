'use client'

import { useState, Fragment } from 'react'
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
  FireIcon,
  CogIcon
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
  const [activeTab, setActiveTab] = useState<'requests' | 'approval' | 'airgap' | 'audit' | 'settings'>('requests')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [selectedProcessingRequest, setSelectedProcessingRequest] = useState<string | null>(null)
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
    },
    {
      id: '5',
      title: '스테이킹 보상 출금',
      fromAddress: '0x...9k1m',
      toAddress: '0x...3n7p',
      amount: 150,
      currency: 'ETH',
      groupId: '1',
      initiator: '한스테이킹팀장',
      initiatedAt: '2024-03-16T09:00:00Z',
      status: 'pending',
      priority: 'medium',
      description: 'Ethereum 2.0 스테이킹 보상 분배',
      requiredApprovals: ['박CFO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-16T09:30:00Z' }
      ],
      rejections: [],
      auditTrail: [
        { timestamp: '2024-03-16T09:00:00Z', action: '출금 신청', userId: '12', userName: '한스테이킹팀장', details: '스테이킹 보상 정산 출금 신청' },
        { timestamp: '2024-03-16T09:30:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '스테이킹 수익 검토 완료 및 승인' },
        { timestamp: '2024-03-16T09:45:00Z', action: '처리 대기', userId: 'system', userName: 'System', details: '출금 처리 대기열에 추가됨' }
      ]
    },
    {
      id: '6', 
      title: '파트너십 계약금 지급',
      fromAddress: 'bc1q...8x2z',
      toAddress: 'bc1q...5k9m',
      amount: 0.8,
      currency: 'BTC',
      groupId: '3',
      initiator: '김비즈데브',
      initiatedAt: '2024-03-16T11:20:00Z',
      status: 'pending',
      priority: 'low',
      description: '블록체인 프로젝트 파트너십 계약금',
      requiredApprovals: ['박CFO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-16T11:45:00Z' }
      ],
      rejections: [],
      auditTrail: [
        { timestamp: '2024-03-16T11:20:00Z', action: '출금 신청', userId: '13', userName: '김비즈데브', details: '파트너십 계약금 출금 신청' },
        { timestamp: '2024-03-16T11:45:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '계약서 검토 후 승인' },
        { timestamp: '2024-03-16T12:00:00Z', action: '처리 대기', userId: 'system', userName: 'System', details: '출금 처리 순서 대기 중' }
      ]
    },
    // 출금 처리 단계 데이터 (결재 완료 후 처리 단계)
    {
      id: '7',
      title: '마케팅 캠페인 비용 정산',
      fromAddress: '0x...2a4b',
      toAddress: '0x...8c9d',
      amount: 25000,
      currency: 'USDC',
      groupId: '1',
      initiator: '이마케팅팀장',
      initiatedAt: '2024-03-14T10:00:00Z',
      status: 'pending',
      priority: 'medium',
      description: 'Q1 마케팅 캠페인 최종 정산 출금',
      requiredApprovals: ['박CFO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-14T11:00:00Z' }
      ],
      rejections: [],
      auditTrail: [
        { timestamp: '2024-03-14T10:00:00Z', action: '출금 신청', userId: '14', userName: '이마케팅팀장', details: '마케팅 캠페인 정산 출금 신청' },
        { timestamp: '2024-03-14T11:00:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '예산 검토 완료 및 승인' },
        { timestamp: '2024-03-14T11:15:00Z', action: '출금 대기 시작', userId: 'system', userName: 'System', details: '오출금 방지를 위한 대기 기간 시작' }
      ]
    },
    {
      id: '8',
      title: '개발자 보너스 지급',
      fromAddress: 'bc1q...3c5d',
      toAddress: 'bc1q...7f8g',
      amount: 2.1,
      currency: 'BTC',
      groupId: '2',
      initiator: '최CTO',
      initiatedAt: '2024-03-13T15:30:00Z',
      status: 'processing',
      priority: 'high',
      description: 'Q1 성과 평가에 따른 개발팀 보너스',
      requiredApprovals: ['박CFO', '이CISO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-13T16:00:00Z' },
        { userId: '3', userName: '이CISO', role: 'required_approver', approvedAt: '2024-03-13T16:30:00Z' }
      ],
      rejections: [],
      airGapSessionId: 'AGS-2024-0313-001',
      securityReviewBy: '김보안운영자',
      securityReviewAt: '2024-03-13T17:00:00Z',
      auditTrail: [
        { timestamp: '2024-03-13T15:30:00Z', action: '출금 신청', userId: '4', userName: '최CTO', details: '개발팀 성과 보너스 출금 신청' },
        { timestamp: '2024-03-13T16:00:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '예산 확인 및 승인' },
        { timestamp: '2024-03-13T16:30:00Z', action: 'CISO 승인', userId: '3', userName: '이CISO', details: '보안 검토 완료' },
        { timestamp: '2024-03-14T09:00:00Z', action: '출금 대기 완료', userId: 'system', userName: 'System', details: '24시간 대기 기간 완료' },
        { timestamp: '2024-03-14T09:15:00Z', action: '이상거래 검토 시작', userId: '15', userName: '김AML담당자', details: 'AML/CFT 검토 시작' },
        { timestamp: '2024-03-14T09:45:00Z', action: '트래블룰 검사 완료', userId: '16', userName: '박컴플라이언스', details: '트래블룰 준수 확인 완료' },
        { timestamp: '2024-03-14T10:00:00Z', action: 'Air-gap 서명 시작', userId: '17', userName: '이보안엔지니어', details: 'Air-gap 환경에서 디지털 서명 진행' }
      ]
    },
    {
      id: '9',
      title: 'NFT 로열티 분배',
      fromAddress: '0x...5e7f',
      toAddress: '0x...9h2i',
      amount: 45,
      currency: 'ETH',
      groupId: '3',
      initiator: '한NFT사업팀장',
      initiatedAt: '2024-03-12T14:20:00Z',
      status: 'completed',
      priority: 'low',
      description: '아티스트 NFT 로열티 2월 정산 분배',
      requiredApprovals: ['박CFO'],
      approvals: [
        { userId: '2', userName: '박CFO', role: 'required_approver', approvedAt: '2024-03-12T15:00:00Z' }
      ],
      rejections: [],
      airGapSessionId: 'AGS-2024-0312-001',
      securityReviewBy: '최보안관리자',
      securityReviewAt: '2024-03-13T10:00:00Z',
      txHash: '0xabcd1234...89ef0123',
      blockConfirmations: 25,
      auditTrail: [
        { timestamp: '2024-03-12T14:20:00Z', action: '출금 신청', userId: '18', userName: '한NFT사업팀장', details: 'NFT 로열티 정산 출금 신청' },
        { timestamp: '2024-03-12T15:00:00Z', action: 'CFO 승인', userId: '2', userName: '박CFO', details: '로열티 계산 검토 후 승인' },
        { timestamp: '2024-03-13T09:00:00Z', action: '출금 대기 완료', userId: 'system', userName: 'System', details: '대기 기간 완료' },
        { timestamp: '2024-03-13T09:30:00Z', action: '보안 검증 완료', userId: '19', userName: '정보안분석가', details: '이상거래 검토 및 트래블룰 검사 완료' },
        { timestamp: '2024-03-13T10:00:00Z', action: 'Air-gap 서명 완료', userId: '17', userName: '이보안엔지니어', details: '디지털 서명 완료' },
        { timestamp: '2024-03-13T10:15:00Z', action: '블록체인 전송 완료', userId: 'system', userName: 'System', details: '이더리움 네트워크 전송 완료, 25회 확인' }
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
    if (currency === 'USDC') return `${amount.toLocaleString()} USDC`
    if (currency === 'USDT') return `${amount.toLocaleString()} USDT`
    return `${amount.toLocaleString()} ${currency}`
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
    <div className="space-y-6 min-h-full">
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


      {/* 출금 프로세스 플로우 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">

        <div className="relative">
          {/* 프로세스 단계들 */}
          <div className="flex items-center justify-between px-4 min-w-max overflow-x-auto">
            {[
              {
                step: 1,
                title: '출금 신청',
                subtitle: '기안자 작성',
                description: '출금 내용, 금액, 주소 입력'
              },
              {
                step: 2,
                title: '결재 승인',
                subtitle: '결재자 승인',
                description: '필수 결재자 순차 승인'
              },
              {
                step: 3,
                title: '출금 대기',
                subtitle: '오출금 방지',
                description: '변심 취소 대응 기간'
              },
              {
                step: 4,
                title: '보안 검증',
                subtitle: 'AML/트래블룰',
                description: '이상거래 탐지 및 규제 검사'
              },
              {
                step: 5,
                title: 'Air-gap 서명',
                subtitle: '물리적 격리',
                description: 'MPC 분산키 디지털 서명'
              },
              {
                step: 6,
                title: '블록체인 전송',
                subtitle: '네트워크 확인',
                description: '트랜잭션 브로드캐스팅'
              }
            ].map((item, index) => (
              <Fragment key={item.step}>
                {/* 단계 */}
                <div className="flex flex-col items-center group flex-shrink-0">
                  {/* 단계 제목 */}
                  <div className="px-3 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 transition-all hover:from-primary-50 hover:to-primary-100 hover:border-primary-200 hover:shadow-md whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-700 hover:text-primary-700 transition-colors">{item.title}</span>
                  </div>
                  
                  {/* 단계 정보 */}
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{item.subtitle}</p>
                  </div>

                  {/* 호버 툴팁 */}
                  <div className={`absolute top-16 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap ${
                    index === 0 ? 'left-0' : 
                    index === 5 ? 'right-0' : 
                    'left-1/2 transform -translate-x-1/2'
                  }`}>
                    {item.description}
                    <div className={`absolute -top-1 w-2 h-2 bg-gray-800 rotate-45 ${
                      index === 0 ? 'left-4' :
                      index === 5 ? 'right-4' :
                      'left-1/2 transform -translate-x-1/2'
                    }`}></div>
                  </div>
                </div>
                
                {/* 화살표 */}
                {index < 5 && (
                  <div className="mx-6 flex items-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'requests', name: '출금 신청 관리', icon: DocumentCheckIcon },
            { id: 'approval', name: '결재 승인', icon: CheckCircleIcon },
            { id: 'airgap', name: '출금 처리', icon: LockClosedIcon },
            { id: 'audit', name: '감사 추적', icon: EyeIcon },
            { id: 'settings', name: '승인 설정', icon: CogIcon }
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
                  {filteredRequests.filter(r => ['submitted', 'approved', 'rejected'].includes(r.status)).map((request) => {
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

      {/* 출금 처리 탭 */}
      {activeTab === 'airgap' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <LockClosedIcon className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">출금 처리 현황</h3>
              <p className="text-gray-600 text-sm">승인 완료된 출금 요청의 보안 처리 및 블록체인 전송 상태</p>
            </div>
          </div>

          {mockRequests.filter(r => ['pending', 'processing', 'completed'].includes(r.status)).length === 0 ? (
            <div className="text-center py-12">
              <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">현재 처리 중인 출금이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출금 내용</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">진행률/대기순서</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">세션 ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockRequests.filter(r => ['pending', 'processing', 'completed'].includes(r.status)).map((request) => {
                        const getProgressInfo = (request: any) => {
                          if (request.status === 'pending') {
                            // 출금 대기 (오출금 방지 기간)
                            const queuePosition = request.id === '7' ? 1 : 2
                            return { queuePosition, step: '출금 대기', eta: `약 ${queuePosition * 12}시간`, type: 'pending', description: '오출금 방지 및 변심 취소 대응 기간' }
                          } else if (request.status === 'processing') {
                            // 출금 진행 (이상거래 검토, 트래블룰, Air-gap 서명)
                            if (request.id === '8') return { progress: 85, step: 'Air-gap 서명 진행', eta: '약 15분', type: 'processing' }
                            return { progress: 45, step: '이상거래 검토', eta: '약 30분', type: 'processing' }
                          } else if (request.status === 'completed') {
                            // 출금 완료 (블록체인 전송 완료)
                            return { progress: 100, step: '출금 완료', eta: '완료됨', type: 'completed', txHash: request.txHash, confirmations: request.blockConfirmations }
                          }
                          return { progress: 0, step: '대기', eta: '미정', type: 'unknown' }
                        }
                        const progressInfo = getProgressInfo(request)
                        const statusInfo = getStatusInfo(request.status)
                        const StatusIcon = statusInfo.icon
                        
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                request.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {progressInfo.step}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {progressInfo.type === 'processing' ? (
                                <div className="w-full">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>처리 진행률</span>
                                    <span>{progressInfo.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full transition-all"
                                      style={{ width: `${progressInfo.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : progressInfo.type === 'pending' ? (
                                <div className="text-sm">
                                  <p className="font-medium text-yellow-700">대기 중 ({progressInfo.eta})</p>
                                  <p className="text-xs text-gray-500">{progressInfo.description}</p>
                                </div>
                              ) : progressInfo.type === 'completed' ? (
                                <div className="text-sm">
                                  <p className="font-medium text-green-700">✓ 전송 완료</p>
                                  <p className="text-xs text-gray-500">{progressInfo.confirmations}회 확인</p>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <p className="font-medium text-gray-500">상태 확인 중</p>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-mono">
                                {request.status === 'pending' ? `WAIT-${request.id.padStart(3, '0')}` :
                                 request.status === 'completed' && request.txHash ? request.txHash.slice(0, 10) + '...' :
                                 request.airGapSessionId || `PROC-${request.id.padStart(3, '0')}`}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => setSelectedProcessingRequest(
                                  selectedProcessingRequest === request.id ? null : request.id
                                )}
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
              
              {/* 상세 정보 패널 - 테이블 외부로 분리 */}
              {selectedProcessingRequest && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {(() => {
                    const request = mockRequests.find(r => r.id === selectedProcessingRequest)
                    if (!request) return null
                    
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">{request.title} - 상세 정보</h4>
                          <button 
                            onClick={() => setSelectedProcessingRequest(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">기본 정보</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">출금 주소:</span>
                                <span className="font-mono text-xs">{request.toAddress}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">원본 주소:</span>
                                <span className="font-mono text-xs">{request.fromAddress}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">기안자:</span>
                                <span>{request.initiator}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">우선순위:</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityInfo(request.priority).color}`}>
                                  {getPriorityInfo(request.priority).name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">처리 현황</h5>
                            <div className="space-y-2 text-sm">
                              {request.status === 'processing' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">보안 검증 완료</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">트래블룰 검사 완료</span>
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
                              ) : request.status === 'completed' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">승인 완료</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">보안 검증 완료</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">트래블룰 검사 완료</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">블록체인 전송 완료</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">승인 완료</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                                    <span className="text-yellow-700">처리 대기열에서 순서 대기</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-500">보안 검증 대기</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-500">서명 및 전송 대기</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">상세 설명</h5>
                          <p className="text-gray-600 text-sm">{request.description}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
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
      
      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  )
}