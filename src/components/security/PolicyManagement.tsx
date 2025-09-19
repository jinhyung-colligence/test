import React, { useState } from 'react';
import { Currency } from "@/types/withdrawal";
import {
  APPROVAL_POLICIES,
  ApprovalPolicy
} from "@/utils/approverAssignment";
import { CogIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { MOCK_USERS, getActiveUsers } from '@/data/userMockData';
import { formatUserDisplay } from '@/utils/userHelpers';

interface PolicyManagementProps {
  onPolicyChange?: (policies: ApprovalPolicy[]) => void;
}

export default function PolicyManagement({ onPolicyChange }: PolicyManagementProps) {
  const [isEditing] = useState(true); // 항상 편집 모드
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [editingApprovers, setEditingApprovers] = useState<{[key: string]: string[]}>({});
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('');
  const [modalApprovers, setModalApprovers] = useState<string[]>(['']);


  const filteredPolicies = APPROVAL_POLICIES.filter(
    policy => policy.currency === 'KRW'
  );

  const formatAmount = (amount: number, currency: Currency) => {
    if (amount === 0) return '0';
    if (amount === Infinity) return '∞';

    if (currency === 'KRW' || currency === 'KRW') {
      return amount.toLocaleString();
    }

    return amount.toString();
  };

  const getRiskLevel = (approverCount: number) => {
    if (approverCount === 2) return { level: '낮음', color: 'gray-light' };
    if (approverCount === 3) return { level: '보통', color: 'gray-medium' };
    if (approverCount === 4) return { level: '높음', color: 'gray-dark' };
    return { level: '매우 높음', color: 'gray-darker' };
  };

  // 편집 모드 핸들러
  const handleEditPolicy = (policyId: string) => {
    if (editingPolicy === policyId) {
      // 편집 모드 종료
      setEditingPolicy(null);
    } else {
      // 편집 모드 시작 - 현재 정책의 결재자 정보를 editingApprovers에 초기화
      const policy = APPROVAL_POLICIES.find(p => `${p.currency}-${p.minAmount}-${p.maxAmount}` === policyId);
      if (policy) {
        setEditingApprovers(prev => ({
          ...prev,
          [policyId]: [...policy.requiredApprovers]
        }));
      }
      setEditingPolicy(policyId);
    }
  };

  const handleSavePolicy = (policyId: string) => {
    // 정책 저장 로직
    setEditingPolicy(null);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
  };

  // 정책 추가 핸들러
  const handleAddPolicy = () => {
    setShowAddPolicyModal(true);
  };

  const handleSaveNewPolicy = () => {
    // 새 정책 저장 로직
    setShowAddPolicyModal(false);
    setSelectedRiskLevel(''); // 모달 닫을 때 위험도 초기화
    setModalApprovers(['']); // 결재자 목록 초기화
  };

  // 결재자 관리 헬퍼 함수들
  const getApproversForPolicy = (policyId: string, originalApprovers: string[]) => {
    return editingApprovers[policyId] || originalApprovers;
  };

  const handleApproverChange = (policyId: string, index: number, newValue: string) => {
    const currentApprovers = getApproversForPolicy(policyId, []);
    const updatedApprovers = [...currentApprovers];
    updatedApprovers[index] = newValue;
    setEditingApprovers(prev => ({
      ...prev,
      [policyId]: updatedApprovers
    }));
  };

  const handleAddApprover = (policyId: string, originalApprovers: string[]) => {
    const currentApprovers = getApproversForPolicy(policyId, originalApprovers);
    setEditingApprovers(prev => ({
      ...prev,
      [policyId]: [...currentApprovers, '']
    }));
  };

  const handleRemoveApprover = (policyId: string, index: number, originalApprovers: string[]) => {
    const currentApprovers = getApproversForPolicy(policyId, originalApprovers);
    const updatedApprovers = currentApprovers.filter((_, i) => i !== index);
    setEditingApprovers(prev => ({
      ...prev,
      [policyId]: updatedApprovers
    }));
  };

  // 활성 사용자 목록 가져오기
  const availableUsers = getActiveUsers();

  // 위험도에 따른 추천 결재자 반환
  const getRecommendedApprovers = (riskLevel: string): string[] => {
    switch (riskLevel) {
      case 'low':
        return ['박CFO', '이CISO'];
      case 'medium':
        return ['박CFO', '이CISO', '김CTO'];
      case 'high':
        return ['박CFO', '이CISO', '김CTO', '정법무이사'];
      case 'very_high':
        return ['박CFO', '이CISO', '김CTO', '정법무이사', '최CEO'];
      default:
        return [];
    }
  };

  // 위험도 변경 핸들러
  const handleRiskLevelChange = (riskLevel: string) => {
    setSelectedRiskLevel(riskLevel);
  };

  // 모달 결재자 관리 함수들
  const handleModalApproverChange = (index: number, value: string) => {
    const updated = [...modalApprovers];
    updated[index] = value;
    setModalApprovers(updated);
  };

  const handleAddModalApprover = () => {
    setModalApprovers([...modalApprovers, '']);
  };

  const handleRemoveModalApprover = (index: number) => {
    if (modalApprovers.length > 1) {
      setModalApprovers(modalApprovers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Currency Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="h-6 w-6 mr-2 text-primary-600" />
              결재 정책 관리
            </h3>
            <p className="text-sm text-gray-600 mt-1">거래 금액에 따른 결재 정책을 관리합니다</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600">통화: KRW</span>
          </div>
        </div>
      </div>

      {/* Policy Management Content */}
      <div className="space-y-6">

        {/* Add Policy Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAddPolicy}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>정책 추가</span>
          </button>
        </div>

        {/* Policy Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPolicies.map((policy, index) => {
            const risk = getRiskLevel(policy.requiredApprovers.length);
            const policyId = `${policy.currency}-${index}`;
            const isEditingThis = editingPolicy === policyId;

            return (
              <div key={index} className={`bg-white rounded-xl border p-6 transition-all ${
                isEditingThis ? 'border-blue-300 shadow-lg ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{policy.description}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      위험도: <span className={risk.level === '높음' || risk.level === '매우 높음' ? 'text-red-600' : ''}>{risk.level}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={() => handleSavePolicy(policyId)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditPolicy(policyId)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          편집
                        </button>
                      )}
                    </div>
                </div>

                {isEditingThis ? (
                  // 편집 모드 UI
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">최소 금액</label>
                        <input
                          type="number"
                          defaultValue={policy.minAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">최대 금액</label>
                        <input
                          type="number"
                          defaultValue={policy.maxAmount === Infinity ? '' : policy.maxAmount}
                          placeholder="무제한"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      {(() => {
                        const currentApprovers = getApproversForPolicy(policyId, policy.requiredApprovers);
                        return (
                          <>
                            <label className="block text-xs font-medium text-gray-700 mb-2">필요 결재자 ({currentApprovers.length}명)</label>
                            <div className="space-y-2">
                              {currentApprovers.map((approver, approverIndex) => (
                                <div key={`${policyId}-${approverIndex}`} className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 w-4">{approverIndex + 1}.</span>
                                  <select
                                    value={approver}
                                    onChange={(e) => handleApproverChange(policyId, approverIndex, e.target.value)}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">결재자 선택</option>
                                    {availableUsers.map(user => (
                                      <option key={user.id} value={user.name}>
                                        {formatUserDisplay(user, 'namePosition')}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleRemoveApprover(policyId, approverIndex, policy.requiredApprovers)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="결재자 제거"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => handleAddApprover(policyId, policy.requiredApprovers)}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                              >
                                + 결재자 추가
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  // 일반 보기 모드 UI
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500">
                      <div>금액 범위: {formatAmount(policy.minAmount, policy.currency)} ~ {formatAmount(policy.maxAmount, policy.currency)} {policy.currency}</div>
                      <div>필요 결재자: {policy.requiredApprovers.length}명</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {policy.requiredApprovers.map((approver, approverIndex) => (
                        <div key={approver} className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">{approverIndex + 1}.</span>
                          <span className="text-xs text-gray-700">{approver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Policy Modal */}
      <Modal isOpen={showAddPolicyModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">새 정책 추가</h3>
              <button
                onClick={() => {
                  setShowAddPolicyModal(false);
                  setSelectedRiskLevel(''); // 모달 닫을 때 위험도 초기화
                  setModalApprovers(['']); // 결재자 목록 초기화
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">통화</label>
                <input
                  type="text"
                  value="KRW"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최소 금액</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최대 금액</label>
                  <input
                    type="number"
                    placeholder="무제한"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정책 설명</label>
                <input
                  type="text"
                  placeholder="예: 소액 거래"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">위험도</label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => handleRiskLevelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">위험도 선택</option>
                  <option value="low">낮음 (2명 승인)</option>
                  <option value="medium">보통 (3명 승인)</option>
                  <option value="high">높음 (4명 승인)</option>
                  <option value="very_high">매우 높음 (5명 이상 승인)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">위험도에 따라 권장 결재자 수가 달라집니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">필요 결재자</label>

                {/* 위험도 기반 추천 결재자 표시 */}
                {selectedRiskLevel && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">위험도 기반 추천 결재자</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getRecommendedApprovers(selectedRiskLevel).map((approver, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {index + 1}. {approver}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">위험도 '{getRiskLevel(getRecommendedApprovers(selectedRiskLevel).length).level}'에 따른 추천 결재자입니다</p>
                  </div>
                )}

                <div className="space-y-2">
                  {modalApprovers.map((approver, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <select
                        value={approver}
                        onChange={(e) => handleModalApproverChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">결재자 선택</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.name}>
                            {formatUserDisplay(user, 'namePosition')}
                          </option>
                        ))}
                      </select>
                      {modalApprovers.length > 1 && (
                        <button
                          onClick={() => handleRemoveModalApprover(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="결재자 제거"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddModalApprover}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + 결재자 추가
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddPolicyModal(false);
                  setSelectedRiskLevel(''); // 취소 시에도 위험도 초기화
                  setModalApprovers(['']); // 결재자 목록 초기화
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveNewPolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}