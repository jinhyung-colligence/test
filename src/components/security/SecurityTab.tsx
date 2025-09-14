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
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";

interface SecurityTabProps {
  plan: ServicePlan;
}

export default function SecurityTab({ plan }: SecurityTabProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(
    plan === "enterprise"
  );
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const securityStatus = [
    {
      name: "2단계 인증",
      icon: DevicePhoneMobileIcon,
      enabled: twoFactorEnabled,
      color: twoFactorEnabled ? "green" : "red",
      description: twoFactorEnabled ? "활성화됨" : "비활성화됨",
    },
    {
      name: "IP 화이트리스트",
      icon: GlobeAltIcon,
      enabled: ipWhitelistEnabled,
      color: ipWhitelistEnabled ? "green" : "yellow",
      description: ipWhitelistEnabled ? "활성화됨" : "설정 권장",
    },
    {
      name: "세션 보안",
      icon: ClockIcon,
      enabled: true,
      color: "green",
      description: `${sessionTimeout}분 후 자동 로그아웃`,
    },
    {
      name: "패스워드 강도",
      icon: KeyIcon,
      enabled: true,
      color: "green",
      description: "강력한 패스워드 사용 중",
    },
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-50 text-green-700";
      case "yellow":
        return "bg-yellow-50 text-yellow-700";
      case "red":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
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
                    {item.enabled ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 보안 설정 옵션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 설정</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                2단계 인증 (2FA)
              </label>
              <p className="text-sm text-gray-600">
                Google Authenticator 또는 SMS를 통한 추가 보안
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

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                IP 화이트리스트
              </label>
              <p className="text-sm text-gray-600">
                특정 IP 주소에서만 접근을 허용
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ipWhitelistEnabled}
                onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
                className="sr-only peer"
                disabled={plan === "free"}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                plan === "free" ? "opacity-50 cursor-not-allowed" : ""
              }`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                세션 타임아웃
              </label>
              <p className="text-sm text-gray-600">
                비활성 시간 후 자동 로그아웃 시간
              </p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">1시간</option>
              <option value="120">2시간</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}