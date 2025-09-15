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
  const [isEditing, setIsEditing] = useState(false);

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
    if (approverCount <= 2) return { level: '낮음', color: 'green' };
    if (approverCount <= 3) return { level: '보통', color: 'yellow' };
    if (approverCount <= 4) return { level: '높음', color: 'orange' };
    return { level: '매우 높음', color: 'red' };
  };

  return (
    <div className="space-y-6">
      {/* Header - 보안 설정 스타일에 맞춰 조정 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="h-6 w-6 mr-2 text-primary-600" />
              결재 정책 관리
            </h3>
            <p className="text-sm text-gray-600 mt-1">거래 금액과 유형에 따른 결재 정책을 관리합니다</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isEditing
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {isEditing ? '편집 취소' : '정책 편집'}
            </button>
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

          {/* Policy Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPolicies.map((policy, index) => {
              const risk = getRiskLevel(policy.requiredApprovers.length);

              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{policy.description}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.color === 'green' ? 'bg-green-100 text-green-700' :
                        risk.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        risk.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        위험도: {risk.level}
                      </span>
                    </div>
                    {isEditing && (
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        편집
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs text-gray-500">
                      <div>금액 범위: {formatAmount(policy.minAmount, policy.currency)} ~ {formatAmount(policy.maxAmount, policy.currency)} {policy.currency}</div>
                      <div>필요 결재자: {policy.requiredApprovers.length}명</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {policy.requiredApprovers.map((approver, approverIndex) => (
                        <div key={approver} className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">{approverIndex + 1}.</span>
                          <ApproverRoleBadge approverName={approver} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Type Policies */}
      {activeTab === 'type' && (
        <div className="space-y-4">
          {TRANSACTION_TYPE_POLICIES.map((typePolicy, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {typePolicy.type.replace('_', ' ')} 거래
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{typePolicy.description}</p>
                </div>
                {isEditing && (
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    편집
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  추가 결재자: {typePolicy.additionalApprovers.length}명
                </div>

                <div className="flex flex-wrap gap-2">
                  {typePolicy.additionalApprovers.map(approver => (
                    <ApproverRoleBadge key={approver} approverName={approver} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policy Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">정책 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{APPROVAL_POLICIES.length}</div>
            <div className="text-xs text-gray-600 mt-1">총 금액별 정책</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currencies.length}</div>
            <div className="text-xs text-gray-600 mt-1">지원 통화</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{TRANSACTION_TYPE_POLICIES.length}</div>
            <div className="text-xs text-gray-600 mt-1">거래 유형 정책</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.min(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}~
              {Math.max(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}
            </div>
            <div className="text-xs text-gray-600 mt-1">결재자 범위</div>
          </div>
        </div>
      </div>
    </div>
  );
}