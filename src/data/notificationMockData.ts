import { NotificationLog, NotificationTemplate } from "@/utils/notificationSystem";

export const MOCK_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: "log-001",
    template: "approval_pending",
    recipient: "cfo@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    retryCount: 0,
    withdrawalId: "WD-2024-001",
    subject: "출금 승인 요청 - 1,000,000 KRW",
    body: "출금 신청이 승인 대기 중입니다."
  },
  {
    id: "log-002",
    template: "approval_overdue",
    recipient: "ciso@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
    retryCount: 1,
    withdrawalId: "WD-2024-002",
    subject: "출금 승인 지연 알림 - 5,000,000 KRW",
    body: "승인이 2시간 지연되었습니다."
  },
  {
    id: "log-003",
    template: "approval_completed",
    recipient: "requester@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4시간 전
    retryCount: 0,
    withdrawalId: "WD-2024-003",
    subject: "출금 승인 완료 - 2,500,000 KRW",
    body: "모든 승인이 완료되었습니다."
  },
  {
    id: "log-004",
    template: "approval_rejected",
    recipient: "requester@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6시간 전
    retryCount: 0,
    withdrawalId: "WD-2024-004",
    subject: "출금 신청 반려 - 10,000,000 KRW",
    body: "출금 신청이 반려되었습니다."
  },
  {
    id: "log-005",
    template: "emergency_approval",
    recipient: "cfo@company.com",
    channel: "email",
    status: "failed",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8시간 전
    retryCount: 2,
    withdrawalId: "WD-2024-005",
    subject: "긴급 출금 승인 요청 - 50,000,000 KRW",
    body: "긴급 승인이 필요합니다.",
    error: "SMTP 서버 연결 실패"
  },
  {
    id: "log-006",
    template: "approval_pending",
    recipient: "cto@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12시간 전
    retryCount: 0,
    withdrawalId: "WD-2024-006",
    subject: "출금 승인 요청 - 3,200,000 KRW",
    body: "새로운 출금 승인 요청입니다."
  },
  {
    id: "log-007",
    template: "approval_overdue",
    recipient: "ciso@company.com",
    channel: "email",
    status: "retry",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14시간 전
    retryCount: 1,
    withdrawalId: "WD-2024-007",
    subject: "출금 승인 지연 알림 - 8,000,000 KRW",
    body: "승인 지연으로 재발송합니다."
  },
  {
    id: "log-008",
    template: "approval_completed",
    recipient: "finance@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18시간 전
    retryCount: 0,
    withdrawalId: "WD-2024-008",
    subject: "출금 처리 완료 - 1,500,000 KRW",
    body: "출금이 성공적으로 처리되었습니다."
  },
  {
    id: "log-009",
    template: "emergency_approval",
    recipient: "ceo@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20시간 전
    retryCount: 0,
    withdrawalId: "WD-2024-009",
    subject: "긴급 출금 승인 요청 - 100,000,000 KRW",
    body: "대규모 긴급 출금 승인이 필요합니다."
  },
  {
    id: "log-010",
    template: "approval_pending",
    recipient: "manager@company.com",
    channel: "email",
    status: "failed",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24시간 전
    retryCount: 3,
    withdrawalId: "WD-2024-010",
    subject: "출금 승인 요청 - 750,000 KRW",
    body: "출금 승인 요청 메일입니다.",
    error: "수신자 메일 주소 오류"
  }
];

export const MOCK_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "approval_pending",
    name: "승인 대기 알림",
    trigger: "출금 신청 시 승인자에게 발송",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 요청 - {{amount}} {{currency}}",
    body: `안녕하세요, {{approverName}}님

새로운 출금 승인 요청이 있습니다.

**출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 출금 주소: {{toAddress}}
- 신청 시간: {{initiatedAt}}
- 우선순위: {{priority}}

승인 또는 반려 처리를 위해 시스템에 접속해 주세요.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "toAddress", "initiatedAt", "priority"]
  },
  {
    id: "approval_overdue",
    name: "승인 지연 알림",
    trigger: "승인 지연 시 담당자에게 발송",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 지연 알림 - {{amount}} {{currency}}",
    body: `안녕하세요, {{approverName}}님

출금 승인이 {{overdueHours}}시간 지연되었습니다.

**지연된 출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 신청 시간: {{initiatedAt}}
- 지연 시간: {{overdueHours}}시간

신속한 승인 처리를 부탁드립니다.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "initiatedAt", "overdueHours"]
  },
  {
    id: "approval_completed",
    name: "승인 완료 알림",
    trigger: "모든 승인 완료 시 신청자에게 발송",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 완료 - {{amount}} {{currency}}",
    body: `안녕하세요, {{initiator}}님

출금 신청이 모든 승인자로부터 승인되었습니다.

**승인된 출금 정보**
- 금액: {{amount}} {{currency}}
- 출금 주소: {{toAddress}}
- 최종 승인 시간: {{completedAt}}

곧 출금 처리가 진행될 예정입니다.

감사합니다.`,
    variables: ["initiator", "amount", "currency", "toAddress", "completedAt"]
  },
  {
    id: "approval_rejected",
    name: "승인 반려 알림",
    trigger: "승인 반려 시 신청자에게 발송",
    enabled: true,
    channels: ["email"],
    subject: "출금 신청 반려 - {{amount}} {{currency}}",
    body: `안녕하세요, {{initiator}}님

출금 신청이 반려되었습니다.

**반려된 출금 정보**
- 금액: {{amount}} {{currency}}
- 반려자: {{rejectedBy}}
- 반려 시간: {{rejectedAt}}
- 반려 사유: {{rejectionReason}}

문의사항이 있으시면 관리자에게 연락해 주세요.

감사합니다.`,
    variables: ["initiator", "amount", "currency", "rejectedBy", "rejectedAt", "rejectionReason"]
  },
  {
    id: "emergency_approval",
    name: "긴급 승인 알림",
    trigger: "긴급 출금 시 승인자에게 발송",
    enabled: true,
    channels: ["email"],
    subject: "🚨 긴급 출금 승인 요청 - {{amount}} {{currency}}",
    body: `안녕하세요, {{approverName}}님

긴급 출금 승인 요청입니다.

**긴급 출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 긴급 사유: {{emergencyReason}}
- 신청 시간: {{initiatedAt}}

가능한 한 빠른 승인 처리를 부탁드립니다.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "emergencyReason", "initiatedAt"]
  }
];