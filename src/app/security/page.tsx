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
      
      <div className="ml-64 pt-28 p-8">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="security" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        <SecuritySettings plan={selectedPlan} />
      </div>
    </div>
  )
}