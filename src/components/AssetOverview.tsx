'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CurrencyDollarIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useLanguage } from '@/contexts/LanguageContext'
import { PriorityBadge } from './withdrawal/PriorityBadge'
import { StatusBadge } from './withdrawal/StatusBadge'
import { mockWithdrawalRequests } from '@/data/mockWithdrawalData'
import { formatAmount, formatDateTime } from '@/utils/withdrawalHelpers'
import CryptoIcon from '@/components/ui/CryptoIcon'

interface AssetOverviewProps {
  plan: ServicePlan
}

export default function AssetOverview({ plan }: AssetOverviewProps) {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const [activeWalletTab, setActiveWalletTab] = useState<'all' | 'hot' | 'cold'>('all')
  const [timePeriod, setTimePeriod] = useState<'hour' | 'day' | 'month'>('month')
  const { t, language } = useLanguage()
  const router = useRouter()

  const mockAssets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: '12.50', value: 750000000, change: -2.34, currentPrice: 60000000 },
    { symbol: 'ETH', name: 'Ethereum', balance: '156.75', value: 650000000, change: 3.45, currentPrice: 4150000 },
    { symbol: 'USDT', name: 'Tether', balance: '250000.00', value: 340000000, change: 0.02, currentPrice: 1360 },
    { symbol: 'USDC', name: 'USD Coin', balance: '185000.00', value: 251500000, change: -0.01, currentPrice: 1360 }
  ]

  // Filter actual withdrawal requests with submitted status (pending approval)
  const mockWithdrawalApprovals = mockWithdrawalRequests.filter(request => request.status === 'submitted')

  // 시간대별 차트 데이터
  const getChartData = (period: 'hour' | 'day' | 'month') => {
    switch (period) {
      case 'hour':
        return [
          { name: '00:00', value: 275000000 },
          { name: '04:00', value: 278000000 },
          { name: '08:00', value: 272000000 },
          { name: '12:00', value: 280000000 },
          { name: '16:00', value: 285000000 },
          { name: '20:00', value: 282000000 }
        ]
      case 'day':
        return [
          { name: '월', value: 270000000 },
          { name: '화', value: 275000000 },
          { name: '수', value: 268000000 },
          { name: '목', value: 282000000 },
          { name: '금', value: 285000000 },
          { name: '토', value: 280000000 },
          { name: '일', value: 275000000 }
        ]
      case 'month':
      default:
        return [
          { name: t('overview.months.jan'), value: 200000000 },
          { name: t('overview.months.feb'), value: 220000000 },
          { name: t('overview.months.mar'), value: 180000000 },
          { name: t('overview.months.apr'), value: 250000000 },
          { name: t('overview.months.may'), value: 275000000 },
          { name: t('overview.months.jun'), value: 275000000 },
          { name: t('overview.months.jul'), value: 290000000 },
          { name: t('overview.months.aug'), value: 285000000 },
          { name: t('overview.months.sep'), value: 295000000 }
        ]
    }
  }

  const chartData = getChartData(timePeriod)

  // 지갑 유형별 자산 데이터 (색상은 고정)
  const getWalletData = (type: 'all' | 'hot' | 'cold') => {
    const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'] // 고정된 색상
    
    switch (type) {
      case 'all':
        return mockAssets.map((asset, index) => ({
          name: asset.symbol,
          value: asset.value,
          color: colors[index]
        }))
      case 'hot':
        return mockAssets.map((asset, index) => ({
          name: asset.symbol,
          value: asset.value * 0.2, // 20%
          color: colors[index]
        }))
      case 'cold':
        return mockAssets.map((asset, index) => ({
          name: asset.symbol,
          value: asset.value * 0.8, // 80%
          color: colors[index]
        }))
    }
  }

  const pieData = getWalletData(activeWalletTab)

  // 현재 탭에 따른 총 자산 가치 계산
  const getCurrentTotalValue = () => {
    return pieData.reduce((sum, item) => sum + item.value, 0)
  }

  const totalValue = getCurrentTotalValue()
  const selectedAsset = pieData[selectedAssetIndex]
  const selectedPercentage = selectedAsset ? ((selectedAsset.value / totalValue) * 100).toFixed(1) : '0'

  const handlePieClick = (data: any, index: number) => {
    setSelectedAssetIndex(index)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en-US').format(value) + ' 원'
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'normal':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const highUrgencyApprovals = mockWithdrawalApprovals.filter(request => request.priority === 'high' || request.priority === 'critical')
  const totalPendingValue = mockWithdrawalApprovals.reduce((sum, request) => {
    // Sum all amounts regardless of currency for display purposes
    return sum + request.amount;
  }, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('overview.title')}</h1>
          <p className="text-gray-600 mt-1">{t('overview.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showBalances ? (
            <>
              <EyeSlashIcon className="h-5 w-5 mr-2" />
              {t('overview.hide_balance')}
            </>
          ) : (
            <>
              <EyeIcon className="h-5 w-5 mr-2" />
              {t('overview.show_balance')}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.total_asset_value')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {showBalances ? formatCurrency(totalValue) : '***,***,***'}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.daily_change')}</p>
              <p className="text-2xl font-bold text-sky-600 mt-1">+2.45%</p>
            </div>
            <div className="p-3 bg-sky-50 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.asset_types')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mockAssets.length}{t('overview.asset_types_count')}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Withdrawal Approvals Section - Only show if there are pending approvals and plan is enterprise */}
      {plan === 'enterprise' && mockWithdrawalApprovals.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">출금 승인 대기</h3>
                <p className="text-sm text-gray-600">{mockWithdrawalApprovals.length}건의 출금 신청이 승인을 기다리고 있습니다</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/withdrawal')}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              출금 관리로 이동
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출금 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자산</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기안자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승인진행률</th>
                </tr>
              </thead>
              <tbody>
                {mockWithdrawalApprovals.slice(0, 3).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {request.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(request.initiatedAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CryptoIcon
                          symbol={request.currency}
                          size={32}
                          className="mr-3 flex-shrink-0"
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">
                            {formatAmount(request.amount, request.currency)}
                          </p>
                          <p className="text-gray-500">
                            {request.currency}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.initiator}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={request.priority as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {request.approvals.length}/{request.requiredApprovals.length}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(request.approvals.length / request.requiredApprovals.length) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {mockWithdrawalApprovals.length > 3 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <span className="text-sm text-gray-600">
                외 {mockWithdrawalApprovals.length - 3}건이 더 있습니다
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('overview.price_trend')}</h3>
            
            {/* 시간 주기 선택 버튼을 제목 아래로 이동 */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {[
                { id: 'hour', name: '시간', desc: '시간별 추이' },
                { id: 'day', name: '일', desc: '일별 추이' },
                { id: 'month', name: '월', desc: '월별 추이' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setTimePeriod(period.id as typeof timePeriod)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timePeriod === period.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={period.desc}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('overview.asset_distribution')}</h3>
              
              {/* 지갑 유형 탭을 제목 아래로 이동 */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                  { id: 'all', name: 'All', desc: '전체 자산' },
                  { id: 'hot', name: 'Hot', desc: '온라인 지갑 (20%)' },
                  { id: 'cold', name: 'Cold', desc: '오프라인 지갑 (80%)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWalletTab(tab.id as typeof activeWalletTab)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeWalletTab === tab.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={tab.desc}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 전체 자산을 오른쪽 위에 심플하게 배치 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {showBalances ? formatCurrency(totalValue) : '***,***,***'}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Donut Chart - Left */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      onClick={handlePieClick}
                      className="cursor-pointer"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={selectedAssetIndex === index ? '#374151' : 'transparent'}
                          strokeWidth={selectedAssetIndex === index ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center content - 선택한 자산 정보 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    {selectedAsset && (
                      <>
                        <div className="text-xl font-bold text-gray-900">
                          {selectedAsset.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedPercentage}%
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {showBalances ? formatCurrency(selectedAsset.value) : '***,***,***'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend - Right */}
            <div className="flex-1">
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAssetIndex === index ? 'bg-gray-50' : 'hover:bg-gray-25'
                    }`}
                    onClick={() => setSelectedAssetIndex(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {showBalances ? `₩${entry.value.toLocaleString()}` : '₩***,***'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 알림 메시지 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">
                "All, Hot, Cold"는 나중에 ABC 관리자 에서 노출할 예정이며, 기업용 관리자 대시보드에서는 All 하나만 노출 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('overview.holdings')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.asset')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.balance')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.value_krw')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.change_24h')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAssets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 mr-3">
                        <CryptoIcon
                          symbol={asset.symbol}
                          size={40}
                          className=""
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{asset.symbol}</p>
                        <p className="text-sm text-gray-500">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? Number(asset.balance).toLocaleString() : '***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? formatCurrency(asset.value) : '***,***,***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-semibold ${
                      asset.change >= 0 ? 'text-sky-600' : 'text-red-600'
                    }`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
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
}