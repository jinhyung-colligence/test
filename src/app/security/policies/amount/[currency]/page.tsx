'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'
import { Currency } from '@/types/withdrawal'

interface PolicyAmountCurrencyPageProps {
  params: {
    currency: string
  }
}

// 유효한 통화 목록
const VALID_CURRENCIES = ['USD', 'BTC', 'ETH', 'USDC', 'USDT', 'KRW'] as const
type ValidCurrency = typeof VALID_CURRENCIES[number]

function isValidCurrency(currency: string): currency is ValidCurrency {
  return VALID_CURRENCIES.includes(currency.toUpperCase() as ValidCurrency)
}

export default function PolicyAmountCurrencyPage({ params }: PolicyAmountCurrencyPageProps) {
  const { selectedPlan } = useServicePlan()
  const { currency } = params

  // 유효하지 않은 통화인 경우 404 처리
  if (!isValidCurrency(currency)) {
    notFound()
  }

  return (
    <PageLayout activeTab="security">
      <SecuritySettings
        plan={selectedPlan}
        initialTab="policies"
        policySubtab="amount"
        policyCurrency={currency.toUpperCase() as Currency}
      />
    </PageLayout>
  )
}