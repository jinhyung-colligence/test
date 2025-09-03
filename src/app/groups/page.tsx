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
      
      <div className="flex pt-20">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="groups" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        
        <div className="flex-1 p-8">
          <GroupWalletManagement plan={selectedPlan} />
        </div>
      </div>
    </div>
  )
}