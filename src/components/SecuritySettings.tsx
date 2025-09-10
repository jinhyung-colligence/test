"use client";

import { useState } from "react";
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";

interface SecuritySettingsProps {
  plan: ServicePlan;
}

interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp";
  addedAt: string;
  lastUsed?: string;
  txCount: number;
}

export default function SecuritySettings({ plan }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(
    plan === "enterprise"
  );
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTravelRuleWarning, setShowTravelRuleWarning] = useState(false);
  const [addressType, setAddressType] = useState<"personal" | "vasp" | "">("");
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    coin: "BTC",
    type: "" as "personal" | "vasp" | "",
  });

  const [whitelistedAddresses, setWhitelistedAddresses] = useState<
    WhitelistedAddress[]
  >([
    {
      id: "1",
      label: "비트코인 출금주소",
      address: "1KCgwGz3rE1NDSzT3GYheLp2PKDCmpTNho",
      coin: "BTC",
      type: "personal",
      addedAt: "2025-03-01",
      lastUsed: "2025-03-15",
      txCount: 5,
    },
    {
      id: "2",
      label: "이더리움 출금주소",
      address: "0xBEf0900e3de07345Ae4d7f89Bb0934B2f6e8Ed7B",
      coin: "ETH",
      type: "vasp",
      addedAt: "2025-02-15",
      lastUsed: "2025-03-10",
      txCount: 12,
    },
    {
      id: "3",
      label: "솔라나 출금주소",
      address: "5aTfy8Q4zx9j6B34VkJ6mCcMmAZgkwLNxdyaWmyUqiU",
      coin: "SOL",
      type: "personal",
      addedAt: "2025-01-20",
      lastUsed: "2025-03-10",
      txCount: 3,
    },
  ]);

  const securityStatus = [
    {
      name: "콜드 월렛",
      status: "active",
      description: "인터넷 완전 분리 - 오프라인 전용 지갑",
      icon: ShieldCheckIcon,
      color: "green",
    },
    {
      name: "MPC 키 관리",
      status: "active",
      description:
        plan === "enterprise"
          ? "분산 키 관리 - 3/5 임계값 서명"
          : "표준 MPC 보안",
      icon: KeyIcon,
      color: "green",
    },
    {
      name: "IP 화이트리스트",
      status: ipWhitelistEnabled ? "active" : "inactive",
      description: ipWhitelistEnabled
        ? "승인된 IP만 접근 허용 - 계정 탈취 방지"
        : "모든 IP에서 접근 가능",
      icon: GlobeAltIcon,
      color: ipWhitelistEnabled ? "green" : "yellow",
    },
    {
      name: "2단계 인증 (2FA)",
      status: twoFactorEnabled ? "active" : "inactive",
      description: twoFactorEnabled ? "TOTP 기반 다중 인증 활성" : "비활성화",
      icon: DevicePhoneMobileIcon,
      color: twoFactorEnabled ? "green" : "red",
    },
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      green: "text-green-600 bg-green-50",
      red: "text-red-600 bg-red-50",
      yellow: "text-yellow-600 bg-yellow-50",
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    ) : (
      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
    );
  };

  const getCoinColor = (coin: string) => {
    const colors = {
      BTC: "bg-orange-100 text-orange-800",
      ETH: "bg-blue-100 text-blue-800",
      SOL: "bg-purple-100 text-purple-800",
      USDT: "bg-green-100 text-green-800",
      USDC: "bg-indigo-100 text-indigo-800",
    };
    return colors[coin as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleShowTravelRuleWarning = () => {
    setShowTravelRuleWarning(true);
  };

  const handleAcceptTravelRule = () => {
    setShowTravelRuleWarning(false);
    setShowAddressModal(true);
  };

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address && newAddress.type) {
      const address: WhitelistedAddress = {
        id: Date.now().toString(),
        label: newAddress.label,
        address: newAddress.address,
        coin: newAddress.coin,
        type: newAddress.type,
        addedAt: new Date().toISOString().split("T")[0],
        txCount: 0,
      };
      setWhitelistedAddresses([...whitelistedAddresses, address]);
      setNewAddress({ label: "", address: "", coin: "BTC", type: "" });
      setShowAddressModal(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setWhitelistedAddresses(
      whitelistedAddresses.filter((addr) => addr.id !== id)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">보안 설정</h1>
        <p className="text-gray-600 mt-1">
          최고 수준의 보안으로 디지털 자산을 보호합니다
        </p>

        {/* 핵심 보안 기능 강조 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.586-3L12 6.414 7.414 11M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">콜드 월렛</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              인터넷과 완전히 분리된 전용 오프라인 지갑으로 자산을 안전하게
              보관합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.792.127L10.5 16.5l-3.5-3.5 1.461-2.679c.153-.633.224-1.229.127-1.792A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              MPC 지갑 적용
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              MPC 기술을 적용한 당사의 커스터디 서비스로 고객님의 디지털 자산을
              단일 키 분실이나 해킹 위험 없이 안전하게 보관합니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              IP 화이트리스트
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              IP 화이트리스트 기능으로 승인된 IP에서만 접근을 허용하여 계정 탈취
              위험을 방지합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
          보안 상태 개요
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityStatus.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <div
                  className={`p-3 rounded-full mr-4 ${getStatusColor(
                    item.color
                  )}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <div className="ml-2">{getStatusIcon(item.status)}</div>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 출금 주소 화이트리스트 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <WalletIcon className="h-6 w-6 mr-2 text-primary-600" />
              출금 주소 화이트리스트
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              사전 등록된 주소로만 출금을 허용하여 보안을 강화합니다
            </p>
          </div>
          <button
            onClick={handleShowTravelRuleWarning}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            주소 추가
          </button>
        </div>

        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  라벨
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코인
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주소 유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주소
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용 현황
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {whitelistedAddresses.map((address) => (
                <tr key={address.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {address.label}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <img
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${address.coin.toLowerCase()}.png`}
                        alt={address.coin}
                        className="w-6 h-6 rounded-full mr-2"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
                              <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#6b7280">
                                ${address.coin}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {address.coin}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        address.type === "personal"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {address.type === "personal" ? "개인지갑" : "VASP"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-mono text-gray-900">
                      {address.address.length > 20
                        ? `${address.address.slice(
                            0,
                            10
                          )}...${address.address.slice(-10)}`
                        : address.address}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(address.addedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {address.txCount}회 사용
                    </div>
                    {address.lastUsed && (
                      <div className="text-xs text-gray-500">
                        마지막: {formatDate(address.lastUsed)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {whitelistedAddresses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              등록된 출금 주소가 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2단계 인증 설정
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">2FA 활성화</p>
                <p className="text-sm text-gray-600">
                  Google Authenticator 사용
                </p>
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
                  <p className="text-sm text-green-800">
                    2FA가 성공적으로 설정되었습니다.
                  </p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            세션 관리
          </h3>

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

      {(plan === "enterprise" || plan === "premium") && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            고급 보안 설정
          </h3>

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
                  <span className="text-sm">
                    신규 주소로의 출금 시 추가 승인
                  </span>
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

      {plan === 'enterprise' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">다중 승인 정책</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">거래 승인 정책</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">1천만원 이상 거래 시 다중 승인</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">신규 주소로의 출금 시 추가 승인</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">모든 거래에 다중 승인 적용</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">IP 제한 정책</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">허용된 IP에서만 접근 허용</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">VPN 접속 차단</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">특정 국가 IP 차단</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          보안 감사 로그
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium">로그인 성공</p>
                <p className="text-xs text-gray-600">
                  2024-03-15 10:30:45 - IP: 192.168.1.100
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CogIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium">보안 설정 변경</p>
                <p className="text-xs text-gray-600">
                  2024-03-15 09:15:22 - 2FA 활성화
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium">의심스러운 로그인 시도</p>
                <p className="text-xs text-gray-600">
                  2024-03-14 23:45:12 - IP: 203.0.113.1 (차단됨)
                </p>
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

      {/* 주소 추가 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                출금 주소 추가
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAddress();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  라벨 *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: 거래소 출금 주소"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 네트워크 *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      value: "BTC",
                      name: "Bitcoin Network",
                      network: "Bitcoin",
                    },
                    {
                      value: "ETH",
                      name: "Ethereum Network",
                      network: "Ethereum",
                    },
                    { value: "SOL", name: "Solana Network", network: "Solana" },
                  ].map((coin) => (
                    <div
                      key={coin.value}
                      onClick={() =>
                        setNewAddress({ ...newAddress, coin: coin.value })
                      }
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        newAddress.coin === coin.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${coin.value.toLowerCase()}.png`}
                        alt={coin.value}
                        className="w-6 h-6 rounded-full mr-3"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
                              <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#6b7280">
                                ${coin.value}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {coin.value}
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {coin.network}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {coin.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 유형 *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setNewAddress({ ...newAddress, type: "personal" })
                    }
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      newAddress.type === "personal"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">
                        개인지갑
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      개인이 소유한 지갑 주소
                    </p>
                  </div>
                  <div
                    onClick={() =>
                      setNewAddress({ ...newAddress, type: "vasp" })
                    }
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      newAddress.type === "vasp"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">VASP</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      가상자산사업자 (거래소 등)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder="출금할 지갑 주소를 입력하세요"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">주의사항</p>
                    <p className="text-yellow-700 mt-1">
                      주소를 정확히 입력했는지 다시 한번 확인해주세요. 잘못된
                      주소로 전송된 자산은 복구가 불가능합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 트래블룰 경고 모달 */}
      {showTravelRuleWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                트래블룰 준수 안내
              </h3>
              <button
                onClick={() => setShowTravelRuleWarning(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      트래블룰 (Travel Rule) 준수 필수
                    </h4>
                    <p className="text-sm text-yellow-700">
                      100만원 이상의 가상자산 전송 시 송금인과 수취인 정보를
                      제공해야 합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">주요 확인사항</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      VASP 출금 시 트래블룰 정보 전송이 자동으로 이루어집니다.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      잘못된 주소 유형 선택 시 트래블룰 위반이 발생할 수
                      있습니다.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>참고:</strong> 주소 유형을 정확히 구분하여
                  등록해주시기 바랍니다. VASP는 거래소, 지갑 서비스 등
                  가상자산사업자를 의미하며, 개인지갑은 개인이 직접 관리하는
                  지갑 주소를 의미합니다.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowTravelRuleWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAcceptTravelRule}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                확인하고 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
