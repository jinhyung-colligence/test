'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type ServicePlan = 'enterprise' | 'premium' | 'free' | null

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/overview')
  }, [router])

  return <div>Loading...</div>
}