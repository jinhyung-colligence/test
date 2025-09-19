import {
  PolicyLog,
  PolicyLogAction,
  PolicyLogChange,
  PolicyLogFilter,
  PolicyLogSummary,
  PolicyLogMetadata
} from '@/types/policyLog';
import { ApprovalPolicy } from '@/utils/approverAssignment';

const POLICY_LOGS_KEY = 'custody_policy_logs';
const MAX_LOGS = 1000; // 최대 로그 개수
const LOG_RETENTION_DAYS = 90; // 로그 보관 기간 (일)

/**
 * 고유 로그 ID 생성
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 브라우저 정보 수집
 */
function getBrowserMetadata(): Pick<PolicyLogMetadata, 'userAgent'> {
  return {
    userAgent: navigator.userAgent
  };
}

/**
 * 정책 변경사항 비교
 */
export function comparePolicy(
  oldPolicy: Partial<ApprovalPolicy>,
  newPolicy: Partial<ApprovalPolicy>
): PolicyLogChange[] {
  const changes: PolicyLogChange[] = [];

  // 비교할 필드 목록
  const fieldsToCompare: (keyof ApprovalPolicy)[] = [
    'description',
    'minAmount',
    'maxAmount',
    'requiredApprovers'
  ];

  fieldsToCompare.forEach(field => {
    const oldValue = oldPolicy[field];
    const newValue = newPolicy[field];

    // 배열 비교 (결재자 목록)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue: [...oldValue],
          newValue: [...newValue]
        });
      }
    }
    // 일반 값 비교
    else if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue,
        newValue
      });
    }
  });

  return changes;
}

/**
 * 정책 로그 생성
 */
export function createPolicyLog(
  action: PolicyLogAction,
  policyId: string,
  policyDescription: string,
  userId: string,
  userName: string,
  changes: PolicyLogChange[] = [],
  additionalMetadata: Partial<PolicyLogMetadata> = {}
): PolicyLog {
  return {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    action,
    policyId,
    policyDescription,
    userId,
    userName,
    changes,
    metadata: {
      ...getBrowserMetadata(),
      ...additionalMetadata
    }
  };
}

/**
 * 로그를 localStorage에 저장
 */
export function savePolicyLog(log: PolicyLog): void {
  try {
    const existingLogs = getPolicyLogs();
    const updatedLogs = [log, ...existingLogs];

    // 최대 로그 수 제한
    const trimmedLogs = updatedLogs.slice(0, MAX_LOGS);

    localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('정책 로그 저장 실패:', error);
  }
}

/**
 * 목업 데이터 생성 (개발 및 테스트용)
 */
function generateMockLogs(): PolicyLog[] {
  const now = new Date();
  const mockLogs: PolicyLog[] = [
    {
      id: 'log_mock_1',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5분 전
      action: 'CREATE',
      policyId: 'KRW-mock-1',
      policyDescription: '고액 거래 정책',
      userId: '1',
      userName: '김대표',
      changes: [
        { field: 'description', oldValue: null, newValue: '고액 거래 정책' },
        { field: 'minAmount', oldValue: null, newValue: 10000000 },
        { field: 'maxAmount', oldValue: null, newValue: Infinity },
        { field: 'requiredApprovers', oldValue: [], newValue: ['김대표', '박재무', '윤보안', '이기술', '송컴플'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '신규 고액 거래 정책 생성'
      }
    },
    {
      id: 'log_mock_2',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15분 전
      action: 'UPDATE',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'maxAmount', oldValue: 100000, newValue: 200000 },
        { field: 'requiredApprovers', oldValue: ['박재무'], newValue: ['박재무', '윤보안'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '한도 상향 조정'
      }
    },
    {
      id: 'log_mock_3',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30분 전
      action: 'DELETE',
      policyId: 'KRW-old-policy',
      policyDescription: '임시 정책',
      userId: '3',
      userName: '윤보안',
      changes: [
        {
          field: 'entire_policy',
          oldValue: {
            description: '임시 정책',
            minAmount: 0,
            maxAmount: 50000,
            requiredApprovers: ['윤보안']
          },
          newValue: null
        }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책 통합으로 인한 삭제'
      }
    },
    {
      id: 'log_mock_4',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45분 전
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'description', oldValue: '중간 거래', newValue: '중간 금액 거래' },
        { field: 'requiredApprovers', oldValue: ['박재무', '윤보안'], newValue: ['박재무', '윤보안', '이기술'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책명 명확화 및 결재자 추가'
      }
    },
    {
      id: 'log_mock_5',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1시간 전
      action: 'CREATE',
      policyId: 'KRW-mock-2',
      policyDescription: '특별 승인 정책',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'description', oldValue: null, newValue: '특별 승인 정책' },
        { field: 'minAmount', oldValue: null, newValue: 5000000 },
        { field: 'maxAmount', oldValue: null, newValue: 10000000 },
        { field: 'requiredApprovers', oldValue: [], newValue: ['김대표', '송컴플'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '특별한 거래를 위한 승인 정책'
      }
    }
  ];

  return mockLogs;
}

/**
 * localStorage에서 모든 로그 조회
 */
export function getPolicyLogs(): PolicyLog[] {
  try {
    const logsJson = localStorage.getItem(POLICY_LOGS_KEY);
    let logs: PolicyLog[] = [];

    if (logsJson) {
      logs = JSON.parse(logsJson);
    } else {
      // 로그가 없으면 목업 데이터로 초기화
      logs = generateMockLogs();
      localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(logs));
    }

    // 만료된 로그 제거
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const validLogs = logs.filter(log =>
      new Date(log.timestamp) > cutoffDate
    );

    // 만료된 로그가 있으면 업데이트
    if (validLogs.length !== logs.length) {
      localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(validLogs));
    }

    return validLogs;
  } catch (error) {
    console.error('정책 로그 조회 실패:', error);
    return [];
  }
}

