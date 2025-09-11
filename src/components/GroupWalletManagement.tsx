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

interface GroupWalletManagementProps {
  plan: ServicePlan;
}

type GroupType = "department" | "project" | "team";
type ExpenseStatus = "pending" | "approved" | "rejected" | "draft";
type CryptoCurrency = 'BTC' | 'ETH' | 'SOL' | 'USDC' | 'USDT';

interface CryptoAmount {
  amount: number;
  currency: CryptoCurrency;
}

interface WalletGroup {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  balance: CryptoAmount;
  monthlyBudget: CryptoAmount;
  quarterlyBudget: CryptoAmount;
  yearlyBudget: CryptoAmount;
  budgetUsed: CryptoAmount;
  quarterlyBudgetUsed: CryptoAmount;
  yearlyBudgetUsed: CryptoAmount;
  members: string[];
  manager: string;
  createdAt: string;
}

interface ExpenseRequest {
  id: string;
  groupId: string;
  title: string;
  amount: CryptoAmount;
  description: string;
  category: string;
  requestedBy: string;
  requestedAt: string;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

// 가상자산별 소수점 자리수 정의
const getCurrencyDecimals = (currency: CryptoCurrency): number => {
  const decimals = {
    'BTC': 8,
    'ETH': 6, 
    'SOL': 4,
    'USDC': 2,
    'USDT': 2
  };
  return decimals[currency];
};

// 가상자산 아이콘 URL 매핑
const getCryptoIconUrl = (currency: CryptoCurrency): string => {
  const iconMap: { [key: string]: string } = {
    'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png',
    'ETH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png',
    'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png',
    'USDC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdc.png',
    'USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdt.png',
  };
  
  return iconMap[currency] || 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/generic.png';
};

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

// 가상자산 금액 포맷팅
const formatCryptoAmount = (cryptoAmount: CryptoAmount): string => {
  const decimals = getCurrencyDecimals(cryptoAmount.currency);
  const formattedNumber = cryptoAmount.amount.toFixed(decimals).replace(/\.?0+$/, '');
  return `${formattedNumber} ${cryptoAmount.currency}`;
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

// 예산 사용률 계산
const calculateBudgetUsageRate = (used: CryptoAmount, budget: CryptoAmount): number => {
  // 같은 통화인 경우에만 계산
  if (used.currency === budget.currency && budget.amount > 0) {
    return (used.amount / budget.amount) * 100;
  }
  return 0;
};

// 같은 통화별로 지출 합계 계산
const calculateExpenseSum = (expenses: ExpenseRequest[], status?: ExpenseStatus): { [currency: string]: number } => {
  const sums: { [currency: string]: number } = {};
  
  expenses
    .filter(e => !status || e.status === status)
    .forEach(e => {
      const currency = e.amount.currency;
      sums[currency] = (sums[currency] || 0) + e.amount.amount;
    });
  
  return sums;
};

// 통화별 합계를 표시용 문자열로 변환
const formatExpenseSums = (sums: { [currency: string]: number }): string => {
  return Object.entries(sums)
    .map(([currency, amount]) => formatCryptoAmount({ amount, currency: currency as CryptoCurrency }))
    .join(', ');
};

// 기간별 지출 필터링 함수
const getExpensesForPeriod = (expenses: ExpenseRequest[], period: "monthly" | "quarterly" | "yearly") => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.requestedAt);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    const expenseQuarter = Math.floor(expenseMonth / 3);
    
