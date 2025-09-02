'use client'

import { useState } from 'react'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'

interface SecuritySettingsProps {
  plan: ServicePlan
}

export default function SecuritySettings({ plan }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(plan === 'enterprise')
  const [sessionTimeout, setSessionTimeout] = useState('30')

  const securityStatus = [
    {
      name: 'MPC 키 관리',
      status: 'active',
      description: plan === 'enterprise' || plan === 'premium' ? 'Blockdaemon MPC 활성' : '자체 MPC 활성',
      icon: KeyIcon,
      color: 'green'
    },
    {
      name: '2단계 인증 (2FA)',
      status: twoFactorEnabled ? 'active' : 'inactive',
      description: twoFactorEnabled ? 'Google Authenticator 연결됨' : '비활성화',
      icon: DevicePhoneMobileIcon,
      color: twoFactorEnabled ? 'green' : 'red'
    },
    {
      name: 'IP 화이트리스트',
      status: ipWhitelistEnabled ? 'active' : 'inactive',
      description: ipWhitelistEnabled ? '허용된 IP에서만 접근 가능' : '모든 IP에서 접근 가능',
      icon: GlobeAltIcon,
      color: ipWhitelistEnabled ? 'green' : 'yellow'
    },
    {
      name: '세션 관리',
      status: 'active',
      description: `${sessionTimeout}분 후 자동 로그아웃`,
      icon: ClockIcon,
      color: 'green'
    }
  ]

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50'
    }
    return colors[color as keyof typeof colors] || colors.green
  }

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    ) : (
      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">보안 설정</h1>
        <p className="text-gray-600 mt-1">계정 보안 및 접근 제어 설정을 관리하세요</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
          보안 상태 개요
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityStatus.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className={`p-3 rounded-full mr-4 ${getStatusColor(item.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <div className="ml-2">
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2단계 인증 설정</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">2FA 활성화</p>
                <p className="text-sm text-gray-600">Google Authenticator 사용</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {twoFactorEnabled && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">2FA가 성공적으로 설정되었습니다.</p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button className="text-primary-600 text-sm hover:text-primary-700">
                백업 코드 다운로드
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">세션 관리</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자동 로그아웃 시간 (분)
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="15">15분</option>
                <option value="30">30분</option>
                <option value="60">1시간</option>
                <option value="120">2시간</option>
              </select>
            </div>

            <div className="pt-2">
              <button className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                모든 세션 종료
              </button>
            </div>
          </div>
        </div>
      </div>

      {(plan === 'enterprise' || plan === 'premium') && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">고급 보안 설정</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">IP 접근 제어</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">IP 화이트리스트</p>
                  <p className="text-sm text-gray-600">허용된 IP에서만 접근</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ipWhitelistEnabled}
                    onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {ipWhitelistEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    허용 IP 주소
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">192.168.1.100</span>
                      <button className="text-red-600 text-sm">제거</button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">10.0.0.50</span>
                      <button className="text-red-600 text-sm">제거</button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="새 IP 주소 입력"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                      추가
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">트랜잭션 정책</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">신규 주소로의 출금 시 추가 승인</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">고액 거래 시 다중 승인</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm">예약 전송 기능 비활성화</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">Chainalysis 스크리닝 활성화</span>
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  고액 거래 기준액 (KRW)
                </label>
                <input 
                  type="number" 
                  placeholder="10,000,000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 감사 로그</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium">로그인 성공</p>
                <p className="text-xs text-gray-600">2024-03-15 10:30:45 - IP: 192.168.1.100</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CogIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium">보안 설정 변경</p>
                <p className="text-xs text-gray-600">2024-03-15 09:15:22 - 2FA 활성화</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium">의심스러운 로그인 시도</p>
                <p className="text-xs text-gray-600">2024-03-14 23:45:12 - IP: 203.0.113.1 (차단됨)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="text-primary-600 text-sm hover:text-primary-700">
            전체 감사 로그 다운로드
          </button>
        </div>
      </div>
    </div>
  )
}