'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PolicyAmountPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본 통화(KRW)로 리다이렉트
    router.replace('/security/policies/amount/KRW')
  }, [router])

  return null
}