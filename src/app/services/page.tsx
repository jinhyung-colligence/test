'use client'

import PageLayout from '@/components/PageLayout'
import AdditionalServices from '@/components/AdditionalServices'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function ServicesPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="services">
      <AdditionalServices plan={selectedPlan} />
    </PageLayout>
  )
}