import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}