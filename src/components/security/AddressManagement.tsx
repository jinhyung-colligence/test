"use client";

import { useState } from "react";
import {
  WalletIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp";
  addedAt: string;
  lastUsed?: string;
  txCount: number;
}

export default function AddressManagement() {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTravelRuleWarning, setShowTravelRuleWarning] = useState(false);
  const [addressType, setAddressType] = useState<"personal" | "vasp" | "">("");
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    coin: "BTC",
    type: "" as "personal" | "vasp" | "",
  });

  const [whitelistedAddresses, setWhitelistedAddresses] = useState<WhitelistedAddress[]>([
    {
      id: "1",
      label: "메인 BTC 지갑",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      coin: "BTC",
      type: "personal",
      addedAt: "2025-01-15",
      lastUsed: "2025-01-20",
      txCount: 5,
    },
    {
      id: "2",
      label: "이더리움 스테이킹 주소",
      address: "0x742d35Cc6634C0532925a3b8D3aC6Bb1b5f1D84F",
      coin: "ETH",
      type: "personal",
      addedAt: "2025-01-10",
      txCount: 3,
    },
    {
      id: "3",
      label: "바이낸스 출금",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      coin: "USDT",
      type: "vasp",
      addedAt: "2025-01-12",
      lastUsed: "2025-01-18",
      txCount: 8,
    },
  ]);

  const getCoinColor = (coin: string) => {
    const colors = {
      BTC: "bg-orange-100 text-orange-800",
      ETH: "bg-blue-100 text-blue-800",
      SOL: "bg-purple-100 text-purple-800",
      USDT: "bg-green-100 text-green-800",
      USDC: "bg-indigo-100 text-indigo-800",
    };
    return colors[coin as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleShowTravelRuleWarning = () => {
    setShowTravelRuleWarning(true);
  };

  const handleAcceptTravelRule = () => {
    setShowTravelRuleWarning(false);
    setShowAddressModal(true);
  };

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address && newAddress.type) {
      const address: WhitelistedAddress = {
        id: Date.now().toString(),
        label: newAddress.label,
        address: newAddress.address,
        coin: newAddress.coin,
        type: newAddress.type,
        addedAt: new Date().toISOString().split("T")[0],
        txCount: 0,
      };
      setWhitelistedAddresses([...whitelistedAddresses, address]);
      setNewAddress({ label: "", address: "", coin: "BTC", type: "" });
      setShowAddressModal(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setWhitelistedAddresses(
      whitelistedAddresses.filter((addr) => addr.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* 출금 주소 화이트리스트 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <WalletIcon className="h-6 w-6 mr-2 text-primary-600" />
              출금 주소 화이트리스트
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              사전 등록된 주소로만 출금을 허용하여 보안을 강화합니다
            </p>
          </div>
          <button
            onClick={handleShowTravelRuleWarning}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            주소 추가
          </button>
        </div>

        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  라벨/주소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  타입
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {whitelistedAddresses.map((addr) => (
                <tr key={addr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {addr.label}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {addr.address.substring(0, 20)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCoinColor(
                        addr.coin
                      )}`}
                    >
                      {addr.coin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        addr.type === "personal"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {addr.type === "personal" ? "개인" : "거래소"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(addr.addedAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {addr.txCount}회
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {whitelistedAddresses.length === 0 && (
            <div className="text-center py-8">
              <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">등록된 출금 주소가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Travel Rule 경고 모달 */}
      {showTravelRuleWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-start mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Travel Rule 준수 안내
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    FATF Travel Rule에 따라 KRW 100만원 상당 이상의 가상자산
                    이체 시 다음 정보가 필요합니다:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>수취인(받는 사람)의 실명</li>
                    <li>수취인의 가상자산사업자(VASP) 정보</li>
                    <li>수취인의 계좌 정보</li>
                    <li>거래 목적 및 자금 출처</li>
                  </ul>
                  <p className="font-medium text-amber-700">
                    개인 간 거래나 자체 지갑으로의 이체도 위 규정을 준수해야
                    합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    사전 주소 등록 권장
                  </p>
                  <p className="text-amber-700">
                    자주 사용하는 주소는 미리 등록해 두시면 더 빠른 출금이
                    가능합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTravelRuleWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAcceptTravelRule}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                이해했습니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 주소 추가 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">주소 추가</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAddress();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  라벨 *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: 메인 BTC 지갑"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 *
                </label>
                <textarea
                  required
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="출금할 주소를 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코인 *
                </label>
                <select
                  value={newAddress.coin}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, coin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타입 *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="addressType"
                      value="personal"
                      checked={newAddress.type === "personal"}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          type: e.target.value as "personal" | "vasp",
                        })
                      }
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">개인 지갑</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="addressType"
                      value="vasp"
                      checked={newAddress.type === "vasp"}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          type: e.target.value as "personal" | "vasp",
                        })
                      }
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">거래소/VASP</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}