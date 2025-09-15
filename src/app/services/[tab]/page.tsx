'use client'

import { notFound } from 'next/navigation'
import { useEffect } from 'react'
import PageLayout from '@/components/PageLayout'
import AdditionalServices from '@/components/AdditionalServices'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface ServicesTabPageProps {
  params: {
    tab: string
  }
}

// 유효한 탭 목록
const VALID_TABS = ['staking', 'lending', 'swap', 'krw'] as const
type ValidTab = typeof VALID_TABS[number]

function isValidTab(tab: string): tab is ValidTab {
  return VALID_TABS.includes(tab as ValidTab)
}


export default function ServicesTabPage({ params }: ServicesTabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { tab } = params

  // 페이지 로드 확인용 - 브라우저 제목 변경
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = `Services ${tab} - Loaded Successfully!`
      // 강제로 body에 디버그 정보 표시
      const debugDiv = document.createElement('div')
      debugDiv.style.cssText = 'position: fixed; top: 0; left: 0; background: red; color: white; padding: 10px; z-index: 9999; font-size: 12px;'
      debugDiv.textContent = `ServicesTabPage: ${tab} | Plan: ${selectedPlan} | Valid: ${isValidTab(tab)}`
      document.body.appendChild(debugDiv)

      // 3초 후 제거
      setTimeout(() => {
        document.body.removeChild(debugDiv)
      }, 3000)
    }
  }, [tab, selectedPlan])

  // 유효하지 않은 탭인 경우 404 처리
  if (!isValidTab(tab)) {
    console.log('Invalid tab detected, calling notFound()')
    notFound()
  }

  return (
    <PageLayout activeTab="services">
      <AdditionalServices plan={selectedPlan} initialTab={tab} />
    </PageLayout>
  )
}