'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useServicePlan } from '@/contexts/ServicePlanContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { DashboardTab } from './Dashboard'

interface PageLayoutProps {
  children: ReactNode
  activeTab: DashboardTab
}

export default function PageLayout({ children, activeTab }: PageLayoutProps) {
  const { selectedPlan, setSelectedPlan } = useServicePlan()
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar
        plan={selectedPlan}
        activeTab={activeTab}
        onTabChange={() => {}}
        onPlanChange={setSelectedPlan}
      />

      <div className={`pt-28 p-8 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  )
}