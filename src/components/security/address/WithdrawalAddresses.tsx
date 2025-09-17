"use client";

import { useState } from "react";
import { PlusIcon, WalletIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressTable from "./AddressTable";
import AddressModal from "./AddressModal";
import TravelRuleWarning from "./TravelRuleWarning";

interface WithdrawalAddressesProps {
  addresses: WhitelistedAddress[];
  onAddAddress: (formData: AddressFormData) => void;
  onDeleteAddress: (id: string) => void;
  getCoinColor: (coin: string) => string;
}

export default function WithdrawalAddresses({
  addresses,
  onAddAddress,
  onDeleteAddress,
  getCoinColor,
}: WithdrawalAddressesProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTravelRuleWarning, setShowTravelRuleWarning] = useState(false);

  const handleShowTravelRuleWarning = () => {
    setShowTravelRuleWarning(true);
  };

  const handleAcceptTravelRule = () => {
    setShowTravelRuleWarning(false);
    setShowAddressModal(true);
  };

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

      <AddressTable
        addresses={addresses}
        direction="withdrawal"
        onDelete={(id) => handleDeleteAddress(id)}
        getCoinColor={getCoinColor}
      />

      <TravelRuleWarning
        isOpen={showTravelRuleWarning}
        onClose={() => setShowTravelRuleWarning(false)}
        onAccept={handleAcceptTravelRule}
      />

      <AddressModal
        isOpen={showAddressModal}
        direction="withdrawal"
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}