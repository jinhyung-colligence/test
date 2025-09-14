import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ServicePlanProvider } from '@/contexts/ServicePlanContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

export const metadata: Metadata = {
  title: 'Custody Dashboard - 커스터디 서비스',
  description: '기업용/개인용 디지털 자산 커스터디 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          <ServicePlanProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ServicePlanProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}