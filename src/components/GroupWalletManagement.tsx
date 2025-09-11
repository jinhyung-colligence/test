"use client";

import { useState } from "react";
import {
  WalletIcon,
  PlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  GroupType, 
  ExpenseStatus, 
  CryptoCurrency, 
  CryptoAmount, 
  WalletGroup, 
  ExpenseRequest 
} from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import GroupManagement from "@/components/groups/GroupManagement";
import PendingApproval from "@/components/groups/PendingApproval";
import ApprovalCompleted from "@/components/groups/ApprovalCompleted";
import BudgetStatus from "@/components/groups/BudgetStatus";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  calculateBudgetUsageRate,
  calculateExpenseSum,
  formatExpenseSums,
  getExpensesForPeriod,
  getTypeColor,
  getTypeName,
  getStatusColor,
  getStatusName,
  formatDate,
  getBudgetUsagePercentage,
  getQuarterlyBudgetUsagePercentage,
  getYearlyBudgetUsagePercentage
} from "@/utils/groupsUtils";

interface GroupWalletManagementProps {
  plan: ServicePlan;
}


// 가상자산 아이콘 컴포넌트
const getCryptoIcon = (currency: CryptoCurrency) => {
  return (
    <img 
      src={getCryptoIconUrl(currency)} 
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        // 이미지 로드 실패시 폴백
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold';
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

// 아이콘과 함께 가상자산 금액 포맷팅
const formatCryptoAmountWithIcon = (cryptoAmount: CryptoAmount): JSX.Element => {
  const decimals = getCurrencyDecimals(cryptoAmount.currency);
  const formattedNumber = cryptoAmount.amount.toFixed(decimals).replace(/\.?0+$/, '');
  
  return (
    <div className="flex items-center space-x-2">
      {getCryptoIcon(cryptoAmount.currency)}
      <span>{formattedNumber} {cryptoAmount.currency}</span>
    </div>
  );
};

// 지출 상태 아이콘 매핑
const getStatusIcon = (status: ExpenseStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    case "pending":
      return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    default:
      return <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />;
  }
};

export default function GroupWalletManagement({
  plan,
}: GroupWalletManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "pending" | "completed" | "budget">(
    "groups"
  );
  
  
  const { t, language } = useLanguage();


  const [newExpense, setNewExpense] = useState({
    groupId: "",
    title: "",
    amount: { amount: 0, currency: 'USDC' as CryptoCurrency },
    description: "",
    category: "operations",
  });








  const handleCreateExpense = () => {
    console.log("Creating expense:", newExpense);
    setShowExpenseModal(false);
    setNewExpense({
      groupId: "",
      title: "",
      amount: { amount: 0, currency: 'USDC' },
      description: "",
      category: "operations",
    });
  };

  const handleApproveExpense = (expenseId: string) => {
    console.log("Approving expense:", expenseId);
  };

  const handleRejectExpense = (expenseId: string, reason: string) => {
    console.log("Rejecting expense:", expenseId, "Reason:", reason);
  };

  const handleReapproveExpense = (expenseId: string) => {
    console.log("Re-approving expense:", expenseId);
    // 실제로는 rejected 상태를 pending으로 변경하는 API 호출
    alert("재승인 처리되어 승인 대기 상태로 변경되었습니다.");
  };

  if (plan !== "enterprise") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            그룹 관리
          </h3>
          <p className="text-gray-500 mb-4">
            엔터프라이즈 플랜에서만 사용 가능한 기능입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">그룹 관리</h1>
          <p className="text-gray-600 mt-1">
            목적별 그룹화로 체계적인 자산관리
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            그룹 생성
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentCheckIcon className="h-5 w-5 mr-2" />
            지출 신청
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            리포트 출력
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "groups", name: "그룹 관리", icon: UserGroupIcon },
            { 
              id: "pending", 
              name: "승인 대기", 
              icon: ClockIcon,
              count: mockExpenses.filter(e => e.status === 'pending' || e.status === 'rejected').length 
            },
            { 
              id: "completed", 
              name: "승인 완료", 
              icon: CheckCircleIcon,
              count: mockExpenses.filter(e => e.status === 'approved').length 
            },
            { id: "budget", name: "예산 현황", icon: ChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 그룹 관리 탭 */}
      {activeTab === "groups" && (
        <GroupManagement 
          showCreateModal={showCreateModal}
          onCloseCreateModal={() => setShowCreateModal(false)}
          onCreateGroup={() => {
            // 그룹 생성 후 처리 로직
          }}
        />
      )}

      {/* 승인 대기 탭 */}
      {activeTab === "pending" && (
        <PendingApproval 
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          onReapproveExpense={handleReapproveExpense}
        />
      )}

      {/* 승인 완료 탭 */}
      {activeTab === "completed" && <ApprovalCompleted />}

      {/* 예산 현황 탭 */}
      {activeTab === "budget" && <BudgetStatus />}


      {/* 지출 신청 모달 */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">지출 신청</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateExpense();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 선택 *
                </label>
                <select
                  required
                  value={newExpense.groupId}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, groupId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">그룹을 선택하세요</option>
                  {mockGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지출 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="지출 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  금액 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    value={newExpense.amount.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: {
                          ...newExpense.amount,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                  <select
                    value={newExpense.amount.currency}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: {
                          ...newExpense.amount,
                          currency: e.target.value as CryptoCurrency,
                        },
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="operations">운영비</option>
                  <option value="software">소프트웨어</option>
                  <option value="infrastructure">인프라</option>
                  <option value="equipment">장비</option>
                  <option value="marketing">마케팅</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명 *
                </label>
                <textarea
                  required
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="지출에 대한 상세 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
