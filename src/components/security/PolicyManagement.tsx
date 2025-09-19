"use client";

import React, { useState } from 'react';
import { Currency } from "@/types/withdrawal";
import {
  APPROVAL_POLICIES,
  ApprovalPolicy
} from "@/utils/approverAssignment";
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
    if (amount === Infinity) return '무제한';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getRiskLevel = (approverCount: number) => {
    if (approverCount <= 2) return { level: '낮음', color: 'text-blue-600' };
    if (approverCount === 3) return { level: '보통', color: 'text-yellow-600' };
    if (approverCount === 4) return { level: '높음', color: 'text-orange-600' };
    return { level: '매우 높음', color: 'text-red-600' };
  };

  const handleEditPolicy = (policyId: string) => {
    setEditingPolicy(policyId);
  };

  const handleSavePolicy = (policyId: string) => {
    const policy = APPROVAL_POLICIES.find(p => `${p.currency}-${p.minAmount}-${p.maxAmount}` === policyId);
    if (policy && editingApprovers[policyId]) {
      policy.requiredApprovers = [...editingApprovers[policyId]];
      if (onPolicyChange) {
        onPolicyChange(APPROVAL_POLICIES);
      }
    }
    setEditingPolicy(null);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setEditingApprovers({});
  };

  const handleAddPolicy = () => {
    setShowAddPolicyModal(true);
  };

  const handleSaveNewPolicy = () => {
    // 새 정책 저장 로직 (구현 필요)
    console.log('새 정책 저장');
    setShowAddPolicyModal(false);
    setSelectedRiskLevel('');
    setModalApprovers(['']);
  };

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
    if (updatedApprovers.length === 0) {
      updatedApprovers.push('');
    }
    setEditingApprovers(prev => ({
      ...prev,
      [policyId]: updatedApprovers
    }));
  };

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
      {/* Header - Outside the box */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          결재 정책 관리
        </h2>
        <p className="text-gray-600 mt-1">거래 금액에 따른 결재 정책을 관리합니다</p>
      </div>

      {/* Content - Inside the box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">KRW 정책 목록</h3>
            <button
              onClick={handleAddPolicy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>새 정책 추가</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredPolicies.map((policy, index) => {
              const risk = getRiskLevel(policy.requiredApprovers.length);
              const policyId = `${policy.currency}-${index}`;
              const isEditingThis = editingPolicy === policyId;

              return (
                <div key={policyId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{policy.description}</h4>
                        <span className={`text-sm font-medium ${risk.color}`}>
                          위험도: {risk.level} ({policy.requiredApprovers.length}명 승인)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAmount(policy.minAmount, policy.currency)}원 ~ {formatAmount(policy.maxAmount, policy.currency)}원
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={() => handleSavePolicy(policyId)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditPolicy(policyId)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          편집
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditingThis ? (
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">필요 결재자 편집</h5>
                      <div className="space-y-2">
                        {(() => {
                          const currentApprovers = getApproversForPolicy(policyId, policy.requiredApprovers);
                          return currentApprovers.map((approver, approverIndex) => (
                            <div key={approverIndex} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 w-6">{approverIndex + 1}.</span>
                              <select
                                value={approver}
                                onChange={(e) => handleApproverChange(policyId, approverIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="결재자 제거"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ));
                        })()}
                        <div className="flex justify-center mt-2">
                          <button
                            onClick={() => handleAddApprover(policyId, policy.requiredApprovers)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>결재자 추가</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">필요 결재자</h5>
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
      </div>

      {/* Add Policy Modal */}
      <Modal isOpen={showAddPolicyModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">새 정책 추가</h3>
            <button
              onClick={() => {
                setShowAddPolicyModal(false);
                setSelectedRiskLevel('');
                setModalApprovers(['']);
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

                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleAddModalApprover}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>결재자 추가</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddPolicyModal(false);
                  setSelectedRiskLevel('');
                  setModalApprovers(['']);
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
        </div>
      </Modal>
    </div>
  );
}