    switch (period) {
      case 'monthly':
        return expenseYear === currentYear && expenseMonth === currentMonth;
      case 'quarterly':
        return expenseYear === currentYear && expenseQuarter === currentQuarter;
      case 'yearly':
        return expenseYear === currentYear;
      default:
        return false;
    }
  });
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
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  
  // 승인 완료 탭용 페이지네이션 및 필터 state
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedItemsPerPage] = useState(10);
  const [completedSearchTerm, setCompletedSearchTerm] = useState("");
  const [completedStatusFilter, setCompletedStatusFilter] = useState<"all" | "approved" | "rejected">("all");
  const [completedDateRange, setCompletedDateRange] = useState<"all" | "7days" | "30days" | "90days">("all");
  
  const { t, language } = useLanguage();

  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "department" as GroupType,
    description: "",
    monthlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    quarterlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    yearlyBudget: { amount: 0, currency: 'USDC' as CryptoCurrency },
    manager: "",
  });

  const [newExpense, setNewExpense] = useState({
    groupId: "",
    title: "",
    amount: { amount: 0, currency: 'USDC' as CryptoCurrency },
    description: "",
    category: "operations",
  });

  const mockGroups: WalletGroup[] = [
    {
      id: "1",
      name: "마케팅팀",
      type: "department",
      description: "월간 예산만 활용하는 기본 운영팀",
      balance: { amount: 1250, currency: 'USDC' },
      monthlyBudget: { amount: 1500, currency: 'USDC' },
      quarterlyBudget: { amount: 0, currency: 'USDC' },
      yearlyBudget: { amount: 0, currency: 'USDC' },
      budgetUsed: { amount: 250, currency: 'USDC' },
      quarterlyBudgetUsed: { amount: 0, currency: 'USDC' },
      yearlyBudgetUsed: { amount: 0, currency: 'USDC' },
      members: ["김마케터", "이디자이너", "박콘텐츠"],
      manager: "최마케팅",
      createdAt: "2024-03-01",
    },
    {
      id: "2", 
      name: "NFT 마켓플레이스 프로젝트",
      type: "project",
      description: "월간 + 분기 예산을 활용하는 중기 프로젝트",
      balance: { amount: 48.5, currency: 'ETH' },
      monthlyBudget: { amount: 25.0, currency: 'ETH' },
      quarterlyBudget: { amount: 80.0, currency: 'ETH' },
      yearlyBudget: { amount: 0, currency: 'ETH' },
      budgetUsed: { amount: 18.2, currency: 'ETH' },
      quarterlyBudgetUsed: { amount: 32.5, currency: 'ETH' },
      yearlyBudgetUsed: { amount: 0, currency: 'ETH' },
      members: ["박프로젝트", "최디자인", "한마케팅", "정개발"],
      manager: "박PM",
      createdAt: "2024-02-01",
    },
    {
      id: "3",
      name: "IT 인프라팀",
      type: "department", 
      description: "월간 + 분기 + 연간 모든 예산을 활용하는 핵심 부서",
      balance: { amount: 2.15, currency: 'BTC' },
      monthlyBudget: { amount: 1.8, currency: 'BTC' },
      quarterlyBudget: { amount: 5.5, currency: 'BTC' },
      yearlyBudget: { amount: 22.0, currency: 'BTC' },
      budgetUsed: { amount: 1.2, currency: 'BTC' },
      quarterlyBudgetUsed: { amount: 3.1, currency: 'BTC' },
      yearlyBudgetUsed: { amount: 8.7, currency: 'BTC' },
      members: ["김인프라", "이시스템", "박네트워크", "최보안", "정데브옵스"],
      manager: "김CTO",
      createdAt: "2024-01-15",
    },
    {
      id: "4",
      name: "DeFi 연구팀",
      type: "team",
      description: "연간 집중 투자가 필요한 연구개발팀",
      balance: { amount: 850, currency: 'SOL' },
      monthlyBudget: { amount: 120, currency: 'SOL' },
      quarterlyBudget: { amount: 400, currency: 'SOL' },
      yearlyBudget: { amount: 1600, currency: 'SOL' },
      budgetUsed: { amount: 95, currency: 'SOL' },
      quarterlyBudgetUsed: { amount: 285, currency: 'SOL' },
      yearlyBudgetUsed: { amount: 920, currency: 'SOL' },
      members: ["이연구원", "박분석가"],
      manager: "최연구소장",
      createdAt: "2024-01-20",
    },
  ];

  const mockExpenses: ExpenseRequest[] = [
    // === 2025년 1월 (이번 달) ===
    {
      id: "1",
      groupId: "1",
      title: "1월 소셜미디어 광고비",
      amount: { amount: 180, currency: 'USDC' },
      description: "신규 년도 마케팅 캠페인",
      category: "marketing",
      requestedBy: "김마케터",
      requestedAt: "2025-01-05",
      status: "approved",
      approvedBy: "최마케팅",
      approvedAt: "2025-01-06",
    },
    {
      id: "2",
      groupId: "2",
      title: "1월 스마트 컨트랙트 업그레이드",
      amount: { amount: 5.2, currency: 'ETH' },
      description: "보안 패치 및 최적화",
      category: "software",
      requestedBy: "박프로젝트",
      requestedAt: "2025-01-08",
      status: "pending",
    },
    {
      id: "3",
      groupId: "3",
      title: "1월 AWS 인프라 비용",
      amount: { amount: 0.8, currency: 'BTC' },
      description: "신규 서비스 확장을 위한 인프라",
      category: "infrastructure",
      requestedBy: "김인프라",
      requestedAt: "2025-01-10",
      status: "rejected",
      rejectedReason: "예산 재검토 필요",
    },
    
    // === 2024년 12월 (작년) ===
    {
      id: "4",
      groupId: "1",
      title: "연말 브랜드 캠페인",
      amount: { amount: 320, currency: 'USDC' },
      description: "연말 프로모션 광고 비용",
      category: "marketing",
      requestedBy: "이디자이너",
      requestedAt: "2024-12-15",
      status: "approved",
      approvedBy: "최마케팅",
      approvedAt: "2024-12-16",
    },
    {
      id: "5",
      groupId: "2",
      title: "연말 UI/UX 개선",
      amount: { amount: 8.5, currency: 'ETH' },
      description: "사용자 경험 최적화",
      category: "software",
      requestedBy: "최디자인",
      requestedAt: "2024-12-20",
      status: "approved",
      approvedBy: "박PM",
      approvedAt: "2024-12-21",
    },
    {
      id: "6",
      groupId: "4",
      title: "연말 DeFi 연구 자료",
      amount: { amount: 120, currency: 'SOL' },
      description: "시장 분석 및 연구 도구",
      category: "software",
      requestedBy: "이연구원",
      requestedAt: "2024-12-10",
      status: "pending",
    },
    
    // === 2024년 11월 ===
    {
      id: "7",
      groupId: "3",
      title: "보안 시스템 강화",
      amount: { amount: 1.5, currency: 'BTC' },
      description: "방화벽 및 모니터링 시스템",
      category: "infrastructure",
      requestedBy: "최보안",
      requestedAt: "2024-11-25",
      status: "approved",
      approvedBy: "김CTO",
      approvedAt: "2024-11-26",
    },
    {
      id: "8",
      groupId: "1",
      title: "11월 콘텐츠 제작비",
      amount: { amount: 200, currency: 'USDC' },
      description: "영상 제작 및 편집",
      category: "marketing",
      requestedBy: "박콘텐츠",
      requestedAt: "2024-11-18",
      status: "rejected",
      rejectedReason: "다른 대안 검토 요청",
    },
    
    // === 2024년 10월 ===
    {
      id: "9",
      groupId: "4",
      title: "DeFi 프로토콜 분석 툴",
      amount: { amount: 90, currency: 'SOL' },
      description: "트레이딩 데이터 분석 소프트웨어",
      category: "software",
      requestedBy: "박분석가",
      requestedAt: "2024-10-22",
      status: "approved",
      approvedBy: "최연구소장",
      approvedAt: "2024-10-23",
    },
    {
      id: "10",
      groupId: "2",
      title: "10월 개발 환경 구축",
      amount: { amount: 6.8, currency: 'ETH' },
      description: "테스트넷 및 개발도구",
      category: "infrastructure",
      requestedBy: "정개발",
      requestedAt: "2024-10-15",
      status: "pending",
    },
    
    // === 2024년 9월 ===
    {
      id: "11",
      groupId: "3",
      title: "9월 클라우드 확장",
      amount: { amount: 0.9, currency: 'BTC' },
      description: "서버 용량 증설",
      category: "infrastructure",
      requestedBy: "이시스템",
      requestedAt: "2024-09-12",
      status: "approved",
      approvedBy: "김CTO",
      approvedAt: "2024-09-13",
    },
    {
      id: "12",
      groupId: "1",
      title: "9월 광고 캠페인",
      amount: { amount: 280, currency: 'USDC' },
      description: "추석 시즌 마케팅",
      category: "marketing",
      requestedBy: "김마케터",
      requestedAt: "2024-09-05",
      status: "rejected",
      rejectedReason: "효과 분석 후 재신청 요청",
    },
  ];

  const getTypeColor = (type: GroupType) => {
    const colors = {
      department: "bg-blue-100 text-blue-800",
      project: "bg-green-100 text-green-800",
      team: "bg-purple-100 text-purple-800",
    };
    return colors[type];
  };

  const getTypeName = (type: GroupType) => {
    const names = {
      department: "부서",
      project: "프로젝트",
      team: "팀",
    };
    return names[type];
  };

  const getStatusColor = (status: ExpenseStatus) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getStatusName = (status: ExpenseStatus) => {
    const names = {
      draft: "임시저장",
      pending: "승인대기",
      approved: "승인됨",
      rejected: "반려됨",
    };
    return names[status];
  };

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


  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getBudgetUsagePercentage = (group: WalletGroup) => {
    return Math.round(calculateBudgetUsageRate(group.budgetUsed, group.monthlyBudget));
  };

  // 승인 완료 탭 필터링 및 페이지네이션 로직
  const getFilteredCompletedExpenses = () => {
    let filtered = mockExpenses.filter(expense => expense.status === 'approved');
    
    // 상태 필터 (승인 완료 탭에서는 이미 approved만 필터링되므로 추가 필터링 불필요)
    
    // 검색 필터
    if (completedSearchTerm) {
      const searchLower = completedSearchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower) ||
        expense.requestedBy.toLowerCase().includes(searchLower)
      );
    }
    
    // 날짜 필터
    if (completedDateRange !== 'all') {
      const now = new Date();
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const days = daysMap[completedDateRange];
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.approvedAt || expense.requestedAt);
        return expenseDate >= cutoffDate;
      });
    }
    
    return filtered;
  };

  const getPaginatedCompletedExpenses = () => {
    const filtered = getFilteredCompletedExpenses();
    const startIndex = (completedCurrentPage - 1) * completedItemsPerPage;
    const endIndex = startIndex + completedItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / completedItemsPerPage)
    };
  };

  const getQuarterlyBudgetUsagePercentage = (group: WalletGroup) => {
    return Math.round(calculateBudgetUsageRate(group.quarterlyBudgetUsed, group.quarterlyBudget));
  };

  const getYearlyBudgetUsagePercentage = (group: WalletGroup) => {
    return Math.round(calculateBudgetUsageRate(group.yearlyBudgetUsed, group.yearlyBudget));
  };

  const handleCreateGroup = () => {
    console.log("Creating group:", newGroup);
    setShowCreateModal(false);
    setNewGroup({
      name: "",
      type: "department",
      description: "",
      monthlyBudget: { amount: 0, currency: 'USDC' },
      quarterlyBudget: { amount: 0, currency: 'USDC' },
      yearlyBudget: { amount: 0, currency: 'USDC' },
      manager: "",
    });
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockGroups.map((group) => {
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
                          <ExclamationCircleIcon className="h-5 w-5 text-red-600 animate-pulse" />
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
      )}

      {/* 승인 대기 탭 */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              승인 대기 중인 지출
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      그룹
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockExpenses
                    .filter(expense => expense.status === 'pending' || expense.status === 'rejected')
                    .map((expense) => {
                      const group = mockGroups.find(
                        (g) => g.id === expense.groupId
                      );
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {expense.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {expense.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {group?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getCryptoIcon(expense.amount.currency)}
                              <span className="font-semibold text-gray-900">
                                {formatCryptoAmount(expense.amount)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.requestedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(expense.requestedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expense.status === 'pending' ? (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                승인 대기
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  반려됨
                                </span>
                                {expense.rejectedReason && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {expense.rejectedReason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {expense.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveExpense(expense.id)}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                  >
                                    승인
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectExpense(expense.id, "검토 필요")
                                    }
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                  >
                                    반려
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleReapproveExpense(expense.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                >
                                  재승인 처리
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {/* 빈 상태 */}
              {mockExpenses.filter(expense => expense.status === 'pending' || expense.status === 'rejected').length === 0 && (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">승인 대기 중인 지출이 없습니다</p>
                  <p className="text-sm text-gray-500 mt-1">새로운 지출 요청이나 반려된 항목이 여기에 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 승인 완료 탭 */}
      {activeTab === "completed" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                처리 완료된 지출
              </h3>
              
              {/* 검색 및 필터 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="제목, 설명, 요청자 검색..."
                    value={completedSearchTerm}
                    onChange={(e) => setCompletedSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                {/* 기간 필터 */}
                <select
                  value={completedDateRange}
                  onChange={(e) => setCompletedDateRange(e.target.value as "all" | "7days" | "30days" | "90days")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 기간</option>
                  <option value="7days">최근 7일</option>
                  <option value="30days">최근 30일</option>
                  <option value="90days">최근 90일</option>
                </select>
              </div>
            </div>

            {(() => {
              const paginatedData = getPaginatedCompletedExpenses();
              
              return (
                <>
                  {/* 결과 요약 */}
                  <div className="mb-4 text-sm text-gray-600">
                    총 {paginatedData.totalItems}건의 결과 {paginatedData.totalPages > 0 ? `(${completedCurrentPage} / ${paginatedData.totalPages} 페이지)` : ''}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            요청 내용
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            그룹
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            금액
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            요청자
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상태
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            처리 정보
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.items.length > 0 ? paginatedData.items.map((expense) => {
                          const group = mockGroups.find(
                            (g) => g.id === expense.groupId
                          );
                          return (
                            <tr key={expense.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {expense.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {expense.description}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    요청일: {formatDate(expense.requestedAt)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {group?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getCryptoIcon(expense.amount.currency)}
                                  <span className="font-semibold text-gray-900">
                                    {formatCryptoAmount(expense.amount)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {expense.requestedBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(expense.status)}
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                                      expense.status
                                    )}`}
                                  >
                                    {getStatusName(expense.status)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {expense.status === 'approved' ? (
                                  <div className="text-sm">
                                    <p className="text-gray-900">승인: {expense.approvedBy}</p>
                                    <p className="text-xs text-gray-500">
                                      {expense.approvedAt && formatDate(expense.approvedAt)}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-sm">
                                    <p className="text-red-600 font-medium">반려 사유</p>
                                    <p className="text-xs text-gray-500">
                                      {expense.rejectedReason}
                                    </p>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center">
                              <div className="flex flex-col items-center">
                                <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">검색 결과가 없습니다.</p>
                                <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이지네이션 */}
                  {paginatedData.totalItems > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        {(completedCurrentPage - 1) * completedItemsPerPage + 1}
                        -
                        {Math.min(completedCurrentPage * completedItemsPerPage, paginatedData.totalItems)}
                        개 항목 중 {paginatedData.totalItems}개
                      </div>
                      
                      {paginatedData.totalPages > 0 && (
                        <div className="flex items-center space-x-2">
                          {/* 이전 페이지 */}
                          <button
                            onClick={() => setCompletedCurrentPage(Math.max(1, completedCurrentPage - 1))}
                            disabled={completedCurrentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            이전
                          </button>
                          
                          {/* 페이지 번호 */}
                          {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(
                              paginatedData.totalPages - 4,
                              completedCurrentPage - 2
                            )) + i;
                            
                            if (pageNum > paginatedData.totalPages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCompletedCurrentPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  completedCurrentPage === pageNum
                                    ? "bg-primary-600 text-white"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          {/* 다음 페이지 */}
                          <button
                            onClick={() => setCompletedCurrentPage(Math.min(paginatedData.totalPages, completedCurrentPage + 1))}
                            disabled={completedCurrentPage === paginatedData.totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            다음
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 예산 현황 탭 */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          {/* 지출 요약 - 최상단 배치 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                지출 요약
              </h3>
              
              {/* 기간 선택기 */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">기간</span>
                <div className="flex border border-gray-200 rounded-lg">
                  {(() => {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth() + 1; // 0-based이므로 +1
                    const currentQuarter = Math.floor(now.getMonth() / 3) + 1; // 1-4분기
                    
                    const periods = [
                      { 
                        id: 'monthly', 
                        label: `${currentYear}년 ${currentMonth}월`,
                        shortLabel: '이번 달'
                      },
                      { 
                        id: 'quarterly', 
                        label: `${currentYear}년 ${currentQuarter}분기`,
                        shortLabel: '이번 분기'
                      },
                      { 
                        id: 'yearly', 
                        label: `${currentYear}년`,
                        shortLabel: '올해'
                      }
                    ];
                    
                    return periods.map((period, index) => (
                      <button
                        key={period.id}
                        onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          selectedPeriod === period.id
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        } ${
                          index === 0 ? 'rounded-l-lg' : index === 2 ? 'rounded-r-lg' : ''
                        } border-r border-gray-200 last:border-r-0`}
                        title={period.label}
                      >
                        {period.shortLabel}
                      </button>
                    ));
                  })()}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const filteredExpenses = getExpensesForPeriod(mockExpenses, selectedPeriod);
                const approvedSums = calculateExpenseSum(filteredExpenses, "approved");
                const pendingSums = calculateExpenseSum(filteredExpenses, "pending");
                const rejectedSums = calculateExpenseSum(filteredExpenses, "rejected");
                
                return (
                  <>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold mb-1">
                            승인된 지출
                          </p>
                          <div className="space-y-1">
                            {Object.keys(approvedSums).length > 0 ? (
                              Object.entries(approvedSums).map(([currency, amount]) => (
                                <div key={currency} className="flex items-center space-x-2">
                                  {getCryptoIcon(currency as CryptoCurrency)}
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatCryptoAmount({ amount, currency: currency as CryptoCurrency })}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center">
                                <span className="text-2xl font-bold text-gray-300">0</span>
                                <p className="text-xs text-gray-400 mt-1">승인된 지출 없음</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <CheckCircleIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold mb-1">승인 대기</p>
                          <div className="space-y-1">
                            {Object.keys(pendingSums).length > 0 ? (
                              Object.entries(pendingSums).map(([currency, amount]) => (
                                <div key={currency} className="flex items-center space-x-2">
                                  {getCryptoIcon(currency as CryptoCurrency)}
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatCryptoAmount({ amount, currency: currency as CryptoCurrency })}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center">
                                <span className="text-2xl font-bold text-gray-300">0</span>
                                <p className="text-xs text-gray-400 mt-1">승인 대기 없음</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <ClockIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold mb-1">반려된 지출</p>
                          <div className="space-y-1">
                            {Object.keys(rejectedSums).length > 0 ? (
                              Object.entries(rejectedSums).map(([currency, amount]) => (
                                <div key={currency} className="flex items-center space-x-2">
                                  {getCryptoIcon(currency as CryptoCurrency)}
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatCryptoAmount({ amount, currency: currency as CryptoCurrency })}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center">
                                <span className="text-2xl font-bold text-gray-300">0</span>
                                <p className="text-xs text-gray-400 mt-1">반려된 지출 없음</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <XCircleIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold mb-1">
                            {selectedPeriod === 'monthly' ? '월간' : selectedPeriod === 'quarterly' ? '분기' : '연간'} 지출건수
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {filteredExpenses.length}건
                          </p>
                          <p className="text-xs text-gray-500 mt-1">전체 그룹: {mockGroups.length}개</p>
                        </div>
                        <UserGroupIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* 예산 현황 - 월별, 분기별, 연간 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  월별 예산 현황
                </h3>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  월간
                </div>
              </div>
              <div className="space-y-4">
                {mockGroups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <div className="text-right">
                        {formatCryptoAmountWithIcon(group.budgetUsed)}
                        <div className="text-xs text-gray-500 mt-1">
                          / {formatCryptoAmount(group.monthlyBudget)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          getBudgetUsagePercentage(group) > 80
                            ? "bg-red-500"
                            : getBudgetUsagePercentage(group) > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            getBudgetUsagePercentage(group),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        사용률: {getBudgetUsagePercentage(group)}%
                      </span>
                      <span className="text-gray-600">
                        잔여: {formatCryptoAmount({ amount: group.monthlyBudget.amount - group.budgetUsed.amount, currency: group.monthlyBudget.currency })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  분기별 예산 현황
                </h3>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  분기
                </div>
              </div>
              <div className="space-y-4">
                {mockGroups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <div className="text-right">
                        {formatCryptoAmountWithIcon(group.quarterlyBudgetUsed)}
                        <div className="text-xs text-gray-500 mt-1">
                          / {formatCryptoAmount(group.quarterlyBudget)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          getQuarterlyBudgetUsagePercentage(group) > 80
                            ? "bg-red-500"
                            : getQuarterlyBudgetUsagePercentage(group) > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            getQuarterlyBudgetUsagePercentage(group),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        사용률: {getQuarterlyBudgetUsagePercentage(group)}%
                      </span>
                      <span className="text-gray-600">
                        잔여: {formatCryptoAmount({ amount: group.quarterlyBudget.amount - group.quarterlyBudgetUsed.amount, currency: group.quarterlyBudget.currency })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  연간 예산 현황
                </h3>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  연간
                </div>
              </div>
              <div className="space-y-4">
                {mockGroups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <div className="text-right">
                        {formatCryptoAmountWithIcon(group.yearlyBudgetUsed)}
                        <div className="text-xs text-gray-500 mt-1">
                          / {formatCryptoAmount(group.yearlyBudget)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          getYearlyBudgetUsagePercentage(group) > 80
                            ? "bg-red-500"
                            : getYearlyBudgetUsagePercentage(group) > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            getYearlyBudgetUsagePercentage(group),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        사용률: {getYearlyBudgetUsagePercentage(group)}%
                      </span>
                      <span className="text-gray-600">
                        잔여: {formatCryptoAmount({ amount: group.yearlyBudget.amount - group.yearlyBudgetUsed.amount, currency: group.yearlyBudget.currency })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                새 그룹 생성
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
