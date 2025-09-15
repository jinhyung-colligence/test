/**
 * 동적 결재자 할당 유틸리티
 * 금액과 거래 유형에 따라 적절한 결재자들을 자동으로 할당
 */

import { Currency } from "@/types/withdrawal";

export interface ApprovalPolicy {
  minAmount: number;
  maxAmount: number;
  currency: Currency;
  requiredApprovers: string[];
  description: string;
}

export const APPROVAL_POLICIES: ApprovalPolicy[] = [
  {
    minAmount: 0,
    maxAmount: 10000,
    currency: "USD",
    requiredApprovers: ["박CFO", "이CISO"],
    description: "USD 일반 거래 (1만 달러 미만)"
  },
  {
    minAmount: 10000,
    maxAmount: 100000,
    currency: "USD",
    requiredApprovers: ["박CFO", "이CISO", "김CTO"],
    description: "USD 중액 거래 (1만 달러 이상 10만 달러 미만)"
  },
  {
    minAmount: 100000,
    maxAmount: 1000000,
    currency: "USD",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사"],
    description: "USD 고액 거래 (10만 달러 이상 100만 달러 미만)"
  },
  {
    minAmount: 1000000,
    maxAmount: Infinity,
    currency: "USD",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사", "최CEO"],
    description: "USD 초고액 거래 (100만 달러 이상)"
  },
  {
    minAmount: 0,
    maxAmount: 0.1,
    currency: "BTC",
    requiredApprovers: ["박CFO", "이CISO", "김CTO"],
    description: "BTC 소액 거래 (0.1 BTC 미만)"
  },
  {
    minAmount: 0.1,
    maxAmount: 0.2,
    currency: "BTC",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사"],
    description: "BTC 중액 거래 (0.1 BTC 이상 0.2 BTC 미만)"
  },
  {
    minAmount: 0.2,
    maxAmount: Infinity,
    currency: "BTC",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사", "최CEO"],
    description: "BTC 고액 거래 (0.2 BTC 이상)"
  },
  {
    minAmount: 0,
    maxAmount: 1,
    currency: "ETH",
    requiredApprovers: ["박CFO", "이CISO"],
    description: "ETH 소액 거래 (1 ETH 미만)"
  },
  {
    minAmount: 1,
    maxAmount: 5,
    currency: "ETH",
    requiredApprovers: ["박CFO", "이CISO", "김CTO"],
    description: "ETH 중액 거래 (1 ETH 이상 5 ETH 미만)"
  },
  {
    minAmount: 5,
    maxAmount: 10,
    currency: "ETH",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사"],
    description: "ETH 고액 거래 (5 ETH 이상 10 ETH 미만)"
  },
  {
    minAmount: 10,
    maxAmount: Infinity,
    currency: "ETH",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사", "최CEO"],
    description: "ETH 초고액 거래 (10 ETH 이상)"
  },
  {
    minAmount: 0,
    maxAmount: 10000,
    currency: "USDC",
    requiredApprovers: ["박CFO", "이CISO"],
    description: "USDC 일반 거래 (1만 USDC 미만)"
  },
  {
    minAmount: 10000,
    maxAmount: 100000,
    currency: "USDC",
    requiredApprovers: ["박CFO", "이CISO", "김CTO"],
    description: "USDC 중액 거래 (1만 USDC 이상 10만 USDC 미만)"
  },
  {
    minAmount: 100000,
    maxAmount: Infinity,
    currency: "USDC",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사", "최CEO"],
    description: "USDC 고액 거래 (10만 USDC 이상)"
  },
  {
    minAmount: 0,
    maxAmount: 10000,
    currency: "USDT",
    requiredApprovers: ["박CFO", "이CISO"],
    description: "USDT 일반 거래 (1만 USDT 미만)"
  },
  {
    minAmount: 10000,
    maxAmount: 100000,
    currency: "USDT",
    requiredApprovers: ["박CFO", "이CISO", "김CTO"],
    description: "USDT 중액 거래 (1만 USDT 이상 10만 USDT 미만)"
  },
  {
    minAmount: 100000,
    maxAmount: Infinity,
    currency: "USDT",
    requiredApprovers: ["박CFO", "이CISO", "김CTO", "정법무이사", "최CEO"],
    description: "USDT 고액 거래 (10만 USDT 이상)"
  }
];

