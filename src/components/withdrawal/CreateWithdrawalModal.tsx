import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface NewRequest {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  network: string;
  coin: string;
  type: "personal" | "exchange" | "vasp";
}

interface NetworkAsset {
  value: string;
  name: string;
}

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: NewRequest) => void;
  newRequest: NewRequest;
  onRequestChange: (request: NewRequest) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
}

export function CreateWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses
}: CreateWithdrawalModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newRequest);
  };

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            새 출금 신청
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 출금 제목 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 제목 *
            </label>
            <input
              type="text"
              required
              value={newRequest.title}
              onChange={(e) =>
                onRequestChange({ ...newRequest, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="출금 목적을 간략히 입력하세요"
            />
          </div>

          {/* 네트워크 및 자산 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 네트워크 *
              </label>
              <select
                value={newRequest.network}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    network: e.target.value,
                    currency: "",
                    toAddress: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">네트워크를 선택하세요</option>
                <option value="Bitcoin">Bitcoin Network</option>
                <option value="Ethereum">Ethereum Network</option>
                <option value="Solana">Solana Network</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 자산 *
              </label>
              <select
                value={newRequest.currency}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    currency: e.target.value,
                    toAddress: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={!newRequest.network}
              >
                <option value="">
                  {newRequest.network
                    ? "자산을 선택하세요"
                    : "먼저 네트워크를 선택하세요"}
                </option>
                {newRequest.network &&
                  networkAssets[
                    newRequest.network as keyof typeof networkAssets
                  ]?.map((asset) => (
                    <option key={asset.value} value={asset.value}>
                      {asset.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* 출금 금액 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 금액 *
              </label>
              <input
                type="number"
                step="0.00000001"
                required
                value={newRequest.amount}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    amount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* 출금 주소 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 주소 *
            </label>
            <div className="space-y-2">
              {whitelistedAddresses
                .filter(
                  (addr) =>
                    addr.network === newRequest.network &&
                    addr.coin === newRequest.currency
                )
                .map((address) => (
                  <div
                    key={address.id}
                    onClick={() =>
                      onRequestChange({
                        ...newRequest,
                        toAddress: address.address,
                      })
                    }
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      newRequest.toAddress === address.address
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CryptoIcon
                          symbol={address.coin}
                          size={20}
                          className="mr-2 flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {address.label}
                          </div>
                          <div className="text-xs font-mono text-gray-500">
                            {address.address.length > 30
                              ? `${address.address.slice(
                                  0,
                                  15
                                )}...${address.address.slice(-15)}`
                              : address.address}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          address.type === "personal"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {address.type === "personal" ? "개인지갑" : "VASP"}
                      </span>
                    </div>
                  </div>
                ))}

              {newRequest.network &&
                newRequest.currency &&
                whitelistedAddresses.filter(
                  (addr) =>
                    addr.network === newRequest.network &&
                    addr.coin === newRequest.currency
                ).length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      {newRequest.network} 네트워크의 {newRequest.currency}{" "}
                      자산에 대한 등록된 출금 주소가 없습니다.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      보안 설정에서 출금 주소를 먼저 등록해주세요.
                    </p>
                  </div>
                )}

              {(!newRequest.network || !newRequest.currency) && (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">
                    네트워크와 자산을 먼저 선택해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 우선순위 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위 *
            </label>
            <select
              value={newRequest.priority}
              onChange={(e) =>
                onRequestChange({
                  ...newRequest,
                  priority: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="low">낮음 - 일반 출금</option>
              <option value="medium">보통 - 정기 업무</option>
              <option value="high">높음 - 중요 거래</option>
              <option value="critical">긴급 - 즉시 처리</option>
            </select>
          </div>

          {/* 상세 설명 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 *
            </label>
            <textarea
              required
              value={newRequest.description}
              onChange={(e) =>
                onRequestChange({
                  ...newRequest,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="출금 목적과 상세 내용을 입력하세요"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              신청 제출
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}