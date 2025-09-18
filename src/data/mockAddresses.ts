import { WhitelistedAddress } from "@/types/address";

export const mockAddresses: WhitelistedAddress[] = [
  // 입금 주소들
  {
    id: "addr_deposit_1",
    label: "메인 비트코인 입금 지갑",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0eshre9jqsh4k5drjqqq4u8x",
    coin: "BTC",
    type: "personal",
    direction: "deposit",
    addedAt: "2024-01-15T09:30:00Z",
    lastUsed: "2024-01-20T14:22:00Z",
    txCount: 12,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 350000,
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_deposit_2",
    label: "이더리움 DeFi 지갑",
    address: "0x742d35Cc6634C0532925a3b844Bc454Bb54dEF0bEb0",
    coin: "ETH",
    type: "personal",
    direction: "deposit",
    addedAt: "2024-01-10T11:45:00Z",
    lastUsed: "2024-01-19T16:30:00Z",
    txCount: 8,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 750000, // 75% 사용 (경고 상태)
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_deposit_3",
    label: "업비트 입금 주소",
    address: "3FKjZPmL8Jk9QqW8eRtYu7Vn2Xs4Hm1cBp6Nd5Av9r",
    coin: "BTC",
    type: "vasp",
    direction: "deposit",
    addedAt: "2024-01-05T08:15:00Z",
    lastUsed: "2025-09-18T10:45:00Z",
    txCount: 25,
    vaspInfo: {
      businessName: "두나무",
      travelRuleConnected: true,
      registrationNumber: "220-88-59156",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_deposit_4",
    label: "USDT 스테이블코인 지갑",
    address: "0xa1b2c3d4e5f6789012345678901234567890abcd",
    coin: "USDT",
    type: "personal",
    direction: "deposit",
    addedAt: "2024-01-12T13:20:00Z",
    lastUsed: "2024-01-18T09:15:00Z",
    txCount: 15,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 920000, // 92% 사용 (주의 상태)
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },

  // 출금 주소들
  {
    id: "addr_withdrawal_1",
    label: "하드웨어 월렛 (Ledger)",
    address: "bc1q9x8y7z6w5v4u3t2s1r0p9o8n7m6l5k4j3h2g1f0",
    coin: "BTC",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-08T10:30:00Z",
    lastUsed: "2024-01-20T15:45:00Z",
    txCount: 6,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 250000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_2",
    label: "바이낸스 출금 주소",
    address: "1A9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T",
    coin: "BTC",
    type: "vasp",
    direction: "withdrawal",
    addedAt: "2024-01-03T14:00:00Z",
    lastUsed: "2024-01-19T11:30:00Z",
    txCount: 18,
    vaspInfo: {
      businessName: "Binance Holdings Limited",
      travelRuleConnected: true,
      registrationNumber: "REG-202030",
      countryCode: "MT",
      complianceScore: 5
    }
  },
  {
    id: "addr_withdrawal_3",
    label: "메타마스크 지갑",
    address: "0x9876543210fedcba0987654321fedcba09876543",
    coin: "ETH",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-14T16:45:00Z",
    lastUsed: "2025-09-18T08:20:00Z",
    txCount: 9,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 780000, // 78% 사용 (경고 상태)
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_4",
    label: "코인베이스 Pro",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    coin: "USDC",
    type: "vasp",
    direction: "withdrawal",
    addedAt: "2024-01-07T12:15:00Z",
    lastUsed: "2024-01-17T14:50:00Z",
    txCount: 22,
    vaspInfo: {
      businessName: "Coinbase Global, Inc.",
      travelRuleConnected: true,
      registrationNumber: "REG-COINBASE-US",
      countryCode: "US",
      complianceScore: 5
    }
  },
  {
    id: "addr_withdrawal_5",
    label: "솔라나 팬텀 지갑",
    address: "DGh7fJ9kLmN4pQrStUvWxYz3AbCdEfGhIjKlMnOpQrSt",
    coin: "SOL",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-11T09:40:00Z",
    lastUsed: "2024-01-16T13:25:00Z",
    txCount: 4,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 120000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_6",
    label: "빗썸 출금 계좌",
    address: "bc1qabcdef1234567890abcdef1234567890abcdef",
    coin: "BTC",
    type: "vasp",
    direction: "withdrawal",
    addedAt: "2024-01-02T11:20:00Z",
    lastUsed: "2024-01-18T17:10:00Z",
    txCount: 31,
    vaspInfo: {
      businessName: "빗썸코리아",
      travelRuleConnected: true,
      registrationNumber: "220-81-62517",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_withdrawal_7",
    label: "트레저 하드웨어 월렛",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    coin: "ETH",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-09T15:30:00Z",
    lastUsed: "2024-01-20T12:45:00Z",
    txCount: 7,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 950000, // 95% 사용 (주의 상태)
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_8",
    label: "코인원 출금 주소",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    coin: "BTC",
    type: "vasp",
    direction: "withdrawal",
    addedAt: "2024-01-06T09:45:00Z",
    lastUsed: "2025-09-18T16:20:00Z",
    txCount: 14,
    vaspInfo: {
      businessName: "코인원",
      travelRuleConnected: true,
      registrationNumber: "229-81-00826",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_withdrawal_9",
    label: "개인 냉동 지갑",
    address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    coin: "BTC",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-13T07:15:00Z",
    lastUsed: "2024-01-15T19:30:00Z",
    txCount: 2,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_10",
    label: "DeFi 유동성 풀",
    address: "0xdef1c0de5555555666666777777888888999999a",
    coin: "USDT",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-16T14:25:00Z",
    lastUsed: "2024-01-19T10:15:00Z",
    txCount: 11,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 650000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_11",
    label: "모바일 지갑 (Trust Wallet)",
    address: "0xabcdef0123456789abcdef0123456789abcdef01",
    coin: "USDC",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-04T18:50:00Z",
    lastUsed: "2024-01-17T15:40:00Z",
    txCount: 19,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 980000, // 98% 사용 (주의 상태)
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_withdrawal_12",
    label: "솔라나 스테이킹 지갑",
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    coin: "SOL",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2024-01-17T20:10:00Z",
    lastUsed: "2024-01-20T09:35:00Z",
    txCount: 5,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 720000, // 72% 사용 (경고 상태)
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  }
];

// 필터링을 위한 헬퍼 함수들
export const getDepositAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.direction === "deposit");
};

export const getWithdrawalAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.direction === "withdrawal");
};

export const getPersonalAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.type === "personal");
};

export const getVASPAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.type === "vasp");
};

export const getAddressesByAsset = (asset: string): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.coin === asset);
};