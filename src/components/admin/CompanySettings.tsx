"use client";

import React from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

export default function CompanySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">회사 설정 관리</h1>
            <p className="text-sm text-gray-600">브랜딩 정보와 이메일 도메인을 관리하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}