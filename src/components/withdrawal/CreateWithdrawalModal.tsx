import { useState } from "react";

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

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: NewRequest) => void;
  newRequest: NewRequest;
  onRequestChange: (request: NewRequest) => void;
  networkAssets: Record<string, string[]>;
}

export function CreateWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets
}: CreateWithdrawalModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newRequest);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              placeholder="예: 분기별 정산을 위한 비트코인 출금"
            />
          </div>

          {/* 나머지 폼 필드들 - 길어서 생략하고 기본 구조만 */}
          {/* ... 실제로는 모든 폼 필드들이 여기에 들어갑니다 ... */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>보안 알림:</strong><br />
              모든 출금은 필수 결재자의 승인을 받아야 하며, Air-gap 환경에서
              최종 서명이 진행됩니다.
            </p>
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
    </div>
  );
}