/**
 * 환율 정보 (실제로는 외부 API에서 가져와야 함)
 */
const EXCHANGE_RATES = {
  USD: 1300,
  BTC: 65000000,
  ETH: 3500000,
  USDC: 1340,
  USDT: 1340
};

/**
 * 모든 금액을 KRW로 변환
 */
export function convertToKRW(amount: number, currency: Currency): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount * rate;
}

/**
 * 금액과 통화에 따라 적절한 결재자 목록을 반환
 */
export function getRequiredApprovers(amount: number, currency: Currency): string[] {
  // 해당 통화의 정책 중에서 금액 범위에 맞는 것 찾기
  const currencyPolicies = APPROVAL_POLICIES.filter(policy => policy.currency === currency);

  const matchedPolicy = currencyPolicies.find(policy =>
    amount >= policy.minAmount && amount < policy.maxAmount
  );

  if (matchedPolicy) {
    return matchedPolicy.requiredApprovers;
  }

  // 매칭되는 정책이 없으면 기본값 (최소 2명)
  return ["박CFO", "이CISO"];
}

/**
 * 특정 거래에 대한 승인 정책 정보를 반환
 */
export function getApprovalPolicyInfo(amount: number, currency: Currency): ApprovalPolicy | null {
  const currencyPolicies = APPROVAL_POLICIES.filter(policy => policy.currency === currency);

  return currencyPolicies.find(policy =>
    amount >= policy.minAmount && amount < policy.maxAmount
  ) || null;
}

/**
 * 거래 유형별 추가 결재자 (특수한 경우)
 */
export interface TransactionTypePolicy {
  type: string;
  additionalApprovers: string[];
  description: string;
}

export const TRANSACTION_TYPE_POLICIES: TransactionTypePolicy[] = [
  {
    type: "cross_border",
    additionalApprovers: ["정법무이사"],
    description: "국경간 거래 - 법무 검토 필수"
  },
  {
    type: "institutional",
    additionalApprovers: ["한비즈데브이사"],
    description: "기관 거래 - 비즈니스 개발팀 검토"
  },
  {
    type: "emergency",
    additionalApprovers: ["최CEO"],
    description: "긴급 거래 - CEO 직접 승인"
  }
];

/**
 * 거래 유형을 고려한 최종 결재자 목록 반환
 */
export function getFinalApprovers(
  amount: number,
  currency: Currency,
  transactionType?: string
): string[] {
  let approvers = getRequiredApprovers(amount, currency);

  // 거래 유형별 추가 결재자 확인
  if (transactionType) {
    const typePolicy = TRANSACTION_TYPE_POLICIES.find(policy => policy.type === transactionType);
    if (typePolicy) {
      // 중복 제거하면서 추가 결재자 포함
      const additionalApprovers = typePolicy.additionalApprovers.filter(
        approver => !approvers.includes(approver)
      );
      approvers = [...approvers, ...additionalApprovers];
    }
  }

  return approvers;
}

/**
 * 정책 설명 텍스트 생성
 */
export function getPolicyDescription(amount: number, currency: Currency, transactionType?: string): string {
  const policy = getApprovalPolicyInfo(amount, currency);
  const baseDescription = policy?.description || "기본 결재 정책";

  if (transactionType) {
    const typePolicy = TRANSACTION_TYPE_POLICIES.find(p => p.type === transactionType);
    if (typePolicy) {
      return `${baseDescription} + ${typePolicy.description}`;
    }
  }

  return baseDescription;
}