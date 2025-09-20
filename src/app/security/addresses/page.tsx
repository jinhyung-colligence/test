'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AddressesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/security/addresses/personal')
  }, [router])

  return null
}