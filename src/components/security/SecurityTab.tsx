"use client";

import { useState } from "react";
import {
  ShieldCheckIcon,
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

  return (
    <div className="space-y-6">
      {/* 보안 설정 옵션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
          보안 설정
        </h3>

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