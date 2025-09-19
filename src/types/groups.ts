export type GroupType = "department" | "project" | "team";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "draft";
export type GroupStatus = "pending" | "approved" | "rejected" | "active" | "archived";
export type CryptoCurrency = 'KRW' | 'SOL';
export type BudgetType = 'monthly' | 'quarterly' | 'yearly';

export interface ApprovalRecord {
  userId: string;
  userName: string;
  approvedAt: string;
}

export interface RejectionRecord {
  userId: string;
  userName: string;
  rejectedAt: string;
  reason: string;
}

export interface CryptoAmount {
  amount: number;
  currency: CryptoCurrency;
}

export interface BudgetPeriod {
  type: BudgetType;
  amount: CryptoAmount;
}

export interface MonthlyBudget {
  month: number; // 1-12
  amount: number;
}

export interface QuarterlyBudget {
  quarter: number; // 1-4
  amount: number;
}

export interface BudgetSetup {
  year: number;
  baseType: 'yearly' | 'quarterly' | 'monthly'; // 기준 예산 타입
  baseAmount: number;
  currency: CryptoCurrency;

  // 선택된 분기/월 (baseType이 quarterly/monthly일 때)
  selectedQuarter?: number; // 1-4
  selectedMonth?: number;   // 1-12

  // 자동 분배된 예산
  yearlyBudget?: number;
  quarterlyBudgets: QuarterlyBudget[];
  monthlyBudgets: MonthlyBudget[];

  // 남은 기간 정보
  remainingMonths: number[];
  remainingQuarters: number[];

  // 계산된 날짜 범위
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

export interface WalletGroup {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  balance: CryptoAmount;
  monthlyBudget: CryptoAmount;
  quarterlyBudget: CryptoAmount;
  yearlyBudget: CryptoAmount;
  budgetUsed: CryptoAmount;
  quarterlyBudgetUsed: CryptoAmount;
  yearlyBudgetUsed: CryptoAmount;

  // New budget setup configurations
  budgetSetup?: BudgetSetup;
  budgetPeriods?: BudgetPeriod[];

  members: string[];
  manager: string;
  createdAt: string;
  status?: GroupStatus;
  requestedBy?: string;
  requestedAt?: string;
  requiredApprovals?: string[];
  approvals?: ApprovalRecord[];
  rejections?: RejectionRecord[];
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
}

export interface GroupCreationRequest {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  monthlyBudget: CryptoAmount;
  quarterlyBudget: CryptoAmount;
  yearlyBudget: CryptoAmount;

  // New budget setup configurations
  budgetSetup?: BudgetSetup;
  budgetPeriods?: BudgetPeriod[];

  manager: string;
  status: GroupStatus;
  requestedBy: string;
  requestedAt: string;
  requiredApprovals: string[];
  approvals: ApprovalRecord[];
  rejections: RejectionRecord[];
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
}

export interface ExpenseRequest {
  id: string;
  groupId: string;
  title: string;
  amount: CryptoAmount;
  description: string;
  category: string;
  requestedBy: string;
  requestedAt: string;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;

  // 결재 관련
  requiredApprovals?: string[];
  approvals?: Array<{
    userId: string;
    userName: string;
    approvedAt: string;
  }>;
  rejections?: Array<{
    userId: string;
    userName: string;
    rejectedAt: string;
    reason: string;
  }>;
}