export type WithdrawalStatus =
  | "draft" // 임시저장
  | "submitted" // 출금 신청
  | "approved" // 결재 완료
  | "pending" // 출금 대기
  | "processing" // 출금 진행 (Air-gap)
  | "completed" // 출금 완료
  | "rejected" // 반려
  | "archived" // 처리 완료 (반료 후 아카이브)
  | "cancelled"; // 취소

export type UserRole =
  | "initiator"
  | "approver"
  | "required_approver"
  | "operator"
  | "admin";

export type Currency =
  | "KRW"
  | "USD"
  | "BTC"
  | "ETH"
  | "USDC"
  | "USDT";

export interface WithdrawalRequest {
  id: string;
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: Currency;
  groupId: string;
  initiator: string;
  initiatedAt: string;
  status: WithdrawalStatus;
  priority: "low" | "medium" | "high" | "critical";
  description: string;

  // 결재 관련
  requiredApprovals: string[];
  approvals: Array<{
    userId: string;
    userName: string;
    role: UserRole;
    approvedAt: string;
    signature?: string;
  }>;
  rejections: Array<{
    userId: string;
    userName: string;
    rejectedAt: string;
    reason: string;
  }>;

  // Air-gap 관련
  airGapSessionId?: string;
  securityReviewBy?: string;
  securityReviewAt?: string;
  signatureCompleted?: boolean;
  txHash?: string;
  blockConfirmations?: number;

  // 재신청 관련
  originalRequestId?: string; // 원본 신청 ID (재신청인 경우)
  reapplicationCount?: number; // 재신청 횟수
  archivedAt?: string; // 아카이브 처리 시간
  archivedBy?: string; // 아카이브 처리자

  // 감사 추적
  auditTrail: Array<{
    timestamp: string;
    action: string;
    userId: string;
    userName?: string;
    details?: string;
    ipAddress?: string;
  }>;
}

export type ServicePlan = "free" | "basic" | "pro" | "premium" | "enterprise" | null;

export interface WithdrawalManagementProps {
  plan: ServicePlan;
}