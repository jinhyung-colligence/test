'use client'

import { useState } from 'react'
import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon, 
  ChartBarIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'

interface AdditionalServicesProps {
  plan: ServicePlan
}

interface StakingPosition {
  id: string
  asset: string
  amount: string
  validator: string
  apy: number
  rewards: string
  status: 'active' | 'unstaking'
}

interface LendingPosition {
  id: string
  asset: string
  amount: string
  apy: number
  earned: string
  maturity: string
  status: 'active' | 'completed'
}

export default function AdditionalServices({ plan }: AdditionalServicesProps) {
  const [activeTab, setActiveTab] = useState<'staking' | 'lending' | 'swap' | 'krw'>('staking')

  const stakingPositions: StakingPosition[] = [
    {
      id: '1',
      asset: 'ETH',
      amount: '32.0',
      validator: 'Ethereum 2.0',
      apy: 4.2,
      rewards: '1.344',
      status: 'active'
    },
    {
      id: '2',
      asset: 'ADA',
      amount: '10000',
      validator: 'Cardano Pool',
      apy: 5.5,
      rewards: '550',
      status: 'active'
    }
  ]

  const lendingPositions: LendingPosition[] = [
    {
      id: '1',
      asset: 'USDC',
      amount: '50000',
      apy: 8.5,
      earned: '4250',
      maturity: '2024-06-15',
      status: 'active'
    },
    {
      id: '2',
      asset: 'USDT',
      amount: '25000',
      apy: 7.2,
      earned: '1800',
      maturity: '2024-05-30',
      status: 'active'
    }
  ]

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(numValue * 1300) // Simplified conversion
  }

  const renderStaking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">스테이킹 서비스</h2>
          <p className="text-gray-600">자산을 스테이킹하여 보상을 받아보세요</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          새 스테이킹
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">총 스테이킹 자산</p>
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
          <h3 className="text-lg font-semibold text-gray-900">스테이킹 포지션</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자산</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">검증인</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보상</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stakingPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {position.asset}
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      position.status === 'active' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                    }`}>
                      {position.status === 'active' ? '활성' : '언스테이킹'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderLending = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">렌딩 서비스</h2>
          <p className="text-gray-600">자산을 대출하여 이자 수익을 창출하세요</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          새 렌딩
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자산</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대출 금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">누적 수익</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">만료일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lendingPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {position.asset}
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      position.status === 'active' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
                    }`}>
                      {position.status === 'active' ? '진행중' : '완료'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSwap = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">토큰 교환 서비스</h2>
        <p className="text-gray-600">Off-chain 방식으로 빠르고 안전한 자산 교환</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">자산 교환</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">보내는 자산</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">받는 자산</label>
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
  )

  const renderKRW = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">원화 교환 서비스</h2>
        <p className="text-gray-600">제휴 계좌 연동을 통한 원화 입출금</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">원화 입금</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">입금 금액 (KRW)</label>
              <input 
                type="number" 
                placeholder="1,000,000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연결 계좌</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option>신한은행 ****-**-1234</option>
                <option>우리은행 ****-**-5678</option>
              </select>
            </div>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              입금 신청
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">원화 출금</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출금 금액 (KRW)</label>
              <input 
                type="number" 
                placeholder="500,000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출금 계좌</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option>신한은행 ****-**-1234</option>
                <option>우리은행 ****-**-5678</option>
              </select>
            </div>
            <button className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              출금 신청
            </button>
          </div>
        </div>
      </div>

      {plan !== 'free' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC/AML 상태</h3>
          <div className="flex items-center space-x-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">인증 완료</p>
              <p className="text-sm text-gray-600">신원 확인 및 자금세탁 방지 절차가 완료되었습니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const tabs = [
    { id: 'staking', name: '스테이킹', icon: ChartBarIcon },
    { id: 'lending', name: '렌딩', icon: BanknotesIcon },
    { id: 'swap', name: '교환', icon: ArrowsRightLeftIcon },
    { id: 'krw', name: '원화 교환', icon: CurrencyDollarIcon }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">부가 서비스</h1>
        <p className="text-gray-600 mt-1">스테이킹, 렌딩, 교환 등 다양한 부가 서비스를 이용하세요</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'staking' && renderStaking()}
        {activeTab === 'lending' && renderLending()}
        {activeTab === 'swap' && renderSwap()}
        {activeTab === 'krw' && renderKRW()}
      </div>
    </div>
  )
}