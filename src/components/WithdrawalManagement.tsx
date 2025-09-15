"use client";

import { useState, Fragment } from "react";
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
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  WithdrawalManagementProps,
  WithdrawalRequest,
  WithdrawalStatus,
  UserRole,
} from "@/types/withdrawal";
import {
  getStatusInfo,
  getPriorityInfo,
  formatCurrency,
  formatAmount,
  formatDateTime,
  formatDate,
} from "@/utils/withdrawalHelpers";
import { StatusBadge } from "./withdrawal/StatusBadge";
import { PriorityBadge } from "./withdrawal/PriorityBadge";
import { WithdrawalTableRow } from "./withdrawal/WithdrawalTableRow";
import { ProcessingTableRow } from "./withdrawal/ProcessingTableRow";
import { RejectedTableRow } from "./withdrawal/RejectedTableRow";
import AuditTab from "./withdrawal/AuditTab";
import RejectedTabComponent from "./withdrawal/RejectedTabComponent";
import AirgapTab from "./withdrawal/AirgapTab";
import ApprovalTab from "./withdrawal/ApprovalTab";
import {
  mockWithdrawalRequests,
  networkAssets,
  whitelistedAddresses,
} from "@/data/mockWithdrawalData";

export default function WithdrawalManagement({
  plan,
}: WithdrawalManagementProps) {
  const [activeTab, setActiveTab] = useState<
    "approval" | "airgap" | "audit" | "rejected"
  >("approval");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const [newRequest, setNewRequest] = useState({
    title: "",
    fromAddress: "",
    toAddress: "",
    amount: 0,
    network: "",
    currency: "",
    groupId: "",
    description: "",
    priority: "medium" as const,
  });

  // Import mock data from separate file
  const mockRequests = mockWithdrawalRequests;

  /* Mock data moved to /data/mockWithdrawalData.ts - removed 591+ lines
  const mockRequests: WithdrawalRequest[] = [
    {
      id: "2025-09-0001",
      title: "파트너사 결제 - Q3 정산",
      fromAddress: "bc1q...4x8z",
      toAddress: "bc1q...7y2m",
      amount: 5.5,
      currency: "BTC",
      groupId: "1",
      initiator: "김기안자",
      initiatedAt: "2025-09-02T09:00:00Z",
      status: "approved",
      priority: "high",
      description: "3분기 파트너사 수수료 정산을 위한 출금",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-09-02T10:30:00Z",
        },
        {
          userId: "3",
          userName: "이CISO",
          role: "required_approver",
          approvedAt: "2025-09-02T11:15:00Z",
        },
      ],
      rejections: [],
      auditTrail: [
        {
          timestamp: "2025-09-02T09:00:00Z",
          action: "출금 신청",
          userId: "1",
          userName: "김재무담당자",
          details: "3분기 파트너사 정산을 위한 출금 요청 제출",
        },
        {
          timestamp: "2025-09-02T10:30:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-09-02T11:15:00Z",
          action: "이CISO 승인",
          userId: "3",
        },
      ],
    },
    {
      id: "2025-09-0002",
      title: "DeFi 프로토콜 유동성 공급",
      fromAddress: "0x...3f2a",
      toAddress: "0x...8b4c",
      amount: 100000,
      currency: "USDC",
      groupId: "2",
      initiator: "최투자팀장",
      initiatedAt: "2025-09-03T14:20:00Z",
      status: "processing",
      priority: "critical",
      description: "Uniswap V3 ETH/USDC 풀 유동성 공급",
      requiredApprovals: ["박CFO", "이CISO", "김CTO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-09-03T15:00:00Z",
        },
        {
          userId: "3",
          userName: "이CISO",
          role: "required_approver",
          approvedAt: "2025-09-03T15:30:00Z",
        },
        {
          userId: "4",
          userName: "김CTO",
          role: "required_approver",
          approvedAt: "2025-09-03T16:00:00Z",
        },
      ],
      rejections: [],
      airGapSessionId: "AGS-2025-0903-001",
      securityReviewBy: "이보안담당자",
      securityReviewAt: "2025-09-03T16:30:00Z",
      auditTrail: [
        {
          timestamp: "2025-09-03T14:20:00Z",
          action: "출금 신청",
          userId: "5",
          userName: "최DeFi운영자",
          details: "DeFi 프로토콜 유동성 공급을 위한 출금 신청",
        },
        {
          timestamp: "2025-09-03T15:00:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-09-03T15:30:00Z",
          action: "이CISO 승인",
          userId: "3",
        },
        {
          timestamp: "2025-09-03T16:00:00Z",
          action: "김CTO 승인",
          userId: "4",
        },
        {
          timestamp: "2025-09-03T16:30:00Z",
          action: "Air-gap 진입",
          userId: "6",
          userName: "이보안담당자",
          details: "고액 거래 보안 검증을 위한 Air-gap 환경 진입",
        },
      ],
    },
    {
      id: "2025-09-0003",
      title: "급여 지급 - 9월분",
      fromAddress: "0x...1a2b",
      toAddress: "0x...9c8d",
      amount: 50000,
      currency: "USDT",
      groupId: "3",
      initiator: "박인사팀장",
      initiatedAt: "2025-08-31T16:00:00Z",
      status: "submitted",
      priority: "medium",
      description: "직원 급여 지급을 위한 스테이블코인 출금",
      requiredApprovals: ["박CFO", "이CISO", "김CTO"],
      approvals: [],
      rejections: [],
      auditTrail: [
        {
          timestamp: "2025-08-31T16:00:00Z",
          action: "출금 신청",
          userId: "7",
          userName: "박인사팀장",
          details: "9월 급여 지급을 위한 USDT 출금 신청",
        },
      ],
    },
    {
      id: "2025-09-0004",
      title: "거래소 차익거래 - 긴급",
      fromAddress: "bc1q...2m4n",
      toAddress: "bc1q...6k7l",
      amount: 2.8,
      currency: "BTC",
      groupId: "2",
      initiator: "정트레이더",
      initiatedAt: "2025-09-01T08:30:00Z",
      status: "rejected",
      priority: "critical",
      description: "김치프리미엄 차익거래 기회 포착",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [],
      rejections: [
        {
          userId: "3",
          userName: "이CISO",
          rejectedAt: "2025-09-01T09:00:00Z",
          reason: "리스크 관리 정책 위반 - 단일 거래 한도 초과",
        },
      ],
      auditTrail: [
        {
          timestamp: "2025-09-01T08:30:00Z",
          action: "긴급 출금 신청",
          userId: "8",
          userName: "정트레이더",
          details:
            "김치프리미엄 차익거래 기회 포착으로 인한 긴급 BTC 출금 요청",
        },
        {
          timestamp: "2025-09-01T09:00:00Z",
          action: "신청 반려",
          userId: "3",
          userName: "이CISO",
          details: "리스크 관리 정책 위반 - 단일 거래 한도 초과로 인한 반려",
        },
      ],
    },
    {
      id: "2025-09-0005",
      title: "스테이킹 보상 출금",
      fromAddress: "0x...9k1m",
      toAddress: "0x...3n7p",
      amount: 150,
      currency: "ETH",
      groupId: "1",
      initiator: "한스테이킹팀장",
      initiatedAt: "2025-08-30T09:00:00Z",
      status: "pending",
      priority: "medium",
      description: "Ethereum 2.0 스테이킹 보상 분배",
      requiredApprovals: ["박CFO", "이CISO", "김CTO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-08-30T09:30:00Z",
        },
        {
          userId: "3",
          userName: "이CISO",
          role: "required_approver",
          approvedAt: "2025-08-30T10:00:00Z",
        },
      ],
      rejections: [],
      auditTrail: [
        {
          timestamp: "2025-08-30T09:00:00Z",
          action: "출금 신청",
          userId: "12",
          userName: "한스테이킹팀장",
          details: "Ethereum 2.0 스테이킹 보상 분배를 위한 ETH 출금 신청",
        },
        {
          timestamp: "2025-08-30T09:30:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-08-30T09:45:00Z",
          action: "처리 대기",
          userId: "system",
          userName: "시스템",
          details: "승인 완료 후 자동으로 처리 대기 상태로 전환",
        },
      ],
    },
    {
      id: "2025-09-0006",
      title: "파트너십 계약금 지급",
      fromAddress: "bc1q...8x2z",
      toAddress: "bc1q...5k9m",
      amount: 0.8,
      currency: "BTC",
      groupId: "3",
      initiator: "김비즈데브",
      initiatedAt: "2025-08-29T11:20:00Z",
      status: "pending",
      priority: "low",
      description: "블록체인 프로젝트 파트너십 계약금",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-08-29T11:45:00Z",
        },
      ],
      rejections: [],
      auditTrail: [
        {
          timestamp: "2025-08-29T11:20:00Z",
          action: "출금 신청",
          userId: "13",
          userName: "김비즈데브",
          details: "블록체인 프로젝트 파트너십 계약금 지급을 위한 BTC 출금",
        },
        {
          timestamp: "2025-08-29T11:45:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-08-29T12:00:00Z",
          action: "처리 대기",
          userId: "system",
          userName: "시스템",
          details: "승인 완료 후 자동으로 처리 대기 큐에 등록",
        },
      ],
    },
    // 출금 처리 단계 데이터 (결재 완료 후 처리 단계)
    {
      id: "2025-09-0007",
      title: "마케팅 캠페인 비용 정산",
      fromAddress: "0x...2a4b",
      toAddress: "0x...8c9d",
      amount: 25000,
      currency: "USDC",
      groupId: "1",
      initiator: "이마케팅팀장",
      initiatedAt: "2025-03-14T10:00:00Z",
      status: "pending",
      priority: "medium",
      description: "Q1 마케팅 캠페인 최종 정산 출금",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-03-14T11:00:00Z",
        },
      ],
      rejections: [],
      auditTrail: [
        {
          timestamp: "2025-08-28T10:00:00Z",
          action: "출금 신청",
          userId: "14",
          userName: "이마케팅팀장",
          details: "Q1 마케팅 캠페인 최종 정산을 위한 USDC 출금 신청",
        },
        {
          timestamp: "2025-08-28T11:00:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-08-28T11:15:00Z",
          action: "출금 대기 시작",
          userId: "system",
          userName: "시스템",
          details: "출금 처리를 위한 대기 프로세스 시작",
        },
      ],
    },
    {
      id: "2025-09-0008",
      title: "개발자 보너스 지급",
      fromAddress: "bc1q...3c5d",
      toAddress: "bc1q...7f8g",
      amount: 2.1,
      currency: "BTC",
      groupId: "2",
      initiator: "최CTO",
      initiatedAt: "2025-08-27T15:30:00Z",
      status: "processing",
      priority: "high",
      description: "Q3 성과 평가에 따른 개발팀 보너스",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-08-27T16:00:00Z",
        },
        {
          userId: "3",
          userName: "이CISO",
          role: "required_approver",
          approvedAt: "2025-08-27T16:30:00Z",
        },
      ],
      rejections: [],
      airGapSessionId: "AGS-2025-0827-001",
      securityReviewBy: "김보안운영자",
      securityReviewAt: "2025-08-27T17:00:00Z",
      auditTrail: [
        {
          timestamp: "2025-08-27T15:30:00Z",
          action: "출금 신청",
          userId: "4",
          userName: "김CTO",
          details: "Q3 성과 평가에 따른 개발팀 보너스 지급 신청",
        },
        {
          timestamp: "2025-08-27T16:00:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-08-27T16:30:00Z",
          action: "이CISO 승인",
          userId: "3",
        },
        {
          timestamp: "2025-08-28T09:00:00Z",
          action: "출금 대기 완료",
          userId: "system",
          userName: "시스템",
          details: "모든 승인 완료 후 출금 프로세스 진행",
        },
        {
          timestamp: "2025-08-28T09:15:00Z",
          action: "이상거래 검토 시작",
          userId: "15",
          userName: "박컴플라이언스담당자",
          details: "대량 거래에 대한 이상거래 탐지 시스템 검토 시작",
        },
        {
          timestamp: "2025-08-28T09:45:00Z",
          action: "트래블룰 검사 완료",
          userId: "16",
          userName: "이법무담당자",
          details: "규정 준수 확인 완료, 출금 진행 승인",
        },
        {
          timestamp: "2025-08-28T10:00:00Z",
          action: "Air-gap 서명 시작",
          userId: "17",
          userName: "최보안운영자",
          details: "Air-gap 환경에서 트랜잭션 서명 프로세스 시작",
        },
      ],
    },
    {
      id: "2025-09-0009",
      title: "NFT 로열티 분배",
      fromAddress: "0x...5e7f",
      toAddress: "0x...9h2i",
      amount: 45,
      currency: "ETH",
      groupId: "3",
      initiator: "한NFT사업팀장",
      initiatedAt: "2025-08-26T14:20:00Z",
      status: "completed",
      priority: "low",
      description: "아티스트 NFT 로열티 8월 정산 분배",
      requiredApprovals: ["박CFO", "이CISO", "김CTO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-08-26T15:00:00Z",
        },
        {
          userId: "3",
          userName: "이CISO",
          role: "required_approver",
          approvedAt: "2025-08-26T15:30:00Z",
        },
        {
          userId: "4",
          userName: "김CTO",
          role: "required_approver",
          approvedAt: "2025-08-26T16:00:00Z",
        },
      ],
      rejections: [],
      airGapSessionId: "AGS-2025-0826-001",
      securityReviewBy: "최보안관리자",
      securityReviewAt: "2025-08-27T10:00:00Z",
      txHash: "0xabcd1234...89ef0123",
      blockConfirmations: 25,
      auditTrail: [
        {
          timestamp: "2025-08-26T14:20:00Z",
          action: "출금 신청",
          userId: "18",
          userName: "한NFT사업팀장",
          details: "아티스트 NFT 로열티 8월 정산 분배를 위한 ETH 출금",
        },
        {
          timestamp: "2025-08-26T15:00:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-08-27T09:00:00Z",
          action: "출금 대기 완료",
          userId: "system",
          userName: "시스템",
          details: "승인 완료 후 출금 처리 대기열 진입",
        },
        {
          timestamp: "2025-08-27T09:30:00Z",
          action: "보안 검증 완료",
          userId: "19",
          userName: "최보안관리자",
          details: "트랜잭션 보안 검증 및 위험도 평가 완료",
        },
        {
          timestamp: "2025-08-27T10:00:00Z",
          action: "Air-gap 서명 완료",
          userId: "17",
          userName: "최보안운영자",
          details: "Air-gap 환경에서 트랜잭션 서명 완료",
        },
        {
          timestamp: "2025-08-27T10:15:00Z",
          action: "블록체인 전송 완료",
          userId: "system",
          userName: "시스템",
          details: "Ethereum 네트워크로 트랜잭션 브로드캐스트 완료",
        },
      ],
    },
    {
      id: "2025-08-0105",
      title: "개인 지갑 이체 - 차익거래 준비금",
      fromAddress: "bc1q...9k7s",
      toAddress: "bc1q...2m8x",
      amount: 8.75,
      currency: "BTC",
      groupId: "GRP003",
      initiator: "박트레이더",
      initiatedAt: "2025-08-15T14:20:00Z",
      status: "archived",
      priority: "medium",
      description: "차익거래를 위한 개인 지갑 이체",
      requiredApprovals: ["2", "3"],
      approvals: [],
      rejections: [
        {
          userId: "3",
          userName: "이CISO",
          rejectedAt: "2025-08-15T15:30:00Z",
          reason:
            "개인 지갑으로의 대량 이체는 보안 정책상 승인 불가. 회사 전용 지갑 사용 필요",
        },
      ],
      originalRequestId: undefined,
      reapplicationCount: 0,
      archivedAt: "2025-08-20T09:15:00Z",
      archivedBy: "박트레이더",
      auditTrail: [
        {
          timestamp: "2025-08-15T14:20:00Z",
          action: "출금 신청",
          userId: "4",
          userName: "박트레이더",
          details: "차익거래를 위한 개인 지갑으로의 BTC 이체 신청",
        },
        {
          timestamp: "2025-08-15T15:30:00Z",
          action: "신청 반려",
          userId: "3",
          userName: "이CISO",
          details: "개인 지갑으로의 대량 이체는 보안 정책상 승인 불가",
        },
        {
          timestamp: "2025-08-20T09:15:00Z",
          action: "처리 완료",
          userId: "4",
          userName: "박트레이더",
          details: "반려된 신청 아카이브 처리 완료",
        },
      ],
    },
    {
      id: "2025-09-0010",
      title: "NFT 마켓플레이스 수수료 정산",
      fromAddress: "0x...5a8c",
      toAddress: "0x...2f9d",
      amount: 850,
      currency: "ETH",
      groupId: "2",
      initiator: "최NFT팀장",
      initiatedAt: "2025-09-04T11:30:00Z",
      status: "archived",
      priority: "medium",
      description:
        "OpenSea 및 다른 NFT 마켓플레이스 수수료 정산을 위한 ETH 출금",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [
        {
          userId: "2",
          userName: "박CFO",
          role: "required_approver",
          approvedAt: "2025-09-04T13:00:00Z",
        },
      ],
      rejections: [
        {
          userId: "3",
          userName: "이CISO",
          rejectedAt: "2025-09-04T14:15:00Z",
          reason:
            "수취인 주소 검증 실패 - 화이트리스트에 등록되지 않은 주소입니다. 주소 등록 절차를 먼저 완료해 주시기 바랍니다.",
        },
      ],
      archivedAt: "2025-09-04T16:30:00Z",
      archivedBy: "최NFT팀장",
      auditTrail: [
        {
          timestamp: "2025-09-04T11:30:00Z",
          action: "출금 신청",
          userId: "9",
          userName: "최NFT팀장",
          details: "NFT 마켓플레이스 수수료 정산을 위한 ETH 출금 신청",
        },
        {
          timestamp: "2025-09-04T13:00:00Z",
          action: "박CFO 승인",
          userId: "2",
        },
        {
          timestamp: "2025-09-04T14:15:00Z",
          action: "신청 반려",
          userId: "3",
          userName: "이CISO",
          details:
            "수취인 주소가 화이트리스트에 등록되지 않아 보안 정책에 따라 반려",
        },
        {
          timestamp: "2025-09-04T16:30:00Z",
          action: "처리 완료",
          userId: "9",
          userName: "최NFT팀장",
          details: "반려된 신청을 검토 후 처리 완료로 아카이브",
        },
      ],
    },
  ];
  */

  const handleCreateRequest = () => {
    console.log("Creating withdrawal request:", newRequest);
    setShowCreateModal(false);
    setNewRequest({
      title: "",
      fromAddress: "",
      toAddress: "",
      amount: 0,
      network: "",
      currency: "",
      groupId: "",
      description: "",
      priority: "medium",
    });
  };

  // 승인/반려 팝업 상태
  const [showApprovalModal, setShowApprovalModal] = useState<{
    show: boolean;
    requestId: string | null;
    action: "approve" | "reject" | null;
  }>({ show: false, requestId: null, action: null });
  const [rejectionReason, setRejectionReason] = useState("");

  // 감사 추적 검색 및 필터

  // 출금 처리 검색 및 필터

  // 감사 추적 상세보기 토글 상태

  // 재신청 및 아카이브 관련 상태
  const [showReapplicationModal, setShowReapplicationModal] = useState<{
    show: boolean;
    requestId: string | null;
  }>({ show: false, requestId: null });
  const [showArchiveModal, setShowArchiveModal] = useState<{
    show: boolean;
    requestId: string | null;
  }>({ show: false, requestId: null });

  // 승인/반려 처리 (팝업 열기)
  const handleApproval = (requestId: string, action: "approve" | "reject") => {
    setShowApprovalModal({ show: true, requestId, action });
    setRejectionReason("");
  };

  // 재신청 처리
  const handleReapplication = (requestId: string) => {
    setShowReapplicationModal({ show: true, requestId });
  };

  // 아카이브 처리
  const handleArchive = (requestId: string) => {
    setShowArchiveModal({ show: true, requestId });
  };

  // 재신청 확인
  const confirmReapplication = () => {
    if (!showReapplicationModal.requestId) return;

    const originalRequest = mockRequests.find(
      (r) => r.id === showReapplicationModal.requestId
    );
    if (!originalRequest) return;

    // 기존 정보를 복사하여 새로운 신청서 생성
    const newRequestData = {
      ...originalRequest,
      id: `REQ-${Date.now()}`, // 새로운 ID 생성
      status: "draft" as WithdrawalStatus,
      originalRequestId: originalRequest.id,
      reapplicationCount: (originalRequest.reapplicationCount || 0) + 1,
      initiatedAt: new Date().toISOString(),
      approvals: [],
      rejections: [],
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: "재신청 생성",
          userId: "current-user",
          userName: "현재사용자",
          details: `기존 신청(${originalRequest.id})을 기반으로 재신청 생성`,
        },
      ],
    };

    // 새로운 신청서 생성 모달로 전환
    setNewRequest({
      title: originalRequest.title,
      fromAddress: originalRequest.fromAddress,
      toAddress: originalRequest.toAddress,
      amount: originalRequest.amount,
      network: "Bitcoin", // 기본값으로 설정
      currency: originalRequest.currency,
      groupId: originalRequest.groupId,
      priority: "medium" as const,
      description: `재신청: ${originalRequest.description}`,
    });

    setShowReapplicationModal({ show: false, requestId: null });
    setShowCreateModal(true);

    alert(
      "기존 신청 정보가 복사되었습니다. 필요한 내용을 수정 후 신청해주세요."
    );
  };

  // 아카이브 확인
  const confirmArchive = () => {
    if (!showArchiveModal.requestId) return;

    // 실제 구현에서는 API 호출로 상태 업데이트
    console.log(`Archive request ${showArchiveModal.requestId}`);
    alert("반려된 신청이 처리 완료되었습니다.");

    setShowArchiveModal({ show: false, requestId: null });
  };

  // 승인/반려 확인
  const confirmApproval = () => {
    if (!showApprovalModal.requestId || !showApprovalModal.action) return;

    if (showApprovalModal.action === "reject" && !rejectionReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    // 실제 구현에서는 API 호출
    console.log(
      `Request ${showApprovalModal.requestId} ${showApprovalModal.action}`,
      {
        rejectionReason:
          showApprovalModal.action === "reject" ? rejectionReason : null,
      }
    );

    if (showApprovalModal.action === "approve") {
      // 승인 시 자동으로 pending 상태로 전환
      alert("출금 신청이 승인되어 출금 처리 대기 상태로 전환되었습니다.");

      // 실제로는 API를 통해 상태 업데이트: status: "approved" → "pending"
      // updateRequestStatus(showApprovalModal.requestId, "pending");
    } else {
      alert("출금 신청이 반려되었습니다.");
    }

    setShowApprovalModal({ show: false, requestId: null, action: null });
    setRejectionReason("");
  };

  // 팝업 닫기
  const closeApprovalModal = () => {
    setShowApprovalModal({ show: false, requestId: null, action: null });
    setRejectionReason("");
  };

  // 필터 기능 제거 - 모든 요청 표시
  const filteredRequests = mockRequests;

  if (plan !== "enterprise") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            출금 관리 시스템
          </h3>
          <p className="text-gray-500 mb-4">
            엔터프라이즈 플랜에서만 사용 가능한 기능입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">단계별 출금 관리</h1>
          <p className="text-gray-600 mt-1">
            보안과 효율성을 모두 갖춘 기업용 출금 시스템
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            출금 신청
          </button>
        </div>
      </div>

      {/* 출금 프로세스 플로우 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          {/* 프로세스 단계들 */}
          <div className="flex items-center justify-between px-4 min-w-max overflow-x-auto">
            {[
              {
                step: 1,
                title: "출금 신청",
                subtitle: "기안자 작성",
                description: "출금 내용, 금액, 주소 입력",
              },
              {
                step: 2,
                title: "결재 승인",
                subtitle: "결재자 승인",
                description: "필수 결재자 순차 승인",
              },
              {
                step: 3,
                title: "출금 대기",
                subtitle: "오출금 방지",
                description: "변심 취소 대응 기간",
              },
              {
                step: 4,
                title: "보안 검증",
                subtitle: "AML/트래블룰",
                description: "이상거래 탐지 및 규제 검사",
              },
              {
                step: 5,
                title: "ABC 서명",
                subtitle: "물리적 격리",
                description: "MPC 분산키 디지털 서명",
              },
              {
                step: 6,
                title: "블록체인 전송",
                subtitle: "네트워크 확인",
                description: "트랜잭션 브로드캐스팅",
              },
            ].map((item, index) => (
              <Fragment key={item.step}>
                {/* 단계 */}
                <div className="flex flex-col items-center group flex-shrink-0">
                  {/* 단계 제목 */}
                  <div className="px-3 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 transition-all hover:from-primary-50 hover:to-primary-100 hover:border-primary-200 hover:shadow-md whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-700 hover:text-primary-700 transition-colors">
                      {item.title}
                    </span>
                  </div>

                  {/* 단계 정보 */}
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* 호버 툴팁 */}
                  <div
                    className={`absolute top-16 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap ${
                      index === 0
                        ? "left-0"
                        : index === 5
                        ? "right-0"
                        : "left-1/2 transform -translate-x-1/2"
                    }`}
                  >
                    {item.description}
                    <div
                      className={`absolute -top-1 w-2 h-2 bg-gray-800 rotate-45 ${
                        index === 0
                          ? "left-4"
                          : index === 5
                          ? "right-4"
                          : "left-1/2 transform -translate-x-1/2"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* 화살표 */}
                {index < 5 && (
                  <div className="mx-6 flex items-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
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
            {
              id: "approval",
              name: "결재 승인 대기",
              icon: CheckCircleIcon,
              count: mockRequests.filter((r) => r.status === "submitted")
                .length,
            },
            {
              id: "airgap",
              name: "출금 처리",
              icon: LockClosedIcon,
              count: mockRequests.filter((r) =>
                ["pending", "processing"].includes(r.status)
              ).length,
            },
            {
              id: "rejected",
              name: "반려/보류 관리",
              icon: XCircleIcon,
              count: mockRequests.filter(
                (r) => r.status === "rejected" || r.status === "archived"
              ).length,
            },
            {
              id: "audit",
              name: "감사 추적",
              icon: EyeIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 결재 승인 탭 */}
      {activeTab === "approval" && (
        <ApprovalTab
          withdrawalRequests={mockRequests}
          onApproval={handleApproval}
        />
      )}

      {/* 출금 처리 탭 */}
      {activeTab === "airgap" && (
        <AirgapTab withdrawalRequests={mockRequests} />
      )}

      {/* 반려/보류 관리 탭 */}
      {activeTab === "rejected" && (
        <RejectedTabComponent
          withdrawalRequests={mockRequests}
          onReapplication={handleReapplication}
          onArchive={handleArchive}
        />
      )}

      {/* 감사 추적 탭 */}
      {activeTab === "audit" && <AuditTab withdrawalRequests={mockRequests} />}

      {/* 출금 신청 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                새 출금 신청
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateRequest();
              }}
              className="space-y-4"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="출금 목적을 간략히 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출금 네트워크 *
                  </label>
                  <select
                    value={newRequest.network}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        network: e.target.value,
                        currency: "",
                        toAddress: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">네트워크를 선택하세요</option>
                    <option value="Bitcoin">Bitcoin Network</option>
                    <option value="Ethereum">Ethereum Network</option>
                    <option value="Solana">Solana Network</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출금 자산 *
                  </label>
                  <select
                    value={newRequest.currency}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        currency: e.target.value,
                        toAddress: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!newRequest.network}
                  >
                    <option value="">
                      {newRequest.network
                        ? "자산을 선택하세요"
                        : "먼저 네트워크를 선택하세요"}
                    </option>
                    {newRequest.network &&
                      networkAssets[
                        newRequest.network as keyof typeof networkAssets
                      ]?.map((asset) => (
                        <option key={asset.value} value={asset.value}>
                          {asset.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출금 금액 *
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    required
                    value={newRequest.amount}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 주소 *
                </label>
                <div className="space-y-2">
                  {whitelistedAddresses
                    .filter(
                      (addr) =>
                        addr.network === newRequest.network &&
                        addr.coin === newRequest.currency
                    )
                    .map((address) => (
                      <div
                        key={address.id}
                        onClick={() =>
                          setNewRequest({
                            ...newRequest,
                            toAddress: address.address,
                          })
                        }
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          newRequest.toAddress === address.address
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${address.coin.toLowerCase()}.png`}
                              alt={address.coin}
                              className="w-5 h-5 rounded-full mr-2"
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).src = `data:image/svg+xml;base64,${btoa(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                  <circle cx="10" cy="10" r="10" fill="#f3f4f6"/>
                                  <text x="10" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#6b7280">
                                    ${address.coin}
                                  </text>
                                </svg>
                              `)}`;
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {address.label}
                              </div>
                              <div className="text-xs font-mono text-gray-500">
                                {address.address.length > 30
                                  ? `${address.address.slice(
                                      0,
                                      15
                                    )}...${address.address.slice(-15)}`
                                  : address.address}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              address.type === "personal"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {address.type === "personal" ? "개인지갑" : "VASP"}
                          </span>
                        </div>
                      </div>
                    ))}

                  {newRequest.network &&
                    newRequest.currency &&
                    whitelistedAddresses.filter(
                      (addr) =>
                        addr.network === newRequest.network &&
                        addr.coin === newRequest.currency
                    ).length === 0 && (
                      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-gray-500 text-sm">
                          {newRequest.network} 네트워크의 {newRequest.currency}{" "}
                          자산에 대한 등록된 출금 주소가 없습니다.
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          보안 설정에서 출금 주소를 먼저 등록해주세요.
                        </p>
                      </div>
                    )}

                  {(!newRequest.network || !newRequest.currency) && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">
                        네트워크와 자산을 먼저 선택해주세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위 *
                </label>
                <select
                  value={newRequest.priority}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">낮음 - 일반 출금</option>
                  <option value="medium">보통 - 정기 업무</option>
                  <option value="high">높음 - 중요 거래</option>
                  <option value="critical">긴급 - 즉시 처리</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명 *
                </label>
                <textarea
                  required
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="출금 목적과 상세 내용을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm font-medium">
                    보안 알림
                  </p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  모든 출금은 필수 결재자의 승인을 받아야 하며, Air-gap 환경에서
                  최종 서명이 진행됩니다.
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

      {/* 승인/반려 확인 팝업 */}
      {showApprovalModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showApprovalModal.action === "approve"
                    ? "승인 확인"
                    : "반려 확인"}
                </h3>
                <button
                  onClick={closeApprovalModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {(() => {
                const request = mockRequests.find(
                  (r) => r.id === showApprovalModal.requestId
                );
                if (!request) return null;

                return (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {request.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">신청 ID:</span>
                          <span className="ml-1 font-medium">
                            #{request.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">기안자:</span>
                          <span className="ml-1 font-medium">
                            {request.initiator}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">출금 금액:</span>
                          <span className="ml-1 font-medium">
                            {formatAmount(request.amount, request.currency)}{" "}
                            {request.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {showApprovalModal.action === "approve" ? (
                      <div>
                        <p className="text-gray-700 mb-4">
                          위 출금 신청을{" "}
                          <span className="font-semibold text-green-600">
                            승인
                          </span>
                          하시겠습니까?
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start">
                            <svg
                              className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">
                                승인 후 처리 과정
                              </p>
                              <p>
                                승인 완료 시 자동으로 출금 처리(출금대기,
                                보안검증, 전송완료)가 진행됩니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 mb-4">
                          위 출금 신청을{" "}
                          <span className="font-semibold text-red-600">
                            반려
                          </span>
                          하시겠습니까?
                        </p>
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            반려 사유 <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="반려 사유를 상세히 입력해주세요."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={4}
                          />
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex items-start">
                              <svg
                                className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">
                                  반려 처리 안내
                                </p>
                                <p>
                                  반려된 출금 신청은 기안자에게 알림이 전송되며,
                                  수정 후 재신청이 가능합니다.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={closeApprovalModal}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={confirmApproval}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${
                          showApprovalModal.action === "approve"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {showApprovalModal.action === "approve"
                          ? "승인하기"
                          : "반려하기"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 재신청 확인 팝업 */}
      {showReapplicationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  재신청 확인
                </h3>
                <button
                  onClick={() =>
                    setShowReapplicationModal({ show: false, requestId: null })
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">재신청 안내</p>
                    <p>
                      기존 신청 정보가 복사되어 새로운 신청서가 생성됩니다. 반려
                      사유를 참고하여 필요한 내용을 수정 후 다시 신청해주세요.
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  이 출금 신청을{" "}
                  <span className="font-semibold text-blue-600">재신청</span>
                  하시겠습니까?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setShowReapplicationModal({ show: false, requestId: null })
                  }
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmReapplication}
                  className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  재신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 아카이브 확인 팝업 */}
      {showArchiveModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  처리 완료 확인
                </h3>
                <button
                  onClick={() =>
                    setShowArchiveModal({ show: false, requestId: null })
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <svg
                    className="w-5 h-5 text-gray-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8l4 4L19 2"
                    />
                  </svg>
                  <div className="text-sm text-gray-800">
                    <p className="font-medium mb-1">처리 완료 안내</p>
                    <p>
                      반려된 출금 신청을 처리 완료로 변경합니다. 이후 별도
                      필터를 통해 조회할 수 있습니다.
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  이 반려된 출금 신청을{" "}
                  <span className="font-semibold text-gray-600">처리 완료</span>
                  로 변경하시겠습니까?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setShowArchiveModal({ show: false, requestId: null })
                  }
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmArchive}
                  className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  처리 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  );
}
