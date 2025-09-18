'use client'

import { useState, useEffect } from 'react'
import { UserCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'

export default function Header() {
  const { t } = useLanguage()
  const [sessionTime, setSessionTime] = useState(1800) // 30분 = 1800초
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer)
          // 세션 만료 처리
          alert('세션이 만료되었습니다. 다시 로그인해주세요.')
          return 0
        }
        
        // 5분 남았을 때 경고
        if (prevTime === 300) {
          setShowExtensionModal(true)
        }
        
        return prevTime - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const extendSession = () => {
    setSessionTime(1800) // 30분 연장
    setShowExtensionModal(false)
  }
  
  const getTimeColor = () => {
    if (sessionTime <= 300) return 'text-red-600' // 5분 이하
    if (sessionTime <= 600) return 'text-yellow-600' // 10분 이하
    return 'text-gray-600'
  }
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="flex items-center space-x-4">
              {/* 세션 타이머 */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`h-5 w-5 ${getTimeColor()}`} />
                  <div>
                    <p className={`text-sm ${getTimeColor()}`}>
                      {formatTime(sessionTime)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={extendSession}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors"
                >
                  시간 연장
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">관리자</p>
                <p className="text-xs text-gray-600">{t('header.admin')}</p>
              </div>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="w-px h-6 bg-gray-300"></div>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>
      
      {/* 세션 만료 경고 모달 */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  세션 만료 경고
                </h3>
                <p className="text-sm text-gray-600">
                  5분 후 자동으로 로그아웃됩니다
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                세션이 곧 만료됩니다. 작업을 계속하시려면 시간을 연장해주세요.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                나중에
              </button>
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                30분 연장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}