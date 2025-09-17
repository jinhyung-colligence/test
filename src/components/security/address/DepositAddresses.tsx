"use client";

import { useState } from "react";
import { PlusIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressTable from "./AddressTable";
import AddressModal from "./AddressModal";

interface DepositAddressesProps {
  addresses: WhitelistedAddress[];
  onAddAddress: (formData: AddressFormData) => void;
  onDeleteAddress: (id: string) => void;
  getCoinColor: (coin: string) => string;
}

export default function DepositAddresses({
  addresses,
  onAddAddress,
  onDeleteAddress,
  getCoinColor,
}: DepositAddressesProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleAddAddress = (formData: AddressFormData) => {
    onAddAddress(formData);
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    onDeleteAddress(id);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowDownIcon className="h-6 w-6 mr-2 text-blue-600" />
            입금 주소 화이트리스트
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            신뢰할 수 있는 주소에서만 입금을 받아 보안을 강화합니다
          </p>
        </div>
        <button
          onClick={() => setShowAddressModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          주소 추가
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">입금 주소 화이트리스트 특징</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>자동 처리:</strong> 등록된 주소에서 오는 입금을 자동으로 처리</li>
          <li>• <strong>신뢰 주소:</strong> 별도 승인 없이 즉시 입금 처리</li>
          <li>• <strong>최소 입금액:</strong> 설정한 금액 이상만 자동 처리</li>
          <li>• <strong>알림 설정:</strong> 입금 시 즉시 알림 발송</li>
        </ul>
      </div>

      <AddressTable
        addresses={addresses}
        direction="deposit"
        onDelete={(id) => handleDeleteAddress(id)}
        getCoinColor={getCoinColor}
      />

      <AddressModal
        isOpen={showAddressModal}
        direction="deposit"
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}