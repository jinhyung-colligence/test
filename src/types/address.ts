export interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp";
  direction: "withdrawal" | "deposit";
  addedAt: string;
  lastUsed?: string;
  txCount: number;

  // 입금 주소 전용 필드
  depositSettings?: {
    autoProcess: boolean;
    minAmount?: number;
    notificationEnabled: boolean;
    trusted: boolean;
  };

  // 출금 주소 전용 필드
  withdrawalSettings?: {
    dailyLimit?: number;
    requiresApproval: boolean;
    travelRuleCompliant: boolean;
  };
}

export interface AddressFormData {
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp" | "";
  direction: "withdrawal" | "deposit";

  // 입금 설정
  autoProcess?: boolean;
  minAmount?: number;
  notificationEnabled?: boolean;
  trusted?: boolean;

  // 출금 설정
  dailyLimit?: number;
  requiresApproval?: boolean;
}

export type AddressDirection = "withdrawal" | "deposit";