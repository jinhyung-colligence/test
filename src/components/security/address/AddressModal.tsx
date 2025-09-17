"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { AddressFormData, AddressDirection } from "@/types/address";

interface AddressModalProps {
  isOpen: boolean;
  direction: AddressDirection;
  onClose: () => void;
  onSubmit: (formData: AddressFormData) => void;
}

export default function AddressModal({ isOpen, direction, onClose, onSubmit }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    address: "",
    coin: "BTC",
    type: "",
    direction,
    autoProcess: false,
    minAmount: undefined,
    notificationEnabled: true,
    trusted: false,
    dailyLimit: undefined,
    requiresApproval: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.label && formData.address && formData.type) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      label: "",
      address: "",
      coin: "BTC",
      type: "",
      direction,
      autoProcess: false,
      minAmount: undefined,
      notificationEnabled: true,
      trusted: false,
      dailyLimit: undefined,
      requiresApproval: false,
    });
    onClose();
  };

  const updateFormData = (updates: Partial<AddressFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {direction === "withdrawal" ? "출금" : "입금"} 주소 추가
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              라벨 *
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => updateFormData({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`예: 메인 ${direction === "withdrawal" ? "출금" : "입금"} 지갑`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 *
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`${direction === "withdrawal" ? "출금할" : "입금받을"} 주소를 입력하세요`}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코인 *
            </label>
            <select
              value={formData.coin}
              onChange={(e) => updateFormData({ coin: e.target.value })}
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
                  checked={formData.type === "personal"}
                  onChange={(e) => updateFormData({ type: e.target.value as "personal" | "vasp" })}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">개인 지갑</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="vasp"
                  checked={formData.type === "vasp"}
                  onChange={(e) => updateFormData({ type: e.target.value as "personal" | "vasp" })}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">거래소/VASP</span>
              </label>
            </div>
          </div>

          {direction === "deposit" && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">입금 설정</h4>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoProcess}
                      onChange={(e) => updateFormData({ autoProcess: e.target.checked })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">자동 처리 활성화</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trusted}
                      onChange={(e) => updateFormData({ trusted: e.target.checked })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">신뢰 주소로 등록</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationEnabled}
                      onChange={(e) => updateFormData({ notificationEnabled: e.target.checked })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">입금 알림 활성화</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최소 입금액
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.minAmount || ""}
                      onChange={(e) => updateFormData({ minAmount: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.001"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {direction === "withdrawal" && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">출금 설정</h4>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => updateFormData({ requiresApproval: e.target.checked })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">승인 필요</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      일일 출금 한도 (KRW)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyLimit || ""}
                      onChange={(e) => updateFormData({ dailyLimit: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1000000"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
    </Modal>
  );
}