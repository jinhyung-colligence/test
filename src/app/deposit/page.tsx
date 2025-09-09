'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import DepositManagement from '@/components/DepositManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function DepositPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64 pt-28 p-8">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="deposit" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        <DepositManagement plan={selectedPlan} />
      </div>
    </div>
  )
}