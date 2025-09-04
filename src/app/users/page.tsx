'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import UserManagement from '@/components/UserManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function UsersPage() {
  const { selectedPlan, setSelectedPlan } = useServicePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64 pt-20 p-8">
        <Sidebar 
          plan={selectedPlan} 
          activeTab="users" 
          onTabChange={() => {}}
          onPlanChange={setSelectedPlan}
        />
        <UserManagement plan={selectedPlan} />
      </div>
    </div>
  )
}