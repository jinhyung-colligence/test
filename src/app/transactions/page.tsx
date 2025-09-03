'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import TransactionHistory from '@/components/TransactionHistory'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function TransactionsPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="transactions" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        
        <div className="flex-1 p-8">
          <TransactionHistory plan={selectedPlan} />
        </div>
      </div>
    </div>
  )
}