/**
 * 필터를 적용하여 로그 조회
 */
export function getFilteredPolicyLogs(filter: PolicyLogFilter): PolicyLog[] {
  const allLogs = getPolicyLogs();

  return allLogs.filter(log => {
    // 날짜 필터
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      if (new Date(log.timestamp) < startDate) return false;
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // 하루 끝까지
      if (new Date(log.timestamp) > endDate) return false;
    }

    // 액션 타입 필터
    if (filter.action && filter.action !== 'ALL') {
      if (log.action !== filter.action) return false;
    }

    // 사용자 필터
    if (filter.userId) {
      if (log.userId !== filter.userId) return false;
    }

    // 정책 ID 필터
    if (filter.policyId) {
      if (log.policyId !== filter.policyId) return false;
    }

    return true;
  });
}

/**
 * 로그 통계 생성
 */
export function getPolicyLogSummary(): PolicyLogSummary {
  const logs = getPolicyLogs();

  const createCount = logs.filter(log => log.action === 'CREATE').length;
  const updateCount = logs.filter(log => log.action === 'UPDATE').length;
  const suspendCount = logs.filter(log => log.action === 'SUSPEND').length;

  const uniqueUsers = new Set(logs.map(log => log.userId)).size;

  const lastActivity = logs.length > 0
    ? logs[0].timestamp // 최신순으로 정렬되어 있음
    : '';

  return {
    totalLogs: logs.length,
    createCount,
    updateCount,
    suspendCount,
    uniqueUsers,
    lastActivity
  };
}

/**
 * 로그를 CSV 형식으로 내보내기
 */
export function exportLogsToCSV(logs: PolicyLog[]): string {
  const headers = [
    '로그 ID',
    '시간',
    '액션',
    '정책 ID',
    '정책 설명',
    '사용자 ID',
    '사용자명',
    '변경 내용',
    '사유'
  ];

  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toLocaleString('ko-KR'),
    log.action,
    log.policyId,
    log.policyDescription,
    log.userId,
    log.userName,
    log.changes.map(change =>
      `${change.field}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`
    ).join('; '),
    log.metadata.reason || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * CSV 파일 다운로드
 */
export function downloadLogsAsCSV(logs: PolicyLog[], filename?: string): void {
  const csvContent = exportLogsToCSV(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `policy_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * 로그 모두 삭제 (관리자 전용)
 */
export function clearAllPolicyLogs(): void {
  localStorage.removeItem(POLICY_LOGS_KEY);
}

/**
 * 목업 데이터로 초기화 (개발용)
 */
export function initializeMockData(): void {
  const mockLogs = generateMockLogs();
  localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(mockLogs));
}

/**
 * 특정 정책의 로그만 조회
 */
export function getPolicyLogsByPolicyId(policyId: string): PolicyLog[] {
  return getFilteredPolicyLogs({ policyId });
}

/**
 * 최근 활동 로그 조회 (최대 N개)
 */
export function getRecentPolicyLogs(limit: number = 10): PolicyLog[] {
  const logs = getPolicyLogs();
  return logs.slice(0, limit);
}