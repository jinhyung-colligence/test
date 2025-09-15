import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Currency } from "@/types/withdrawal";
import {
  APPROVAL_POLICIES,
  TRANSACTION_TYPE_POLICIES,
  ApprovalPolicy,
  TransactionTypePolicy
} from "@/utils/approverAssignment";
import { ApproverRoleBadge } from "../withdrawal/ApproverRoleBadge";
import { CogIcon } from "@heroicons/react/24/outline";

interface PolicyManagementProps {
  onPolicyChange?: (policies: ApprovalPolicy[]) => void;
  initialSubtab?: 'amount' | 'type';
  initialCurrency?: Currency;
}

export default function PolicyManagement({ onPolicyChange, initialSubtab, initialCurrency }: PolicyManagementProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'amount' | 'type'>(initialSubtab || 'amount');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency || 'KRW');
  const [isEditing] = useState(true); // 항상 편집 모드
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [editingTypePolicy, setEditingTypePolicy] = useState<string | null>(null);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddTypePolicyModal, setShowAddTypePolicyModal] = useState(false);

  const currencies: Currency[] = ['KRW', 'USD', 'BTC', 'ETH', 'USDC', 'USDT'];

  // initialSubtab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialSubtab) {
      setActiveTab(initialSubtab);
    }
  }, [initialSubtab]);

  // initialCurrency가 변경되면 selectedCurrency 업데이트
  useEffect(() => {
    if (initialCurrency) {
      setSelectedCurrency(initialCurrency);
    }
  }, [initialCurrency]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: 'amount' | 'type') => {
    setActiveTab(newTab);
    if (newTab === 'amount') {
      // 금액별 정책의 경우 현재 선택된 통화로 이동
      router.push(`/security/policies/amount/${selectedCurrency}`);
    } else {
      // 거래 유형별 정책의 경우 직접 이동
      router.push(`/security/policies/type`);
    }
  };

  // 통화 변경 함수 (URL도 함께 변경)
  const handleCurrencyChange = (newCurrency: Currency) => {
    setSelectedCurrency(newCurrency);
    router.push(`/security/policies/amount/${newCurrency}`);
  };

  const filteredPolicies = APPROVAL_POLICIES.filter(
    policy => policy.currency === selectedCurrency
  );

  const formatAmount = (amount: number, currency: Currency) => {
    if (amount === 0) return '0';
    if (amount === Infinity) return '∞';

    if (currency === 'KRW' || currency === 'USD') {
      return amount.toLocaleString();
    }

    return amount.toString();
  };

  const getRiskLevel = (approverCount: number) => {
    if (approverCount <= 2) return { level: '낮음', color: 'gray-light' };
    if (approverCount <= 3) return { level: '보통', color: 'gray-medium' };
    if (approverCount <= 4) return { level: '높음', color: 'gray-dark' };
    return { level: '매우 높음', color: 'gray-darker' };
  };

  // 편집 모드 핸들러
  const handleEditPolicy = (policyId: string) => {
    setEditingPolicy(editingPolicy === policyId ? null : policyId);
  };

  const handleEditTypePolicy = (typePolicyId: string) => {
    setEditingTypePolicy(editingTypePolicy === typePolicyId ? null : typePolicyId);
  };

  const handleSavePolicy = (policyId: string) => {
    // 정책 저장 로직
    setEditingPolicy(null);
  };

  const handleSaveTypePolicy = (typePolicyId: string) => {
    // 유형별 정책 저장 로직
    setEditingTypePolicy(null);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setEditingTypePolicy(null);
  };

  // 정책 추가 핸들러
  const handleAddPolicy = () => {
    setShowAddPolicyModal(true);
  };

  const handleAddTypePolicy = () => {
    setShowAddTypePolicyModal(true);
  };

  const handleSaveNewPolicy = () => {
    // 새 정책 저장 로직
    setShowAddPolicyModal(false);
  };

  const handleSaveNewTypePolicy = () => {
    // 새 유형별 정책 저장 로직
    setShowAddTypePolicyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header - 보안 설정 스타일에 맞춰 조정 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="h-6 w-6 mr-2 text-primary-600" />
              결재 정책 관리
            </h3>
            <p className="text-sm text-gray-600 mt-1">거래 금액과 유형에 따른 결재 정책을 관리합니다</p>
          </div>
        </div>

        {/* Tab Navigation - 보안 설정 스타일 적용 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('amount')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'amount'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              금액별 정책
            </button>
            <button
              onClick={() => handleTabChange('type')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'type'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              거래 유형별 정책
            </button>
          </nav>
        </div>
      </div>

      {/* Amount-based Policies */}
      {activeTab === 'amount' && (
        <div className="space-y-6">
          {/* Currency Selector */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">통화 선택:</span>
              <div className="flex flex-wrap gap-2">
                {currencies.map(currency => (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCurrency === currency
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                        <label className="block text-xs font-medium text-gray-700 mb-2">필요 결재자 ({policy.requiredApprovers.length}명)</label>
                        <div className="space-y-2">
                          {policy.requiredApprovers.map((approver, approverIndex) => (
                            <div key={approver} className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 w-4">{approverIndex + 1}.</span>
                              <select className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value={approver}>{approver}</option>
                                <option value="CEO">CEO</option>
                                <option value="CFO">CFO</option>
                                <option value="CTO">CTO</option>
                                <option value="관리자">관리자</option>
                                <option value="부관리자">부관리자</option>
                              </select>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="결재자 제거"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                            + 결재자 추가
                          </button>
                        </div>
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
      )}

      {/* Transaction Type Policies */}
      {activeTab === 'type' && (
        <div className="space-y-4">
          {/* Add Type Policy Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddTypePolicy}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>유형별 정책 추가</span>
            </button>
          </div>
          {TRANSACTION_TYPE_POLICIES.map((typePolicy, index) => {
            const typePolicyId = `${typePolicy.type}-${index}`;
            const isEditingThis = editingTypePolicy === typePolicyId;

            return (
              <div key={index} className={`bg-white rounded-xl border p-6 transition-all ${
                isEditingThis ? 'border-blue-300 shadow-lg ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {typePolicy.type.replace('_', ' ')} 거래
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{typePolicy.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={() => handleSaveTypePolicy(typePolicyId)}
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
                          onClick={() => handleEditTypePolicy(typePolicyId)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          편집
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditingThis ? (
                  // 편집 모드 UI
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">거래 설명</label>
                      <textarea
                        defaultValue={typePolicy.description}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">추가 결재자 ({typePolicy.additionalApprovers.length}명)</label>
                      <div className="space-y-2">
                        {typePolicy.additionalApprovers.map((approver, approverIndex) => (
                          <div key={approver} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-4">{approverIndex + 1}.</span>
                            <select className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <option value={approver}>{approver}</option>
                              <option value="CEO">CEO</option>
                              <option value="CFO">CFO</option>
                              <option value="CTO">CTO</option>
                              <option value="관리자">관리자</option>
                              <option value="부관리자">부관리자</option>
                              <option value="리스크관리자">리스크관리자</option>
                              <option value="컴플라이언스">컴플라이언스</option>
                            </select>
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="결재자 제거"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                          + 추가 결재자 추가
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">특수 옵션</h5>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs text-gray-600">고위험 거래로 분류</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs text-gray-600">추가 검증 필요</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs text-gray-600">자동 승인 금지</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 일반 보기 모드 UI
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      추가 결재자: {typePolicy.additionalApprovers.length}명
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {typePolicy.additionalApprovers.map((approver, approverIndex) => (
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
      )}

      {/* Policy Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">정책 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{APPROVAL_POLICIES.length}</div>
            <div className="text-xs text-gray-600 mt-1">총 금액별 정책</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{currencies.length}</div>
            <div className="text-xs text-gray-600 mt-1">지원 통화</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{TRANSACTION_TYPE_POLICIES.length}</div>
            <div className="text-xs text-gray-600 mt-1">거래 유형 정책</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {Math.min(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}~
              {Math.max(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}
            </div>
            <div className="text-xs text-gray-600 mt-1">결재자 범위</div>
          </div>
        </div>
      </div>

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">새 금액별 정책 추가</h3>
              <button
                onClick={() => setShowAddPolicyModal(false)}
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
                <select
                  defaultValue={selectedCurrency}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">필요 결재자</label>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">첫 번째 결재자 선택</option>
                    <option value="CEO">CEO</option>
                    <option value="CFO">CFO</option>
                    <option value="CTO">CTO</option>
                    <option value="관리자">관리자</option>
                    <option value="부관리자">부관리자</option>
                  </select>
                  <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                    + 결재자 추가
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddPolicyModal(false)}
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
      )}

      {/* Add Type Policy Modal */}
      {showAddTypePolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">새 거래 유형별 정책 추가</h3>
              <button
                onClick={() => setShowAddTypePolicyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">거래 유형</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">거래 유형 선택</option>
                  <option value="high_risk">고위험 거래</option>
                  <option value="cross_border">국가간 거래</option>
                  <option value="large_amount">대액 거래</option>
                  <option value="weekend">주말 거래</option>
                  <option value="after_hours">시간외 거래</option>
                  <option value="new_address">신규 주소</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정책 설명</label>
                <textarea
                  placeholder="이 정책에 대한 상세 설명을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">추가 결재자</label>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">첫 번째 추가 결재자 선택</option>
                    <option value="CEO">CEO</option>
                    <option value="CFO">CFO</option>
                    <option value="CTO">CTO</option>
                    <option value="관리자">관리자</option>
                    <option value="부관리자">부관리자</option>
                    <option value="리스크관리자">리스크관리자</option>
                    <option value="컴플라이언스">컴플라이언스</option>
                  </select>
                  <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                    + 추가 결재자 추가
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">특수 옵션</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">고위험 거래로 분류</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">추가 검증 필요</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">자동 승인 금지</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddTypePolicyModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveNewTypePolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}