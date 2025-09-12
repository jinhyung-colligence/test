import React, { useState } from 'react';
import { Currency } from "@/types/withdrawal";
import { 
  APPROVAL_POLICIES, 
  TRANSACTION_TYPE_POLICIES,
  ApprovalPolicy,
  TransactionTypePolicy 
} from "@/utils/approverAssignment";
import { ApproverRoleBadge } from "./ApproverRoleBadge";

interface PolicyManagementProps {
  onPolicyChange?: (policies: ApprovalPolicy[]) => void;
}

export function PolicyManagement({ onPolicyChange }: PolicyManagementProps) {
  const [activeTab, setActiveTab] = useState<'amount' | 'type'>('amount');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('KRW');
  const [isEditing, setIsEditing] = useState(false);

  const currencies: Currency[] = ['KRW', 'USD', 'BTC', 'ETH', 'USDC', 'USDT'];
  
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">결재 정책 관리</h2>
          <p className="text-gray-600 mt-1">거래 금액과 유형에 따른 결재 정책을 관리합니다</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditing 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isEditing ? '편집 취소' : '정책 편집'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('amount')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'amount'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          금액별 정책
        </button>
        <button
          onClick={() => setActiveTab('type')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'type'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          거래 유형별 정책
        </button>
      </div>

      {/* Amount-based Policies */}
      {activeTab === 'amount' && (
        <div className="space-y-6">
          {/* Currency Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">통화:</span>
            <div className="flex space-x-2">
              {currencies.map(currency => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCurrency === currency
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Policy Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPolicies.map((policy, index) => {
              const risk = getRiskLevel(policy.requiredApprovers.length);
              
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
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
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
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
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {typePolicy.type.replace('_', ' ')} 거래
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{typePolicy.description}</p>
                </div>
                {isEditing && (
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
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
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="text-sm font-medium text-gray-700 mb-3">정책 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{APPROVAL_POLICIES.length}</div>
            <div className="text-xs text-gray-600">총 금액별 정책</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{currencies.length}</div>
            <div className="text-xs text-gray-600">지원 통화</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{TRANSACTION_TYPE_POLICIES.length}</div>
            <div className="text-xs text-gray-600">거래 유형 정책</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.min(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}~
              {Math.max(...APPROVAL_POLICIES.map(p => p.requiredApprovers.length))}
            </div>
            <div className="text-xs text-gray-600">결재자 범위</div>
          </div>
        </div>
      </div>
    </div>
  );
}