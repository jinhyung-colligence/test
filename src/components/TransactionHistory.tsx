'use client'

import { useState } from 'react'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { useLanguage } from '@/contexts/LanguageContext'

interface TransactionHistoryProps {
  plan: ServicePlan
}

type TransactionType = 'deposit' | 'withdrawal' | 'swap' | 'lending' | 'staking'
type TransactionStatus = 'completed' | 'pending' | 'failed'

interface Transaction {
  id: string
  type: TransactionType
  asset: string
  amount: string
  value: number
  status: TransactionStatus
  timestamp: string
  txHash?: string
  from?: string
  to?: string
}

export default function TransactionHistory({ plan }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all')
  const { t, language } = useLanguage()

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      asset: 'BTC',
      amount: '0.5',
      value: 25000000,
      status: 'completed',
      timestamp: '2024-03-15T10:30:00Z',
      txHash: '0x1234...5678',
      from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
      id: '2',
      type: 'withdrawal',
      asset: 'ETH',
      amount: '2.5',
      value: 5000000,
      status: 'pending',
      timestamp: '2024-03-15T09:15:00Z',
      to: '0x742d35...45454'
    },
    {
      id: '3',
      type: 'swap',
      asset: 'USDC → BTC',
      amount: '10000',
      value: 10000000,
      status: 'completed',
      timestamp: '2024-03-14T16:45:00Z'
    },
    {
      id: '4',
      type: 'lending',
      asset: 'USDT',
      amount: '5000',
      value: 5000000,
      status: 'completed',
      timestamp: '2024-03-14T14:20:00Z'
    },
    {
      id: '5',
      type: 'staking',
      asset: 'ETH',
      amount: '10',
      value: 20000000,
      status: 'completed',
      timestamp: '2024-03-13T11:10:00Z'
    }
  ]

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />
      case 'withdrawal':
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />
      case 'swap':
        return <div className="h-5 w-5 bg-blue-600 rounded-full" />
      case 'lending':
        return <div className="h-5 w-5 bg-purple-600 rounded-full" />
      case 'staking':
        return <div className="h-5 w-5 bg-yellow-600 rounded-full" />
    }
  }

  const getTransactionTypeName = (type: TransactionType) => {
    return t(`transaction.type.${type}`)
  }

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
    }
  }

  const getStatusName = (status: TransactionStatus) => {
    return t(`transaction.status.${status}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: 'KRW'
    }).format(value)
  }

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || tx.type === filterType
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('transactions.title')}</h1>
          <p className="text-gray-600 mt-1">{t('transactions.subtitle')}</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          {t('transactions.download')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('transactions.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{t('transactions.filter_all_types')}</option>
              <option value="deposit">{t('transaction.type.deposit')}</option>
              <option value="withdrawal">{t('transaction.type.withdrawal')}</option>
              <option value="swap">{t('transaction.type.swap')}</option>
              <option value="lending">{t('transaction.type.lending')}</option>
              <option value="staking">{t('transaction.type.staking')}</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{t('transactions.filter_all_status')}</option>
              <option value="completed">{t('transaction.status.completed')}</option>
              <option value="pending">{t('transaction.status.pending')}</option>
              <option value="failed">{t('transaction.status.failed')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.asset')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.table.details')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {getTransactionTypeName(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                    {tx.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatCurrency(tx.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                      {getStatusName(tx.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.txHash && (
                      <p className="text-gray-500 truncate max-w-32">
                        TX: {tx.txHash}
                      </p>
                    )}
                    {tx.from && (
                      <p className="text-gray-500 truncate max-w-32">
                        From: {tx.from}
                      </p>
                    )}
                    {tx.to && (
                      <p className="text-gray-500 truncate max-w-32">
                        To: {tx.to}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('transactions.no_results')}</p>
          </div>
        )}
      </div>
    </div>
  )
}