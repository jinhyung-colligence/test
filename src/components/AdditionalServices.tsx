"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";

interface AdditionalServicesProps {
  plan: ServicePlan;
  initialTab?: "staking" | "lending" | "swap" | "krw";
}

interface StakingPosition {
  id: string;
  asset: string;
  amount: string;
  validator: string;
  apy: number;
  rewards: string;
  status: "active" | "unstaking";
}

interface LendingPosition {
  id: string;
  asset: string;
  amount: string;
  apy: number;
  earned: string;
  maturity: string;
  status: "active" | "completed";
}

export default function AdditionalServices({
  plan,
  initialTab,
}: AdditionalServicesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<
    "staking" | "lending" | "swap" | "krw"
  >(initialTab || "staking");

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "staking" | "lending" | "swap" | "krw") => {
    setActiveTab(newTab);
    router.push(`/services/${newTab}`);
  };

  const stakingPositions: StakingPosition[] = [
    {
      id: "1",
      asset: "ETH",
      amount: "32.0",
      validator: "Ethereum 2.0",
      apy: 4.2,
      rewards: "1.344",
      status: "active",
    },
    {
      id: "2",
      asset: "SOL",
      amount: "500",
      validator: "Solana Validator",
      apy: 6.8,
      rewards: "34.0",
      status: "active",
    },
  ];

  const lendingPositions: LendingPosition[] = [
    {
      id: "1",
      asset: "USDC",
      amount: "50000",
      apy: 8.5,
      earned: "4250",
      maturity: "2024-06-15",
      status: "active",
    },
    {
      id: "2",
      asset: "USDT",
      amount: "25000",
      apy: 7.2,
      earned: "1800",
      maturity: "2024-05-30",
      status: "active",
    },
  ];

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(numValue * 1300); // Simplified conversion
  };

  const renderStaking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">스테이킹 서비스</h2>
          <p className="text-gray-600">자산을 스테이킹하여 보상을 받아보세요</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />새 스테이킹
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                총 스테이킹 자산
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(42000 * 1300)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">누적 보상</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(1894 * 1300)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">평균 APY</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">4.85%</p>
            </div>
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            스테이킹 포지션
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  검증인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  APY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stakingPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${position.asset.toLowerCase()}.png`}
                        alt={position.asset}
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                              <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                ${position.asset}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <span className="font-semibold text-gray-900">
                        {position.asset}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.validator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {position.apy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.rewards} {position.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        position.status === "active"
                          ? "text-green-600 bg-green-50"
                          : "text-yellow-600 bg-yellow-50"
                      }`}
                    >
                      {position.status === "active" ? "활성" : "언스테이킹"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLending = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">렌딩 서비스</h2>
          <p className="text-gray-600">
            자산을 대출하여 이자 수익을 창출하세요
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />새 렌딩
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">총 렌딩 자산</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(75000 * 1300)}
              </p>
            </div>
            <BanknotesIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">누적 수익</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(6050 * 1300)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">평균 APY</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">7.85%</p>
            </div>
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">렌딩 포지션</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대출 금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  APY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  누적 수익
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lendingPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${position.asset.toLowerCase()}.png`}
                        alt={position.asset}
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                              <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                ${position.asset}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <span className="font-semibold text-gray-900">
                        {position.asset}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {position.apy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.earned} {position.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.maturity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        position.status === "active"
                          ? "text-green-600 bg-green-50"
                          : "text-blue-600 bg-blue-50"
                      }`}
                    >
                      {position.status === "active" ? "진행중" : "완료"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSwap = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">토큰 교환 서비스</h2>
        <p className="text-gray-600">
          Off-chain 방식으로 빠르고 안전한 자산 교환
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">자산 교환</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보내는 자산
            </label>
            <div className="flex space-x-2">
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                <option>BTC</option>
                <option>ETH</option>
                <option>USDC</option>
                <option>USDT</option>
              </select>
              <input
                type="number"
                placeholder="수량"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowsRightLeftIcon className="h-6 w-6 text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 자산
            </label>
            <div className="flex space-x-2">
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                <option>ETH</option>
                <option>BTC</option>
                <option>USDC</option>
                <option>USDT</option>
              </select>
              <input
                type="number"
                placeholder="예상 수량"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">교환 수수료:</span>
              <span className="font-semibold">0.25%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">슬리피지:</span>
              <span className="font-semibold">0.1%</span>
            </div>
          </div>

          <button className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            교환하기
          </button>
        </div>
      </div>
    </div>
  );

  const renderKRW = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">구매 대행 서비스</h2>
        <p className="text-gray-600">가상자산과 원화 간의 실시간 교환 서비스</p>
      </div>

      {/* 연결된 계좌 선택 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            연결된 은행 계좌
          </h3>
          <a
            href="/security"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            계좌 관리
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 기본 계좌 예시 */}
          <div className="border border-primary-200 bg-primary-50 rounded-lg p-4 cursor-pointer hover:bg-primary-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">KB국민은행</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    활성
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  ***-***-123456
                </div>
                <div className="text-xs text-gray-500">
                  일일 한도: ₩5,000,000
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">신한은행</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    대기
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  ***-***-789012
                </div>
                <div className="text-xs text-gray-500">
                  일일 한도: ₩3,000,000
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-4 h-4 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              구매 대행을 위해서는 연결된 은행 계좌가 필요합니다.
              <a href="/security" className="underline hover:no-underline">
                보안 설정
              </a>
              에서 계좌를 연결하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 가산자산 → 원화 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            가상자산 → 원화
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매할 가상자산
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                  <option>BTC - Bitcoin</option>
                  <option>ETH - Ethereum</option>
                  <option>SOL - Solana</option>
                  <option>USDT - Tether</option>
                  <option>USDC - USD Coin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매 수량
              </label>
              <input
                type="number"
                placeholder="0.1"
                step="0.00000001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">예상 받을 금액:</span>
                <span className="font-semibold text-lg">₩9,500,000</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">교환 수수료 (0.5%):</span>
                <span className="text-red-600">-₩47,500</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-600">실제 받을 금액:</span>
                <span className="font-bold text-green-600">₩9,452,500</span>
              </div>
            </div>
            <button
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled
            >
              가산자산 판매
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              계좌 연결 후 이용 가능합니다
            </p>
          </div>
        </div>

        {/* 원화 → 가산자산 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            원화 → 가산자산
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매할 가산자산
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                  <option>BTC - Bitcoin</option>
                  <option>ETH - Ethereum</option>
                  <option>SOL - Solana</option>
                  <option>USDT - Tether</option>
                  <option>USDC - USD Coin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매 금액 (KRW)
              </label>
              <input
                type="number"
                placeholder="1,000,000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">예상 받을 수량:</span>
                <span className="font-semibold text-lg">0.01052 BTC</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">교환 수수료 (0.5%):</span>
                <span className="text-red-600">-₩5,000</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-600">실제 받을 수량:</span>
                <span className="font-bold text-green-600">0.01047 BTC</span>
              </div>
            </div>
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled
            >
              가산자산 구매
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              계좌 연결 후 이용 가능합니다
            </p>
          </div>
        </div>
      </div>

      {/* 실시간 환율 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            실시간 환율 정보
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자산
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매수가 (KRW)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매도가 (KRW)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  스프레드
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  symbol: "BTC",
                  name: "Bitcoin",
                  buyPrice: 95000000,
                  sellPrice: 94500000,
                },
                {
                  symbol: "ETH",
                  name: "Ethereum",
                  buyPrice: 3200000,
                  sellPrice: 3180000,
                },
                {
                  symbol: "SOL",
                  name: "Solana",
                  buyPrice: 150000,
                  sellPrice: 149000,
                },
                {
                  symbol: "USDT",
                  name: "Tether",
                  buyPrice: 1320,
                  sellPrice: 1310,
                },
                {
                  symbol: "USDC",
                  name: "USD Coin",
                  buyPrice: 1320,
                  sellPrice: 1310,
                },
              ].map((rate) => {
                const spread = (
                  ((rate.buyPrice - rate.sellPrice) / rate.sellPrice) *
                  100
                ).toFixed(2);
                return (
                  <tr key={rate.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${rate.symbol.toLowerCase()}.png`}
                          alt={rate.symbol}
                          className="w-8 h-8 rounded-full mr-3"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                  ${rate.symbol}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {rate.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rate.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-blue-600">
                        ₩{rate.buyPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-red-600">
                        ₩{rate.sellPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">{spread}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "staking", name: "스테이킹", icon: ChartBarIcon },
    { id: "lending", name: "렌딩", icon: BanknotesIcon },
    { id: "swap", name: "교환", icon: ArrowsRightLeftIcon },
    { id: "krw", name: "구매 대행", icon: CurrencyDollarIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">부가 서비스</h1>
        <p className="text-gray-600 mt-1">
          스테이킹, 렌딩, 교환 등 다양한 부가 서비스를 이용하세요
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "staking" && renderStaking()}
        {activeTab === "lending" && renderLending()}
        {activeTab === "swap" && renderSwap()}
        {activeTab === "krw" && renderKRW()}
      </div>
    </div>
  );
}
