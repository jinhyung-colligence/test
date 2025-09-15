'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import WithdrawalManagement from '@/components/WithdrawalManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface WithdrawalTabPageProps {
  params: {
    tab: string
  }
}

// 유효한 탭 목록
const VALID_TABS = ['approval', 'airgap', 'rejected', 'audit'] as const
type ValidTab = typeof VALID_TABS[number]

function isValidTab(tab: string): tab is ValidTab {
  return VALID_TABS.includes(tab as ValidTab)
}


export default function WithdrawalTabPage({ params }: WithdrawalTabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { tab } = params

  // 디버깅을 위한 로그 (프로덕션에서 확인용)
  console.log('WithdrawalTabPage - tab:', tab, 'selectedPlan:', selectedPlan, 'isValidTab:', isValidTab(tab))

  // 유효하지 않은 탭인 경우 404 처리
  if (!isValidTab(tab)) {
    console.log('Invalid withdrawal tab detected, calling notFound()')
    notFound()
  }

  return (
    <PageLayout activeTab="withdrawal">
      <WithdrawalManagement plan={selectedPlan} initialTab={tab} />
    </PageLayout>
  )
}