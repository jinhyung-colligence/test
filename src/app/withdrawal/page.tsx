'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import WithdrawalManagement from '@/components/WithdrawalManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function WithdrawalPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64 pt-20 p-8">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="withdrawal" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        <WithdrawalManagement plan={selectedPlan} />
      </div>
    </div>
  )
}