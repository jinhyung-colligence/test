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

interface AssetOverviewProps {
  plan: ServicePlan
}

export default function AssetOverview({ plan }: AssetOverviewProps) {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const { t, language } = useLanguage()
  const router = useRouter()

  const mockAssets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: '2.45678', value: 125000000, change: 5.67, currentPrice: 50800000 },
    { symbol: 'ETH', name: 'Ethereum', balance: '45.234', value: 75000000, change: -2.34, currentPrice: 1658000 },
    { symbol: 'USDC', name: 'USD Coin', balance: '50000', value: 50000000, change: 0.01, currentPrice: 1000 },
    { symbol: 'USDT', name: 'Tether', balance: '25000', value: 25000000, change: -0.02, currentPrice: 1000 }
  ]

  // Mock withdrawal approval data
  const mockWithdrawalApprovals = [
    {
      id: 'WD-2024-001',
      user: '김철수',
      asset: 'BTC',
      amount: '0.5',
      value: 25000000,
      requestDate: '2024-03-15T14:30:00Z',
      urgency: 'high',
      destination: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
    },
    {
      id: 'WD-2024-002', 
      user: '이영희',
      asset: 'ETH',
      amount: '10.0',
      value: 16580000,
      requestDate: '2024-03-15T11:15:00Z',
      urgency: 'normal',
      destination: '0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a'
    },
    {
      id: 'WD-2024-003',
      user: '박민수',
      asset: 'USDC',
      amount: '5000',
      value: 5000000,
      requestDate: '2024-03-15T09:45:00Z',
      urgency: 'normal',
      destination: '0x8ba1f109551bd432803012645hac136c'
    }
  ]

  const chartData = [
    { name: t('overview.months.jan'), value: 200000000 },
    { name: t('overview.months.feb'), value: 220000000 },
    { name: t('overview.months.mar'), value: 180000000 },
    { name: t('overview.months.apr'), value: 250000000 },
    { name: t('overview.months.may'), value: 275000000 },
    { name: t('overview.months.jun'), value: 275000000 }
  ]

  const pieData = mockAssets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.value,
    color: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'][index]
  }))

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0)

  const selectedAsset = mockAssets[selectedAssetIndex]
  const selectedPercentage = ((selectedAsset.value / totalValue) * 100).toFixed(1)

  const handlePieClick = (data: any, index: number) => {
    setSelectedAssetIndex(index)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: 'KRW'
    }).format(value)
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
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'normal':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const highUrgencyApprovals = mockWithdrawalApprovals.filter(approval => approval.urgency === 'high')
  const totalPendingValue = mockWithdrawalApprovals.reduce((sum, approval) => sum + approval.value, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('overview.title')}</h1>
          <p className="text-gray-600 mt-1">최고 수준의 보안으로 지키는 디지털 자산</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-2xl font-bold text-green-600 mt-1">+2.45%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.mpc_status')}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{t('overview.status_normal')}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <div className="h-6 w-6 bg-green-600 rounded-full animate-pulse"></div>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">신청 ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">신청자</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">자산</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">신청시간</th>
                </tr>
              </thead>
              <tbody>
                {mockWithdrawalApprovals.slice(0, 3).map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">#{approval.id}</span>
                        {approval.urgency === 'high' && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                            긴급
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{approval.user}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{approval.asset}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{approval.amount} {approval.asset}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(approval.value)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatTimeAgo(approval.requestDate)}</td>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('overview.price_trend')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('overview.asset_distribution')}</h3>
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
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedPercentage}%
                    </div>
                    <div className="text-sm font-semibold text-gray-600 mt-1">
                      {selectedAsset.symbol}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedAsset.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend - Right */}
            <div className="flex-1">
              <div className="space-y-3">
                {pieData.map((entry, index) => (
                  <button
                    key={entry.name}
                    onClick={() => setSelectedAssetIndex(index)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      selectedAssetIndex === index 
                        ? 'bg-gray-100 shadow-sm border border-gray-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {entry.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mockAssets[index].name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {((entry.value / totalValue) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {showBalances ? formatCurrency(entry.value) : '***,***,***'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="font-semibold text-gray-700">{asset.symbol}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{asset.symbol}</p>
                        <p className="text-sm text-gray-500">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? asset.balance : '***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? formatCurrency(asset.value) : '***,***,***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-semibold ${
                      asset.change >= 0 ? 'text-green-600' : 'text-red-600'
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