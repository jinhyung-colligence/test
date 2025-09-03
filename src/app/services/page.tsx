'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AdditionalServices from '@/components/AdditionalServices'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function ServicesPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="services" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        
        <div className="flex-1 p-8">
          <AdditionalServices plan={selectedPlan} />
        </div>
      </div>
    </div>
  )
}