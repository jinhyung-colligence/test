'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import GroupWalletManagement from '@/components/GroupWalletManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function GroupsPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64 pt-20 p-8">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="groups" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        <GroupWalletManagement plan={selectedPlan} />
      </div>
    </div>
  )
}