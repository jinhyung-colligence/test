"use client";

import { useState } from "react";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import { AddressFormData, AddressDirection } from "@/types/address";
import WithdrawalAddresses from "./address/WithdrawalAddresses";
import DepositAddresses from "./address/DepositAddresses";

export default function AddressManagement() {
  const [activeTab, setActiveTab] = useState<AddressDirection>("withdrawal");

  const {
    withdrawalAddresses,
    depositAddresses,
    addAddress,
    deleteAddress,
    getCoinColor,
  } = useAddressManagement();

  const handleAddAddress = (formData: AddressFormData) => {
    addAddress(formData);
  };

  const handleDeleteWithdrawalAddress = (id: string) => {
    deleteAddress(id, "withdrawal");
  };

  const handleDeleteDepositAddress = (id: string) => {
    deleteAddress(id, "deposit");
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("withdrawal")}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "withdrawal"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            출금 주소 관리
          </button>
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "deposit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            입금 주소 관리
          </button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "withdrawal" && (
        <WithdrawalAddresses
          addresses={withdrawalAddresses}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteWithdrawalAddress}
          getCoinColor={getCoinColor}
        />
      )}

      {activeTab === "deposit" && (
        <DepositAddresses
          addresses={depositAddresses}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteDepositAddress}
          getCoinColor={getCoinColor}
        />
      )}
    </div>
  );
}