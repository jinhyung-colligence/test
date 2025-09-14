'use client'

import PageLayout from '@/components/PageLayout'
import GroupWalletManagement from '@/components/GroupWalletManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function GroupsPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="groups">
      <GroupWalletManagement plan={selectedPlan} />
    </PageLayout>
  )
}