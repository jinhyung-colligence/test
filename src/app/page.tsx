'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import Header from '@/components/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export type ServicePlan = 'enterprise' | 'premium' | 'free' | null

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>('enterprise')

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main>
          <Dashboard plan={selectedPlan} onPlanChange={setSelectedPlan} />
        </main>
      </div>
    </LanguageProvider>
  )
}