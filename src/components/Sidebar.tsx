'use client'

import {
  HomeIcon,
  ClockIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserIcon,
  GiftIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ServicePlan } from '@/app/page'
import { DashboardTab } from './Dashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSidebar } from '@/contexts/SidebarContext'

interface SidebarProps {
  plan: ServicePlan
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onPlanChange: (plan: ServicePlan) => void
}

export default function Sidebar({ plan, activeTab, onTabChange, onPlanChange }: SidebarProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)
  
  // Get active tab from current pathname
  const getCurrentTab = (): DashboardTab => {
    switch (pathname) {
      case '/overview':
        return 'overview'
      case '/transactions':
        return 'transactions'
      case '/users':
        return 'users'
      case '/groups':
        return 'groups'
      case '/deposit':
        return 'deposit'
      case '/withdrawal':
        return 'withdrawal'
      case '/services':
        return 'services'
      case '/security':
        return 'security'
      case '/':
        return 'overview'
      default:
        return 'overview'
    }
  }
  
  const currentTab = getCurrentTab()
  
  const getPlanInfo = () => {
    switch (plan) {
      case 'enterprise':
        return {
          name: t('plan.enterprise.name'),
          icon: BuildingOfficeIcon,
          color: 'text-primary-600 bg-primary-50'
        }
      case 'premium':
        return {
          name: t('plan.premium.name'),
          icon: UserIcon,
          color: 'text-purple-600 bg-purple-50'
        }
      case 'free':
        return {
          name: t('plan.free.name'),
          icon: GiftIcon,
          color: 'text-green-600 bg-green-50'
        }
      default:
        return {
          name: t('plan.default.name'),
          icon: ShieldCheckIcon,
          color: 'text-gray-600 bg-gray-50'
        }
    }
  }

  const planInfo = getPlanInfo()
  const PlanIcon = planInfo.icon

  const allPlans = [
    {
      id: 'enterprise' as const,
      name: t('plan.enterprise.name'),
      icon: BuildingOfficeIcon,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      id: 'premium' as const,
      name: t('plan.premium.name'),
      icon: UserIcon,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'free' as const,
      name: t('plan.free.name'),
      icon: GiftIcon,
      color: 'text-green-600 bg-green-50'
    }
  ]

  const handlePlanSelect = (planId: ServicePlan) => {
    onPlanChange(planId)
    setShowPlanDropdown(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.plan-dropdown-container')) {
        setShowPlanDropdown(false)
      }
    }

    if (showPlanDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPlanDropdown])

  const menuItems = [
    {
      id: 'overview' as DashboardTab,
      name: t('menu.overview'),
      icon: HomeIcon,
      path: '/overview',
      available: true
    },
    {
      id: 'transactions' as DashboardTab,
      name: t('menu.transactions'),
      icon: ClockIcon,
      path: '/transactions',
      available: true
    },
    {
      id: 'users' as DashboardTab,
      name: t('menu.users'),
      icon: UsersIcon,
      path: '/users',
      available: plan === 'enterprise' || plan === 'premium'
    },
    {
      id: 'groups' as DashboardTab,
      name: '그룹 관리',
      icon: UserGroupIcon,
      path: '/groups',
      available: plan === 'enterprise'
    },
    {
      id: 'deposit' as DashboardTab,
      name: '입금 관리',
      icon: ArrowDownOnSquareIcon,
      path: '/deposit',
      available: plan === 'enterprise'
    },
    {
      id: 'withdrawal' as DashboardTab,
      name: '출금 관리',
      icon: ArrowUpOnSquareIcon,
      path: '/withdrawal',
      available: plan === 'enterprise'
    },
    {
      id: 'services' as DashboardTab,
      name: t('menu.services'),
      icon: CogIcon,
      path: '/services',
      available: true
    },
    {
      id: 'security' as DashboardTab,
      name: t('menu.security'),
      icon: ShieldCheckIcon,
      path: '/security',
      available: true
    }
  ]

  return (
    <div className={`fixed left-0 top-16 bottom-0 bg-white shadow-sm border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6 z-50">
        <button
          onClick={toggleSidebar}
          className="bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className={`p-6 relative plan-dropdown-container ${isCollapsed ? 'px-3' : ''}`}>
        <button
          onClick={() => !isCollapsed && setShowPlanDropdown(!showPlanDropdown)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 rounded-lg transition-colors hover:opacity-90 ${planInfo.color}`}
        >
          <div className="flex items-center">
            <PlanIcon className={`h-8 w-8 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <div>
                <p className="font-semibold text-sm">{planInfo.name}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showPlanDropdown ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Plan Dropdown */}
        {showPlanDropdown && !isCollapsed && (
          <div className="absolute top-full left-6 right-6 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {allPlans.map((planOption) => {
              const OptionIcon = planOption.icon
              return (
                <button
                  key={planOption.id}
                  onClick={() => handlePlanSelect(planOption.id)}
                  className={`w-full flex items-center p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    plan === planOption.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <OptionIcon className="h-6 w-6 mr-3 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900">{planOption.name}</p>
                    {plan === planOption.id && (
                      <p className="text-xs text-primary-600">{t('plan.active')}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <nav className={`flex-1 flex flex-col ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (!item.available) return null

            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </button>
              </li>
            )
          })}
        </ul>

        {!isCollapsed && (
          <div className="mt-auto pt-4 px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
            <p>{t('footer.mpc_security')}</p>
            <p className="text-green-600 font-medium">{t('footer.connected')}</p>
          </div>
        )}
      </nav>
    </div>
  )
}