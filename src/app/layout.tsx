import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ServicePlanProvider } from '@/contexts/ServicePlanContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorGuard from '@/components/ErrorGuard'
import MetaMaskErrorHandler from '@/components/MetaMaskErrorHandler'
import Script from 'next/script'

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
        <Script id="error-suppression" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              const originalError = console.error;
              console.error = (...args) => {
                const message = args.join(' ');
                if (!message.includes('Minified React error') &&
                    !message.includes('inpage.js') &&
                    !message.includes('runtime.lastError')) {
                  originalError.apply(console, args);
                }
              };

              window.addEventListener('error', (e) => {
                if (e.filename?.includes('inpage.js') ||
                    e.message?.includes('Minified React error')) {
                  e.preventDefault();
                }
              });
            }
          `}
        </Script>
        <ErrorBoundary>
          <ErrorGuard>
            <MetaMaskErrorHandler />
            <LanguageProvider>
              <ServicePlanProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </ServicePlanProvider>
            </LanguageProvider>
          </ErrorGuard>
        </ErrorBoundary>
      </body>
    </html>
  )
}