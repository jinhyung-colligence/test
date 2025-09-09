'use client'

import { useState } from 'react'
import { ServicePlan } from '@/app/page'
import Sidebar from './Sidebar'
import AssetOverview from './AssetOverview'
import TransactionHistory from './TransactionHistory'
import UserManagement from './UserManagement'
import AdditionalServices from './AdditionalServices'
import SecuritySettings from './SecuritySettings'
import GroupWalletManagement from './GroupWalletManagement'
import DepositManagement from './DepositManagement'
import WithdrawalManagement from './WithdrawalManagement'

interface DashboardProps {
  plan: ServicePlan
  onPlanChange: (plan: ServicePlan) => void
}

export type DashboardTab = 'overview' | 'transactions' | 'users' | 'groups' | 'deposit' | 'withdrawal' | 'services' | 'security'

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
      case 'groups':
        return <GroupWalletManagement plan={plan} />
      case 'deposit':
        return <DepositManagement plan={plan} />
      case 'withdrawal':
        return <WithdrawalManagement plan={plan} />
      case 'services':
        return <AdditionalServices plan={plan} />
      case 'security':
        return <SecuritySettings plan={plan} />
      default:
        return <AssetOverview plan={plan} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        plan={plan} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onPlanChange={onPlanChange}
      />
      
      <div className="ml-64 pt-24">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}