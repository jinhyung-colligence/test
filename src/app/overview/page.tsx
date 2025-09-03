'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AssetOverview from '@/components/AssetOverview'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function OverviewPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="overview" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        
        <div className="flex-1 p-8">
          <AssetOverview plan={selectedPlan} />
        </div>
      </div>
    </div>
  )
}