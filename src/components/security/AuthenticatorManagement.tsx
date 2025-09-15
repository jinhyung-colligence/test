'use client'

import { useState } from 'react'
import {
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  XMarkIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface AuthenticatorManagementProps {
  isVisible: boolean
  onClose: () => void
  initialEnabled: boolean
  onStatusChange: (enabled: boolean) => void
  policyEnabled: boolean
}

export default function AuthenticatorManagement({
  isVisible,
  onClose,
  initialEnabled,
  onStatusChange,
  policyEnabled
}: AuthenticatorManagementProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([
    'ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345',
    'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'
  ])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodesGeneratedAt, setBackupCodesGeneratedAt] = useState<string>('2025-01-15 14:30:00')
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false)
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false)

  // QR 코드용 시크릿 키 (실제로는 서버에서 생성)
  const secretKey = 'JBSWY3DPEHPK3PXP'
  const qrCodeUrl = `otpauth://totp/CustodyDashboard:user@example.com?secret=${secretKey}&issuer=CustodyDashboard`

  const generateBackupCodes = () => {
    const codes = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const handleEnable = () => {
    setShowSetupModal(true)
  }

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    // 실제로는 서버에서 검증
    if (verificationCode === '123456') {
      setIsEnabled(true)
      onStatusChange(true)
      setShowSetupModal(false)
      const codes = generateBackupCodes()
      setBackupCodes(codes)
      setShowBackupCodes(true)
      setVerificationCode('')
    } else {
      alert('인증번호가 올바르지 않습니다.')
    }
  }

  const handleDisable = () => {
    if (policyEnabled) {
      if (confirm('시스템 정책에 의해 Google Authenticator가 필수로 설정되어 있습니다.\n\n연동을 해제하면 다음 로그인 시 Google Authenticator 코드를 요구받지만 입력할 수 없어 로그인이 불가능합니다.\n\n정말 연동을 해제하시겠습니까?')) {
        setIsEnabled(false)
        onStatusChange(false)
        setBackupCodes([])
        alert('연동이 해제되었습니다. 다음 로그인 시 문제가 발생할 수 있으니 시스템 관리자에게 문의하세요.')
      }
    } else {
      if (confirm('Google Authenticator 연동을 해제하시겠습니까?')) {
        setIsEnabled(false)
        onStatusChange(false)
        setBackupCodes([])
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다.')
  }

  const copyAllBackupCodes = () => {
    const allCodes = backupCodes.join('\n')
    navigator.clipboard.writeText(allCodes)
    alert('모든 백업 코드가 클립보드에 복사되었습니다.')
  }

  if (!isVisible) return null

  return (
    <div className="space-y-6">
      {/* Google Authenticator 관리 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <QrCodeIcon className="h-6 w-6 mr-2 text-primary-600" />
              내 Google Authenticator 설정
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              현재 로그인한 관리자 계정의 Google Authenticator 연동을 설정합니다
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isEnabled ? (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                연동됨
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                미연동
              </span>
            )}
          </div>
        </div>

        {!isEnabled ? (
          // 설정 섹션
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Google Authenticator란?</p>
                  <p>
                    시간 기반 일회용 비밀번호(TOTP)를 생성하는 앱입니다.
                    인터넷 연결 없이도 30초마다 새로운 6자리 코드를 생성하여 높은 보안성을 제공합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleEnable}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                내 계정에 Google Authenticator 연동하기
              </button>
            </div>
          </div>
        ) : (
          // 관리 섹션
          <div className="space-y-6">
            {policyEnabled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">시스템 정책 적용 중</p>
                    <p>
                      현재 시스템 정책에 의해 Google Authenticator가 필수로 설정되어 있습니다.
                      연동을 해제할 수 있지만, 다음 로그인 시 인증 코드를 요구받게 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">연동 완료</h4>
                <p className="text-sm text-gray-700">
                  내 계정에 Google Authenticator가 연동되어 로그인 시 6자리 코드가 필요합니다.
                </p>
              </div>

              <div className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                isNewlyGenerated ? 'bg-gray-200 border-gray-400' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">백업 코드</h4>
                  {isNewlyGenerated && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-white animate-pulse">
                      새로 생성됨
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    {backupCodes.length > 0 ? `${backupCodes.length}개 백업 코드 보유` : '백업 코드 없음'}
                  </p>
                  {backupCodes.length > 0 && (
                    <p className="text-xs text-gray-500">
                      생성: {new Date(backupCodesGeneratedAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <button
                    onClick={() => setShowBackupCodes(true)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    백업 코드 보기
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={async () => {
                  setIsGeneratingCodes(true)
                  // 실제로는 서버 API 호출
                  await new Promise(resolve => setTimeout(resolve, 1000))

                  const codes = generateBackupCodes()
                  const now = new Date().toISOString()
                  setBackupCodes(codes)
                  setBackupCodesGeneratedAt(now)
                  setIsGeneratingCodes(false)
                  setIsNewlyGenerated(true)
                  setShowBackupCodes(true)

                  // 3초 후 새로 생성 표시 제거
                  setTimeout(() => setIsNewlyGenerated(false), 3000)

                  // 성공 알림
                  alert('새로운 백업 코드가 생성되었습니다.\n이전 백업 코드는 모두 무효화되었습니다.')
                }}
                disabled={isGeneratingCodes}
                className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                  isGeneratingCodes
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isGeneratingCodes ? '생성 중...' : '새 백업 코드 생성'}
              </button>
              <button
                onClick={handleDisable}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                연동 해제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 설정 모달 */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Google Authenticator 설정</h3>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
                  {/* 실제로는 QR 코드 이미지 */}
                  <QrCodeIcon className="h-32 w-32 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Google Authenticator 앱으로 위 QR 코드를 스캔하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수동 입력용 키
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={secretKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(secretKey)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호 입력
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123456"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 백업 코드 모달 */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">백업 코드</h3>
              <button
                onClick={() => setShowBackupCodes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">중요 안내</p>
                    <p className="mb-2">
                      백업 코드는 Google Authenticator를 사용할 수 없을 때 로그인할 수 있습니다.
                      안전한 곳에 저장하고 각 코드는 한 번만 사용 가능합니다.
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        생성 시점: {new Date(backupCodesGeneratedAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                      {isNewlyGenerated && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-white animate-pulse">
                          새로 생성됨
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={copyAllBackupCodes}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  전체 복사
                </button>
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}