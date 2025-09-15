'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type ServicePlan = 'enterprise' | 'premium' | 'free' | null

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 디버깅: 현재 URL 확인
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      const debugDiv = document.createElement('div')
      debugDiv.style.cssText = 'position: fixed; top: 50px; left: 0; background: blue; color: white; padding: 10px; z-index: 9999; font-size: 12px;'
      debugDiv.textContent = `Root page loaded! Current URL: ${currentUrl}`
      document.body.appendChild(debugDiv)

      // 5초 후 제거하고 overview로 이동
      setTimeout(() => {
        document.body.removeChild(debugDiv)
        router.replace('/overview')
      }, 5000)
    } else {
      router.replace('/overview')
    }
  }, [router])

  return <div style={{padding: '20px', fontSize: '16px', background: '#f0f0f0'}}>
    <h1>Root Page Loaded</h1>
    <p>If you see this, it means dynamic routes are not working properly.</p>
    <p>Redirecting to /overview in 5 seconds...</p>
  </div>
}