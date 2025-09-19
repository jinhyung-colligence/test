'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { getUserByEmail } from '@/data/userMockData'
import { verifyOTP, verifySMSCode, sendSMSCode } from '@/utils/authenticationHelpers'

interface AuthStep {
  step: 'email' | 'otp' | 'sms' | 'completed'
  email?: string
  user?: User
  attempts: number
  maxAttempts: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  authStep: AuthStep
  login: (email: string) => Promise<{ success: boolean; message?: string }>
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string }>
  verifySms: (code: string) => Promise<{ success: boolean; message?: string }>
  sendSms: () => Promise<{ success: boolean; message?: string }>
  logout: () => void
  resetAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>({
    step: 'email',
    attempts: 0,
    maxAttempts: 5
  })

  // 세션 체크 (localStorage에서 로그인 상태 복원)
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth_session')
    if (savedAuth) {
      try {
        const { user: savedUser, timestamp } = JSON.parse(savedAuth)
        const now = Date.now()
        const thirtyMinutes = 30 * 60 * 1000

        // 30분 내의 세션만 유효
        if (now - timestamp < thirtyMinutes) {
          setUser(savedUser)
          setIsAuthenticated(true)
          setAuthStep({ step: 'completed', user: savedUser, attempts: 0, maxAttempts: 5 })
        } else {
          localStorage.removeItem('auth_session')
        }
      } catch (error) {
        localStorage.removeItem('auth_session')
      }
    }
  }, [])

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (authStep.attempts >= authStep.maxAttempts) {
      return { success: false, message: '로그인 시도 횟수를 초과했습니다.' }
    }

    const foundUser = getUserByEmail(email)
    if (!foundUser) {
      setAuthStep(prev => ({ ...prev, attempts: prev.attempts + 1 }))
      return { success: false, message: '등록되지 않은 이메일입니다.' }
    }

    if (foundUser.status !== 'active') {
      return { success: false, message: '비활성화된 계정입니다.' }
    }

    setAuthStep({
      step: 'otp',
      email,
      user: foundUser,
      attempts: 0,
      maxAttempts: 5
    })

    return { success: true, message: 'OTP 코드를 입력해주세요.' }
  }

  const verifyOtp = async (otp: string): Promise<{ success: boolean; message?: string }> => {
    if (!authStep.user || authStep.step !== 'otp') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      return { success: false, message: 'OTP 시도 횟수를 초과했습니다.' }
    }

    try {
      const isValid = await verifyOTP(otp, 'login-session')

      if (isValid) {
        setAuthStep(prev => ({
          ...prev,
          step: 'sms',
          attempts: 0
        }))
        return { success: true, message: 'SMS 인증 코드를 발송했습니다.' }
      } else {
        setAuthStep(prev => ({ ...prev, attempts: prev.attempts + 1 }))
        return { success: false, message: '올바르지 않은 OTP 코드입니다.' }
      }
    } catch (error) {
      return { success: false, message: 'OTP 인증 중 오류가 발생했습니다.' }
    }
  }

  const sendSms = async (): Promise<{ success: boolean; message?: string }> => {
    if (!authStep.user?.phone) {
      return { success: false, message: '전화번호가 등록되지 않았습니다.' }
    }

    try {
      const result = await sendSMSCode(authStep.user.phone, 'login-session')
      if (result.success) {
        return { success: true, message: `${authStep.user.phone}로 인증 코드를 발송했습니다.` }
      } else {
        return { success: false, message: 'SMS 발송에 실패했습니다.' }
      }
    } catch (error) {
      return { success: false, message: 'SMS 발송 중 오류가 발생했습니다.' }
    }
  }

  const verifySms = async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (!authStep.user || authStep.step !== 'sms') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      return { success: false, message: 'SMS 시도 횟수를 초과했습니다.' }
    }

    try {
      const isValid = await verifySMSCode(code, 'login-session')

      if (isValid) {
        // 로그인 성공
        setUser(authStep.user)
        setIsAuthenticated(true)
        setAuthStep({
          step: 'completed',
          user: authStep.user,
          attempts: 0,
          maxAttempts: 5
        })

        // 세션 저장 (30분 유효)
        const sessionData = {
          user: authStep.user,
          timestamp: Date.now()
        }

        localStorage.setItem('auth_session', JSON.stringify(sessionData))

        // 쿠키에도 저장 (middleware에서 사용)
        document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=1800; SameSite=Lax`

        // 로그인 성공 후 overview로 이동
        router.push('/overview')

        return { success: true, message: '로그인에 성공했습니다.' }
      } else {
        setAuthStep(prev => ({ ...prev, attempts: prev.attempts + 1 }))
        return { success: false, message: '올바르지 않은 인증 코드입니다.' }
      }
    } catch (error) {
      return { success: false, message: 'SMS 인증 중 오류가 발생했습니다.' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setAuthStep({
      step: 'email',
      attempts: 0,
      maxAttempts: 5
    })
    localStorage.removeItem('auth_session')

    // 쿠키도 삭제
    document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    router.push('/login')
  }

  const resetAuth = () => {
    setAuthStep({
      step: 'email',
      attempts: 0,
      maxAttempts: 5
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authStep,
        login,
        verifyOtp,
        verifySms,
        sendSms,
        logout,
        resetAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.')
  }
  return context
}