'use client'

import PageLayout from '@/components/PageLayout'
import CompanySettings from '@/components/admin/CompanySettings'

export default function SettingPage() {
  return (
    <PageLayout activeTab="setting">
      <CompanySettings />
    </PageLayout>
  )
}