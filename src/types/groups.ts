export type GroupType = "department" | "project" | "team";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "draft";
export type GroupStatus = "pending" | "approved" | "rejected" | "active" | "archived";
export type CryptoCurrency = 'BTC' | 'ETH' | 'SOL' | 'USDC' | 'USDT';

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