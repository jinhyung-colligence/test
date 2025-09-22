'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { getUserByEmail } from '@/data/userMockData'
import { verifyOTP, verifySMSCode, sendSMSCode } from '@/utils/authenticationHelpers'

interface AuthStep {
  step: 'email' | 'otp' | 'sms' | 'completed' | 'blocked'
  email?: string
  user?: User
  attempts: number
  maxAttempts: number
  blockedUntil?: number
  blockReason?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  authStep: AuthStep
  login: (email: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifySms: (code: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  sendSms: () => Promise<{ success: boolean; message?: string }>
  logout: () => void
  resetAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 쿨다운 기간 계산 (점진적 증가: 30초, 1분, 5분, 15분, 1시간)
const getCooldownDuration = (attemptCount: number): number => {
  const durations = [30, 60, 300, 900, 3600] // 초 단위
  const index = Math.min(attemptCount - 5, durations.length - 1)
  return durations[index] * 1000 // 밀리초로 변환
}

// localStorage에서 시도 기록 가져오기
const getStoredAttempts = (email: string) => {
  try {
    const stored = localStorage.getItem(`login_attempts_${email}`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    // localStorage 에러 시 무시
  }
  return { count: 0, lastAttempt: 0, blockedUntil: 0 }
}

// localStorage에 시도 기록 저장
const setStoredAttempts = (email: string, count: number, blockedUntil: number = 0) => {
  try {
    const data = {
      count,
      lastAttempt: Date.now(),
      blockedUntil
    }
    localStorage.setItem(`login_attempts_${email}`, JSON.stringify(data))
  } catch (error) {
    // localStorage 에러 시 무시
  }
}

// 차단 상태 확인
const checkBlockStatus = (email: string) => {
  const stored = getStoredAttempts(email)
  const now = Date.now()

  if (stored.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingTime: stored.blockedUntil - now,
      totalAttempts: stored.count
    }
  }

  return { isBlocked: false, remainingTime: 0, totalAttempts: stored.count }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // UI/UX 기획을 위해 더미 사용자 데이터 설정
  const dummyUser: User = {
    id: 'dummy-user-1',
    name: '관리자',
    email: 'admin@company.com',
    department: 'IT 보안팀',
    phone: '010-1234-5678',
    role: 'admin',
    status: 'active',
    permissions: ['permission.all'],
    lastLogin: new Date().toISOString()
  }

  const [user, setUser] = useState<User | null>(dummyUser)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // 항상 인증된 상태
  const [authStep, setAuthStep] = useState<AuthStep>({
    step: 'email', // UI/UX 확인을 위해 이메일 단계부터 시작
    attempts: 0,
    maxAttempts: 5
  })

  // UI/UX 기획을 위해 세션 체크 비활성화
  useEffect(() => {
    // 세션 체크 로직 제거 - 항상 인증된 상태 유지
  }, [])

  const login = async (email: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    // 차단 상태 확인
    const blockStatus = checkBlockStatus(email)

    if (blockStatus.isBlocked) {
      const blockedUntil = Date.now() + blockStatus.remainingTime
      const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    // 기존 시도 횟수 확인
    if (authStep.attempts >= authStep.maxAttempts) {
      const totalAttempts = blockStatus.totalAttempts + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    const foundUser = getUserByEmail(email)
    if (!foundUser) {
      const newAttempts = authStep.attempts + 1
      const newTotalAttempts = blockStatus.totalAttempts + 1

      setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

      // 실패 시 localStorage에도 기록
      setStoredAttempts(email, newTotalAttempts)

      // 5회 실패 시 즉시 차단 처리
      if (newAttempts >= authStep.maxAttempts) {
        const cooldownDuration = getCooldownDuration(newTotalAttempts)
        const blockedUntil = Date.now() + cooldownDuration

        // localStorage에 차단 정보 저장
        setStoredAttempts(email, newTotalAttempts, blockedUntil)

        const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

        return {
          success: false,
          message: '차단 페이지로 이동합니다.',
          isBlocked: true,
          blockedUntil,
          blockReason: reason
        }
      }

      return { success: false, message: '등록되지 않은 이메일입니다.' }
    }

    if (foundUser.status !== 'active') {
      return { success: false, message: '비활성화된 계정입니다.' }
    }

    // 성공 시 저장된 실패 기록 초기화
    setStoredAttempts(email, 0)

    setAuthStep({
      step: 'otp',
      email,
      user: foundUser,
      attempts: 0,
      maxAttempts: 5
    })

    return { success: true, message: 'OTP 코드를 입력해주세요.' }
  }

  const verifyOtp = async (otp: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    if (!authStep.user || authStep.step !== 'otp') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      const email = authStep.email || authStep.user.email
      const totalAttempts = getStoredAttempts(email).count + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = 'OTP 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
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
        const newAttempts = authStep.attempts + 1
        setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

        // 5회 실패 시 즉시 차단 처리
        if (newAttempts >= authStep.maxAttempts) {
          const email = authStep.email || authStep.user.email
          const totalAttempts = getStoredAttempts(email).count + 1
          const cooldownDuration = getCooldownDuration(totalAttempts)
          const blockedUntil = Date.now() + cooldownDuration

          // localStorage에 차단 정보 저장
          setStoredAttempts(email, totalAttempts, blockedUntil)

          const reason = 'OTP 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

          return {
            success: false,
            message: '차단 페이지로 이동합니다.',
            isBlocked: true,
            blockedUntil,
            blockReason: reason
          }
        }

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

  const verifySms = async (code: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    if (!authStep.user || authStep.step !== 'sms') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      const email = authStep.email || authStep.user.email
      const totalAttempts = getStoredAttempts(email).count + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = 'SMS 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
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
        const newAttempts = authStep.attempts + 1
        setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

        // 5회 실패 시 즉시 차단 처리
        if (newAttempts >= authStep.maxAttempts) {
          const email = authStep.email || authStep.user.email
          const totalAttempts = getStoredAttempts(email).count + 1
          const cooldownDuration = getCooldownDuration(totalAttempts)
          const blockedUntil = Date.now() + cooldownDuration

          // localStorage에 차단 정보 저장
          setStoredAttempts(email, totalAttempts, blockedUntil)

          const reason = 'SMS 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

          return {
            success: false,
            message: '차단 페이지로 이동합니다.',
            isBlocked: true,
            blockedUntil,
            blockReason: reason
          }
        }

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