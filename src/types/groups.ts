export type GroupType = "department" | "project" | "team";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "draft";
export type CryptoCurrency = 'BTC' | 'ETH' | 'SOL' | 'USDC' | 'USDT';

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
}