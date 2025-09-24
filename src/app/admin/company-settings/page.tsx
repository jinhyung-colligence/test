'use client'

import PageLayout from '@/components/PageLayout'
import CompanySettings from '@/components/admin/CompanySettings'

export default function CompanySettingsPage() {
  return (
    <PageLayout activeTab="company-settings">
      <CompanySettings />
    </PageLayout>
  )
}