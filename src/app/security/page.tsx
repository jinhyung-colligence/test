'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function SecurityPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="security" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        
        <div className="flex-1 p-8">
          <SecuritySettings plan={selectedPlan} />
        </div>
      </div>
    </div>
  )
}