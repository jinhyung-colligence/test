import { useState } from "react";
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
  WalletGroup
} from "@/types/groups";
import { Modal } from "@/components/common/Modal";
import { mockGroups } from "@/data/groupMockData";
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

export default function GroupManagement({ onCreateGroup, showCreateModal: externalShowCreateModal, onCloseCreateModal, onCreateGroupRequest }: GroupManagementProps) {
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  
  const showCreateModal = externalShowCreateModal !== undefined ? externalShowCreateModal : internalShowCreateModal;

  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "department" as GroupType,
    description: "",
    monthlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    quarterlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    yearlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    manager: "",
  });

  const handleCreateGroup = () => {
    // 그룹 생성 요청 생성
    const groupRequest = {
      id: `req-${Date.now()}`,
      ...newGroup,
      status: "pending",
      requestedBy: "현재사용자", // TODO: 실제 사용자 정보
      requestedAt: new Date().toISOString(),
      requiredApprovals: ["김매니저", "박재무", "최관리"], // TODO: 정책에 따른 결재자 선정
      approvals: [],
      rejections: []
    };

    console.log("Creating group approval request:", groupRequest);

    if (onCreateGroupRequest) {
      onCreateGroupRequest(groupRequest);
    }

    if (onCreateGroup) {
      onCreateGroup();
    }

    handleCloseModal();
    setNewGroup({
      name: "",
      type: "department",
      description: "",
      monthlyBudget: { amount: 0, currency: 'USDC' },
      quarterlyBudget: { amount: 0, currency: 'USDC' },
      yearlyBudget: { amount: 0, currency: 'USDC' },
      manager: "",
    });

    alert("그룹 생성 요청이 승인 대기 상태로 등록되었습니다.");
  };

  const handleCloseModal = () => {
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
        {mockGroups.filter(group => !group.status || group.status === 'active').map((group) => {
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
                {/* 최장 기간 예산 잔액 - 동적 표시 */}
                <div className="border border-gray-200 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    {group.yearlyBudget.amount > 0 ? (
                      <>
                        <span className="text-sm font-medium text-gray-600">연간 예산 잔액</span>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCryptoAmountWithIcon({ 
                            amount: group.yearlyBudget.amount - group.yearlyBudgetUsed.amount, 
                            currency: group.yearlyBudget.currency 
                          })}
                        </div>
                      </>
                    ) : group.quarterlyBudget.amount > 0 ? (
                      <>
                        <span className="text-sm font-medium text-gray-600">분기 예산 잔액</span>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCryptoAmountWithIcon({ 
                            amount: group.quarterlyBudget.amount - group.quarterlyBudgetUsed.amount, 
                            currency: group.quarterlyBudget.currency 
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-600">월간 예산 잔액</span>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCryptoAmountWithIcon({ 
                            amount: group.monthlyBudget.amount - group.budgetUsed.amount, 
                            currency: group.monthlyBudget.currency 
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 월 예산 사용 현황 - 시각적 개선 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">월 예산 사용</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCryptoAmount(group.budgetUsed)} / {formatCryptoAmount(group.monthlyBudget)}
                      </div>
                      <div className={`text-xs ${
                        isOverBudget ? 'text-red-600 font-bold' : 
                        isNearLimit ? 'text-orange-600 font-medium' : 
                        isModerate ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {usagePercentage}% 사용
                      </div>
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

                {/* 예산 기간별 요약 - 동적으로 표시 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                </div>

                {/* 그룹 정보 */}
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {group.manager}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {group.members.length}명
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(group.createdAt)}
                  </div>
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
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
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
                  월 예산 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    value={newGroup.monthlyBudget.amount}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        monthlyBudget: {
                          ...newGroup.monthlyBudget,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                  <select
                    value={newGroup.monthlyBudget.currency}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        monthlyBudget: {
                          ...newGroup.monthlyBudget,
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
                  분기 예산 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    value={newGroup.quarterlyBudget.amount}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        quarterlyBudget: {
                          ...newGroup.quarterlyBudget,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                  <select
                    value={newGroup.quarterlyBudget.currency}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        quarterlyBudget: {
                          ...newGroup.quarterlyBudget,
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
                  연 예산 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    value={newGroup.yearlyBudget.amount}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        yearlyBudget: {
                          ...newGroup.yearlyBudget,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                  <select
                    value={newGroup.yearlyBudget.currency}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        yearlyBudget: {
                          ...newGroup.yearlyBudget,
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
                  관리자 *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.manager}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, manager: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="관리자명을 입력하세요"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  승인 요청
                </button>
              </div>
            </form>
        </div>
      </Modal>
    </>
  );
}