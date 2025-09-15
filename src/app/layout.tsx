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
            if (typeof window !== 'undefined' && '${process.env.NODE_ENV}' === 'production') {
              const originalError = console.error;
              const originalWarn = console.warn;

              console.error = (...args) => {
                const message = args.join(' ');
                if (!message.includes('Minified React error') &&
                    !message.includes('inpage.js') &&
                    !message.includes('runtime.lastError') &&
                    !message.includes('chrome-extension') &&
                    !message.includes('MetaMask')) {
                  originalError.apply(console, args);
                }
              };

              console.warn = (...args) => {
                const message = args.join(' ');
                if (!message.includes('MetaMask') &&
                    !message.includes('error suppressed') &&
                    !message.includes('error handled')) {
                  originalWarn.apply(console, args);
                }
              };

              window.addEventListener('error', (e) => {
                if (e.filename?.includes('inpage.js') ||
                    e.filename?.includes('chrome-extension') ||
                    e.message?.includes('Minified React error')) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }, true);

              window.addEventListener('unhandledrejection', (e) => {
                const message = String(e.reason?.message || e.reason);
                if (message.includes('runtime.lastError') ||
                    message.includes('Receiving end does not exist')) {
                  e.preventDefault();
                }
              }, true);
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