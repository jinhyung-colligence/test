"use client";

import { useState } from "react";
import {
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import AdminIPWhitelistManagement from "./AdminIPWhitelistManagement";
import AuthenticatorManagement from "./AuthenticatorManagement";
import AdminAccessMonitoring from "./AdminAccessMonitoring";

interface SecurityTabProps {
  plan: ServicePlan;
}

export default function SecurityTab({ plan }: SecurityTabProps) {
  // 정책 설정 (시스템 전체)
  const [authenticatorPolicyEnabled, setAuthenticatorPolicyEnabled] = useState(true);
  const [smsPolicyEnabled, setSmsPolicyEnabled] = useState(false);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(
    plan === "enterprise"
  );
  const [sessionTimeout, setSessionTimeout] = useState("30");

  // 개인 설정 (현재 관리자) - Google Authenticator만
  const [authenticatorPersonalEnabled, setAuthenticatorPersonalEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* 보안 설정 옵션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
          관리자 보안 정책
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          시스템 전체 관리자들에게 적용될 보안 정책을 설정합니다. 정책이 활성화되면 모든 관리자가 해당 인증 방법을 설정해야 합니다.
        </p>

        <div className="space-y-6">
          {/* Google Authenticator */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-900">
                  Google Authenticator 정책
                </label>
                {authenticatorPolicyEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    필수 적용
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                모든 관리자에게 Google Authenticator 설정을 필수로 요구
              </p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={authenticatorPolicyEnabled}
                  onChange={(e) => setAuthenticatorPolicyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* SMS 인증 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-900">
                  SMS 인증 정책
                </label>
                {smsPolicyEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    필수 적용
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                로그인 시 모든 관리자에게 SMS 인증을 요구 (전화번호는 로그인 시 입력)
              </p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsPolicyEnabled}
                  onChange={(e) => setSmsPolicyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-900">
                  관리자 IP 접근 제어
                </label>
                {ipWhitelistEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    활성화됨
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                허용된 IP 대역에서만 관리자 페이지 접근 가능
              </p>
            </div>
            <div className="flex items-center">
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
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900 block mb-1">
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

      {/* Google Authenticator 관리 */}
      <AuthenticatorManagement
        isVisible={true}
        onClose={() => {}}
        initialEnabled={authenticatorPersonalEnabled}
        onStatusChange={setAuthenticatorPersonalEnabled}
        policyEnabled={authenticatorPolicyEnabled}
      />


      {/* 관리자 IP 접근 제어 */}
      <AdminIPWhitelistManagement
        isVisible={true}
        onClose={() => {}}
      />

      {/* 관리자 접근 모니터링 */}
      <AdminAccessMonitoring
        isVisible={true}
        onClose={() => {}}
      />
    </div>
  );
}