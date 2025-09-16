import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";

interface NewRequest {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  groupId: string;
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

interface WalletGroup {
  id: string;
  name: string;
  type: string;
  description: string;
  balance: { amount: number; currency: string };
  monthlyBudget: { amount: number; currency: string };
  quarterlyBudget: { amount: number; currency: string };
  yearlyBudget: { amount: number; currency: string };
  budgetUsed: { amount: number; currency: string };
}

interface CreateGroupWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: NewRequest) => void;
  newRequest: NewRequest;
  onRequestChange: (request: NewRequest) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
  groups: WalletGroup[];
}

export function CreateGroupWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses,
  groups
}: CreateGroupWithdrawalModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newRequest);
  };

  // 선택된 그룹 정보 가져오기
  const selectedGroup = groups.find(group => group.id === newRequest.groupId);

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            그룹 지출 신청
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
          {/* 그룹 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 그룹 *
            </label>
            <select
              required
              value={newRequest.groupId}
              onChange={(e) =>
                onRequestChange({ ...newRequest, groupId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">그룹을 선택하세요</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.balance.amount.toLocaleString()} {group.balance.currency}
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 그룹 정보 표시 */}
          {selectedGroup && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedGroup.name}</h4>
                  <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    잔액: {selectedGroup.balance.amount.toLocaleString()} {selectedGroup.balance.currency}
                  </div>
                  {selectedGroup.monthlyBudget.amount > 0 && (
                    <div className="text-xs text-gray-500">
                      월예산: {selectedGroup.monthlyBudget.amount.toLocaleString()} {selectedGroup.monthlyBudget.currency}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${address.coin.toLowerCase()}.png`}
                          alt={address.coin}
                          className="w-5 h-5 rounded-full mr-2"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="10" fill="#f3f4f6"/>
                              <text x="10" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#6b7280">
                                ${address.coin}
                              </text>
                            </svg>
                          `)}`;
                          }}
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