import { useState, useCallback } from "react";
import { WhitelistedAddress, AddressFormData, AddressDirection } from "@/types/address";

// 초기 목업 데이터
const mockWithdrawalAddresses: WhitelistedAddress[] = [
  {
    id: "1",
    label: "메인 BTC 지갑",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    coin: "BTC",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2025-01-15",
    lastUsed: "2025-01-20",
    txCount: 5,
    withdrawalSettings: {
      dailyLimit: 1000000,
      requiresApproval: false,
      travelRuleCompliant: true,
    },
  },
  {
    id: "2",
    label: "이더리움 스테이킹 주소",
    address: "0x742d35Cc6634C0532925a3b8D3aC6Bb1b5f1D84F",
    coin: "ETH",
    type: "personal",
    direction: "withdrawal",
    addedAt: "2025-01-10",
    txCount: 3,
    withdrawalSettings: {
      requiresApproval: true,
      travelRuleCompliant: true,
    },
  },
  {
    id: "3",
    label: "바이낸스 출금",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    coin: "USDT",
    type: "vasp",
    direction: "withdrawal",
    addedAt: "2025-01-12",
    lastUsed: "2025-01-18",
    txCount: 8,
    withdrawalSettings: {
      dailyLimit: 5000000,
      requiresApproval: false,
      travelRuleCompliant: true,
    },
  },
];

const mockDepositAddresses: WhitelistedAddress[] = [
  {
    id: "4",
    label: "거래소 입금 주소",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    coin: "BTC",
    type: "vasp",
    direction: "deposit",
    addedAt: "2025-01-20",
    lastUsed: "2025-01-22",
    txCount: 12,
    depositSettings: {
      autoProcess: true,
      minAmount: 0.001,
      notificationEnabled: true,
      trusted: true,
    },
  },
  {
    id: "5",
    label: "개인 이더리움 지갑",
    address: "0x8ba1f109551bD432803012645Hac136c22C501Ae",
    coin: "ETH",
    type: "personal",
    direction: "deposit",
    addedAt: "2025-01-18",
    txCount: 2,
    depositSettings: {
      autoProcess: false,
      minAmount: 0.01,
      notificationEnabled: true,
      trusted: false,
    },
  },
];

export function useAddressManagement() {
  const [withdrawalAddresses, setWithdrawalAddresses] = useState<WhitelistedAddress[]>(mockWithdrawalAddresses);
  const [depositAddresses, setDepositAddresses] = useState<WhitelistedAddress[]>(mockDepositAddresses);

  const addAddress = useCallback((formData: AddressFormData) => {
    const newAddress: WhitelistedAddress = {
      id: Date.now().toString(),
      label: formData.label,
      address: formData.address,
      coin: formData.coin,
      type: formData.type as "personal" | "vasp",
      direction: formData.direction,
      addedAt: new Date().toISOString().split("T")[0],
      txCount: 0,
    };

    if (formData.direction === "withdrawal") {
      newAddress.withdrawalSettings = {
        dailyLimit: formData.dailyLimit,
        requiresApproval: formData.requiresApproval || false,
        travelRuleCompliant: true,
      };
      setWithdrawalAddresses(prev => [...prev, newAddress]);
    } else {
      newAddress.depositSettings = {
        autoProcess: formData.autoProcess || false,
        minAmount: formData.minAmount,
        notificationEnabled: formData.notificationEnabled || true,
        trusted: formData.trusted || false,
      };
      setDepositAddresses(prev => [...prev, newAddress]);
    }
  }, []);

  const deleteAddress = useCallback((id: string, direction: AddressDirection) => {
    if (direction === "withdrawal") {
      setWithdrawalAddresses(prev => prev.filter(addr => addr.id !== id));
    } else {
      setDepositAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  }, []);

  const updateAddress = useCallback((id: string, updates: Partial<WhitelistedAddress>) => {
    const updateFn = (prev: WhitelistedAddress[]) =>
      prev.map(addr => addr.id === id ? { ...addr, ...updates } : addr);

    const address = [...withdrawalAddresses, ...depositAddresses].find(addr => addr.id === id);
    if (address?.direction === "withdrawal") {
      setWithdrawalAddresses(updateFn);
    } else {
      setDepositAddresses(updateFn);
    }
  }, [withdrawalAddresses, depositAddresses]);

  const getCoinColor = useCallback((coin: string) => {
    const colors = {
      BTC: "bg-orange-100 text-orange-800",
      ETH: "bg-blue-100 text-blue-800",
      SOL: "bg-purple-100 text-purple-800",
      USDT: "bg-sky-100 text-sky-800",
      USDC: "bg-indigo-100 text-indigo-800",
    };
    return colors[coin as keyof typeof colors] || "bg-gray-100 text-gray-800";
  }, []);

  return {
    withdrawalAddresses,
    depositAddresses,
    addAddress,
    deleteAddress,
    updateAddress,
    getCoinColor,
  };
}