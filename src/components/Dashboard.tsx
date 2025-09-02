'use client'

import { useState } from 'react'
import { ServicePlan } from '@/app/page'
import Sidebar from './Sidebar'
import AssetOverview from './AssetOverview'
import TransactionHistory from './TransactionHistory'
import UserManagement from './UserManagement'
import AdditionalServices from './AdditionalServices'
import SecuritySettings from './SecuritySettings'

interface DashboardProps {
  plan: ServicePlan
  onPlanChange: (plan: ServicePlan) => void
}

export type DashboardTab = 'overview' | 'transactions' | 'users' | 'services' | 'security'

export default function Dashboard({ plan, onPlanChange }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AssetOverview plan={plan} />
      case 'transactions':
        return <TransactionHistory plan={plan} />
      case 'users':
        return <UserManagement plan={plan} />
      case 'services':
        return <AdditionalServices plan={plan} />
      case 'security':
        return <SecuritySettings plan={plan} />
      default:
        return <AssetOverview plan={plan} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        plan={plan} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onPlanChange={onPlanChange}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}