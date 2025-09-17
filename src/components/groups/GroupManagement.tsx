import { useState, useEffect } from "react";
import {
  WalletIcon,
  PlusIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  GroupType,
  CryptoCurrency,
  CryptoAmount,
  WalletGroup,
  BudgetSetup
} from "@/types/groups";
import { User, ROLE_NAMES } from "@/types/user";
import { Modal } from "@/components/common/Modal";
import { mockGroups } from "@/data/groupMockData";
import { MOCK_USERS } from "@/data/userMockData";
import BudgetSetupForm from "./BudgetSetupForm";
import BudgetDistribution from "./BudgetDistribution";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  getTypeColor,
  getTypeName,
  formatDate,
  getBudgetUsagePercentage,
  getQuarterlyBudgetUsagePercentage,
  getYearlyBudgetUsagePercentage
} from "@/utils/groupsUtils";
import { distributeBudget } from "@/utils/budgetCalculator";

interface GroupManagementProps {
  onCreateGroup?: () => void;
  showCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  onCreateGroupRequest?: (request: any) => void;
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

// 현재 기간의 예산 정보를 가져오는 헬퍼 함수
const getCurrentPeriodBudget = (group: WalletGroup) => {
  if (!group.budgetSetup) {
    return {
      period: 'monthly',
      budget: group.monthlyBudget.amount,
      used: group.budgetUsed.amount,
      currency: group.monthlyBudget.currency
    };
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  // 현재 월에 해당하는 예산 찾기
  const currentMonthBudget = group.budgetSetup.monthlyBudgets.find(
    mb => mb.month === currentMonth
  );

  if (currentMonthBudget) {
    return {
      period: 'monthly',
      budget: currentMonthBudget.amount,
      used: group.budgetUsed.amount, // 실제로는 해당 월의 사용량이어야 함
      currency: group.budgetSetup.currency
    };
  }

  // 현재 월 예산이 없다면 기존 방식 사용
  return {
    period: 'monthly',
    budget: group.monthlyBudget.amount,
    used: group.budgetUsed.amount,
    currency: group.monthlyBudget.currency
  };
};

// User ID로 사용자 이름 가져오기
const getUserNameById = (userId: string): string => {
  const user = MOCK_USERS.find(u => u.id === userId);
  return user ? user.name : userId; // ID를 찾지 못하면 ID 자체를 반환
};

// budgetSetup에서 현재 월 예산 가져오기
const getCurrentMonthlyBudgetFromSetup = (setup: BudgetSetup): number => {
  const currentMonth = new Date().getMonth() + 1;
  const monthBudget = setup.monthlyBudgets.find(mb => mb.month === currentMonth);
  return monthBudget ? monthBudget.amount : 0;
};

// budgetSetup에서 현재 분기 예산 가져오기
const getCurrentQuarterlyBudgetFromSetup = (setup: BudgetSetup): number => {
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const quarterBudget = setup.quarterlyBudgets.find(qb => qb.quarter === currentQuarter);
  return quarterBudget ? quarterBudget.amount : 0;
};

// budgetSetup에서 연간 예산 가져오기
const getYearlyBudgetFromSetup = (setup: BudgetSetup): number => {
  return setup.yearlyBudget || 0;
};

// 현재 월 이름 가져오기 (예: "9월")
const getCurrentMonthName = (): string => {
  const currentMonth = new Date().getMonth() + 1;
  return `${currentMonth}월`;
};

// 현재 분기 이름 가져오기 (예: "3분기")
const getCurrentQuarterName = (): string => {
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  return `${currentQuarter}분기`;
};

// 현재 년도 가져오기 (예: "2025년도")
const getCurrentYearName = (): string => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}년도`;
};

export default function GroupManagement({ onCreateGroup, showCreateModal: externalShowCreateModal, onCloseCreateModal, onCreateGroupRequest }: GroupManagementProps) {
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [groups, setGroups] = useState<WalletGroup[]>(mockGroups);

  const showCreateModal = externalShowCreateModal !== undefined ? externalShowCreateModal : internalShowCreateModal;

  // 새로운 그룹 상태
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 사용자 선택 관련 상태 (더 이상 필요하지 않음 - select 드롭다운 사용)

  // 필수 결재자 관련 상태
  const [requiredApprovers, setRequiredApprovers] = useState<string[]>(['']);

  // 관리자로 선택 가능한 사용자 필터링 (활성 상태이고 admin, manager, required_approver 역할)
  const getEligibleUsers = () => {
    return MOCK_USERS.filter(user =>
      user.status === 'active' &&
      ['admin', 'manager', 'required_approver'].includes(user.role)
    );
  };


  // 결재자로 선택 가능한 사용자 필터링 (활성 상태이고 결재 권한이 있는 역할)
  const getEligibleApprovers = (excludeCurrentSelection: boolean = true) => {
    const selectedUserIds = excludeCurrentSelection ? requiredApprovers.filter(id => id !== '') : [];
    const managerUserId = newGroup.manager;

    return MOCK_USERS.filter(user =>
      user.status === 'active' &&
      ['required_approver', 'approver', 'admin'].includes(user.role) &&
      !selectedUserIds.includes(user.id) &&
      user.id !== managerUserId
    );
  };

  // 필수 결재자 관리 함수들
  const handleApproverChange = (index: number, userId: string) => {
    const updated = [...requiredApprovers];
    updated[index] = userId;
    setRequiredApprovers(updated);
  };

  const handleAddApprover = () => {
    setRequiredApprovers([...requiredApprovers, '']);
  };

  const handleRemoveApprover = (index: number) => {
    if (requiredApprovers.length > 1) {
      const updated = requiredApprovers.filter((_, i) => i !== index);
      setRequiredApprovers(updated);
    }
  };

  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "department" as GroupType,
    description: "",
    currency: 'USDC' as CryptoCurrency, // 그룹 전체 자산 설정
    monthlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    quarterlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    yearlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    budgetSetup: null as BudgetSetup | null, // 새로운 예산 설정
    manager: "",
  });

  // 그룹 자산 변경 시 모든 예산의 자산도 함께 변경
  const handleCurrencyChange = (currency: CryptoCurrency) => {
    setNewGroup({
      ...newGroup,
      currency,
      monthlyBudget: { ...newGroup.monthlyBudget, currency },
      quarterlyBudget: { ...newGroup.quarterlyBudget, currency },
      yearlyBudget: { ...newGroup.yearlyBudget, currency },
    });
  };

  // 년도 변경 핸들러
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // 년도 변경시 기존 예산 설정 초기화
    setNewGroup({
      ...newGroup,
      budgetSetup: null
    });
  };

  // 예산 설정 생성
  const handleCreateBudgetSetup = (
    baseType: 'yearly' | 'quarterly' | 'monthly',
    baseAmount: number,
    selectedQuarter?: number,
    selectedMonth?: number
  ) => {
    try {
      setErrorMessage(null); // 에러 메시지 초기화
      const budgetSetup = distributeBudget(
        baseAmount,
        newGroup.currency,
        selectedYear,
        baseType,
        selectedQuarter,
        selectedMonth
      );

      setNewGroup({
        ...newGroup,
        budgetSetup
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "예산 생성 중 오류가 발생했습니다.");
    }
  };

  // 예산 설정 변경
  const handleBudgetSetupChange = (updatedSetup: BudgetSetup) => {
    setNewGroup({
      ...newGroup,
      budgetSetup: updatedSetup
    });
  };

  // 에러 메시지 핸들러 (빈 문자열을 null로 변환)
  const handleError = (message: string) => {
    setErrorMessage(message === "" ? null : message);
  };

  // 예산 검증 함수
  const isBudgetValid = (): boolean => {
    if (!newGroup.budgetSetup) return false;

    const totalDistributed = newGroup.budgetSetup.monthlyBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const baseAmount = newGroup.budgetSetup.baseAmount;

    return totalDistributed === baseAmount;
  };

  // 전체 폼 유효성 검사
  const isFormValid = (): boolean => {
    const validApprovers = requiredApprovers.filter(id => id !== "");
    return (
      newGroup.name.trim() !== "" &&
      newGroup.description.trim() !== "" &&
      newGroup.manager !== "" &&
      validApprovers.length > 0 &&
      isBudgetValid()
    );
  };


  const handleCreateGroup = () => {
    const validApprovers = requiredApprovers.filter(id => id !== "");

    // 그룹 생성 요청 생성
    const groupRequest = {
      id: `req-${Date.now()}`,
      ...newGroup,
      status: "pending",
      requestedBy: "현재사용자", // TODO: 실제 사용자 정보
      requestedAt: new Date().toISOString(),
      requiredApprovals: validApprovers,
      approvals: [],
      rejections: []
    };

    console.log("Creating group approval request:", groupRequest);

    // 임시로 새 그룹을 groups 상태에 추가 (실제로는 승인 후 추가되어야 함)
    const newGroupForList: WalletGroup = {
      ...groupRequest,
      id: `group-${Date.now()}`,
      balance: { amount: 0, currency: newGroup.currency },
      budgetUsed: { amount: 0, currency: newGroup.currency },
      quarterlyBudgetUsed: { amount: 0, currency: newGroup.currency },
      yearlyBudgetUsed: { amount: 0, currency: newGroup.currency },
      members: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      requiredApprovals: validApprovers,
      budgetSetup: newGroup.budgetSetup || undefined,
    };

    setGroups(prevGroups => [...prevGroups, newGroupForList]);

    if (onCreateGroupRequest) {
      onCreateGroupRequest(groupRequest);
    }

    if (onCreateGroup) {
      onCreateGroup();
    }

    handleCloseModal();
    setSelectedYear(currentYear);
    setNewGroup({
      name: "",
      type: "department",
      description: "",
      currency: 'USDC' as CryptoCurrency,
      monthlyBudget: { amount: 0, currency: 'USDC' },
      quarterlyBudget: { amount: 0, currency: 'USDC' },
      yearlyBudget: { amount: 0, currency: 'USDC' },
      budgetSetup: null,
      manager: "",
    });
    // 필수 결재자 상태 초기화
    setRequiredApprovers(['']);

    alert("그룹 생성 요청이 승인 대기 상태로 등록되었습니다.");
  };

  const handleCloseModal = () => {
    setErrorMessage(null); // 에러 메시지 초기화
    if (onCloseCreateModal) {
      onCloseCreateModal();
    } else {
      setInternalShowCreateModal(false);
    }
  };

  return (
    <>
      {/* 그룹 카드 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.filter(group => !group.status || group.status === 'active' || group.status === 'pending').map((group) => {
          const usagePercentage = getBudgetUsagePercentage(group);
          const isOverBudget = usagePercentage > 100;
          const isNearLimit = usagePercentage > 80;
          const isModerate = usagePercentage > 60;
          
          return (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 헤더 섹션 */}
              <div className="p-4 bg-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {group.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(
                          group.type
                        )}`}
                      >
                        {getTypeName(group.type)}
                      </span>
                      {group.budgetSetup && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {group.budgetSetup.year}년 기준
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    isOverBudget ? 'bg-red-100' : 
                    isNearLimit ? 'bg-orange-100' : 
                    isModerate ? 'bg-yellow-100' : 
                    'bg-green-100'
                  }`}>
                    <WalletIcon className={`h-6 w-6 ${
                      isOverBudget ? 'text-red-600' : 
                      isNearLimit ? 'text-orange-600' : 
                      isModerate ? 'text-yellow-600' : 
                      'text-green-600'
                    }`} />
                  </div>
                </div>
              </div>

              {/* 잔액 및 예산 정보 */}
              <div className="p-4 space-y-4">
                {/* 현재 기간 예산 잔액 - 개선된 표시 */}
                <div className="border border-gray-200 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    {(() => {
                      const currentBudget = getCurrentPeriodBudget(group);
                      const remaining = currentBudget.budget - currentBudget.used;

                      return (
                        <>
                          <span className="text-sm font-medium text-gray-600">
                            {group.budgetSetup ? '현재 월' : '월간'} 예산 잔액
                          </span>
                          <div className="text-xl font-bold text-gray-900">
                            {formatCryptoAmountWithIcon({
                              amount: remaining,
                              currency: currentBudget.currency
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 월 예산 사용 현황 - 시각적 개선 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {group.budgetSetup ? '현재 월' : '월'} 예산 사용
                    </span>
                    <div className="text-right">
                      {(() => {
                        const currentBudget = getCurrentPeriodBudget(group);
                        return (
                          <>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCryptoAmount({
                                amount: currentBudget.used,
                                currency: currentBudget.currency
                              })} / {formatCryptoAmount({
                                amount: currentBudget.budget,
                                currency: currentBudget.currency
                              })}
                            </div>
                            <div className={`text-xs ${
                              isOverBudget ? 'text-red-600 font-bold' :
                              isNearLimit ? 'text-orange-600 font-medium' :
                              isModerate ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {usagePercentage}% 사용
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isOverBudget ? "bg-red-500" :
                          isNearLimit ? "bg-orange-500" :
                          isModerate ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(usagePercentage, 100)}%`,
                        }}
                      />
                    </div>
                    {isOverBudget && (
                      <div className="absolute -top-1 -right-1">
                        <svg className="h-5 w-5 text-red-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {isOverBudget && (
                    <div className="bg-red-100 border border-red-300 rounded-lg px-2 py-1">
                      <p className="text-xs text-red-700 font-medium">⚠️ 예산 초과!</p>
                    </div>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <div className="bg-orange-100 border border-orange-300 rounded-lg px-2 py-1">
                      <p className="text-xs text-orange-700">주의: 예산 한도 근접</p>
                    </div>
                  )}
                </div>

                {/* 예산 정보 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {group.budgetSetup ? (
                    <div className={`grid divide-x divide-gray-200 ${
                      group.budgetSetup.baseType === 'yearly' ? 'grid-cols-3' :
                      group.budgetSetup.baseType === 'quarterly' ? 'grid-cols-2' :
                      'grid-cols-1'
                    }`}>
                      {/* 월간 예산 - 항상 표시 */}
                      <div className="p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">{getCurrentMonthName()} 예산</div>
                        <div className="text-sm font-semibold">
                          {formatCryptoAmount({
                            amount: getCurrentMonthlyBudgetFromSetup(group.budgetSetup),
                            currency: group.budgetSetup.currency
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          잔여: {formatCryptoAmount({
                            amount: getCurrentMonthlyBudgetFromSetup(group.budgetSetup) - group.budgetUsed.amount,
                            currency: group.budgetSetup.currency
                          })}
                        </div>
                      </div>

                      {/* 분기 예산 - quarterly와 yearly일 때만 */}
                      {(group.budgetSetup.baseType === 'quarterly' || group.budgetSetup.baseType === 'yearly') && (
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">{getCurrentQuarterName()} 예산</div>
                          <div className="text-sm font-semibold">
                            {formatCryptoAmount({
                              amount: getCurrentQuarterlyBudgetFromSetup(group.budgetSetup),
                              currency: group.budgetSetup.currency
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getQuarterlyBudgetUsagePercentage(group)}% 사용
                          </div>
                        </div>
                      )}

                      {/* 연간 예산 - yearly일 때만 */}
                      {group.budgetSetup.baseType === 'yearly' && (
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">{getCurrentYearName()} 예산</div>
                          <div className="text-sm font-semibold">
                            {formatCryptoAmount({
                              amount: getYearlyBudgetFromSetup(group.budgetSetup),
                              currency: group.budgetSetup.currency
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getYearlyBudgetUsagePercentage(group)}% 사용
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`grid divide-x divide-gray-200 ${
                      group.yearlyBudget.amount > 0 ? 'grid-cols-3' :
                      group.quarterlyBudget.amount > 0 ? 'grid-cols-2' :
                      'grid-cols-1'
                    }`}>
                      <div className="p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">월간 예산</div>
                        <div className="text-sm font-semibold">{formatCryptoAmount(group.monthlyBudget)}</div>
                        <div className="text-xs text-gray-400">
                          잔여: {formatCryptoAmount({ amount: group.monthlyBudget.amount - group.budgetUsed.amount, currency: group.monthlyBudget.currency })}
                        </div>
                      </div>

                      {group.quarterlyBudget.amount > 0 && (
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">분기 예산</div>
                          <div className="text-sm font-semibold">{formatCryptoAmount(group.quarterlyBudget)}</div>
                          <div className="text-xs text-gray-400">
                            {getQuarterlyBudgetUsagePercentage(group)}% 사용
                          </div>
                        </div>
                      )}

                      {group.yearlyBudget.amount > 0 && (
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">연간 예산</div>
                          <div className="text-sm font-semibold">{formatCryptoAmount(group.yearlyBudget)}</div>
                          <div className="text-xs text-gray-400">
                            {getYearlyBudgetUsagePercentage(group)}% 사용
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 그룹 정보 */}
                <div className="space-y-2 py-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {getUserNameById(group.manager)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        결재자 {group.requiredApprovals?.length || 0}명
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(group.createdAt)}
                    </div>
                  </div>

                  {/* 상태 정보 */}
                  {group.status && group.status !== 'active' && (
                    <div className="flex items-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        group.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.status === 'pending' ? '승인 대기' :
                         group.status === 'approved' ? '승인됨' : '반려됨'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    상세 분석
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    <CogIcon className="h-4 w-4 mr-1" />
                    설정
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 그룹 생성 모달 */}
      <Modal isOpen={showCreateModal}>
        <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* 고정 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                새 그룹 생성
              </h3>
              <button
                onClick={handleCloseModal}
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

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateGroup();
                }}
                className="space-y-4"
              >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹명 *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 유형 *
                </label>
                <select
                  value={newGroup.type}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      type: e.target.value as GroupType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="department">부서</option>
                  <option value="project">프로젝트</option>
                  <option value="team">팀</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산 *
                </label>
                <select
                  value={newGroup.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as CryptoCurrency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  이 그룹의 모든 예산은 선택한 자산으로 설정됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기준 년도 *
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={currentYear}>{currentYear}년</option>
                  <option value={currentYear + 1}>{currentYear + 1}년</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  예산 계산의 기준이 되는 년도입니다. 과거 년도는 선택할 수 없습니다.
                </p>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 *
                </label>
                <select
                  value={newGroup.manager}
                  onChange={(e) => setNewGroup({ ...newGroup, manager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">관리자 선택</option>
                  {getEligibleUsers().map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department} - {user.position}) - {ROLE_NAMES[user.role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* 필수 결재자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  필수 결재자 *
                </label>
                <div className="space-y-2">
                  {requiredApprovers.map((approverId, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <select
                        value={approverId}
                        onChange={(e) => handleApproverChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">결재자 선택</option>
                        {getEligibleApprovers(false).filter(user =>
                          !requiredApprovers.includes(user.id) || user.id === approverId
                        ).map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.department} - {user.position}) - {ROLE_NAMES[user.role]}
                          </option>
                        ))}
                      </select>
                      {requiredApprovers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveApprover(index)}
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
                    type="button"
                    onClick={handleAddApprover}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + 결재자 추가
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-sm text-red-700 font-medium">
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* 예산 설정 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900">예산 설정</h4>
                  <p className="text-xs text-gray-500">기준 예산을 설정하면 자동으로 하위 기간별 예산이 분배됩니다</p>
                </div>

                <div className="space-y-6">
                  {!newGroup.budgetSetup ? (
                    <BudgetSetupForm
                      currency={newGroup.currency}
                      year={selectedYear}
                      onCreateBudgetSetup={handleCreateBudgetSetup}
                    />
                  ) : (
                    <div>
                      <BudgetDistribution
                        budgetSetup={newGroup.budgetSetup}
                        onChange={handleBudgetSetupChange}
                        onError={handleError}
                        className="mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setNewGroup({ ...newGroup, budgetSetup: null });
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        예산 설정 다시하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              </form>
            </div>

            {/* 고정 푸터 */}
            <div className="border-t border-gray-200 p-6 flex-shrink-0">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isFormValid()) {
                      handleCreateGroup();
                    }
                  }}
                  disabled={!isFormValid()}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isFormValid()
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!isFormValid() ? (
                    !newGroup.manager ? '관리자를 선택해주세요' :
                    requiredApprovers.filter(id => id !== "").length === 0 ? '필수 결재자를 선택해주세요' :
                    !isBudgetValid() ? '예산 배분을 정확히 맞춰주세요' :
                    '모든 필수 항목을 입력해주세요'
                  ) : ''}
                >
                  승인 요청
                </button>
              </div>
            </div>
        </div>
      </Modal>
    </>
  );
}