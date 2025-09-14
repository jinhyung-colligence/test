'use client'

import PageLayout from '@/components/PageLayout'
import WithdrawalManagement from '@/components/WithdrawalManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function WithdrawalPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="withdrawal">
      <WithdrawalManagement plan={selectedPlan} />
    </PageLayout>
  )
}