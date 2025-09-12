import React, { useState } from 'react';
import { 
  CogIcon, 
  BellIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { PolicyManagement } from './PolicyManagement';
import { NotificationCenter } from './NotificationCenter';
import { ApprovalPolicyDisplay } from './ApprovalPolicyDisplay';

type ModalType = 'none' | 'policy' | 'notification' | 'policyDisplay' | 'rules';

export function ManagementMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  const menuItems = [
    {
      key: 'policyDisplay',
      label: '정책 표시',
      description: '현재 적용된 결재 정책 확인',
      icon: DocumentTextIcon,
      onClick: () => setActiveModal('policyDisplay')
    },
    {
      key: 'policy',
      label: '정책 관리',
      description: '결재 정책 설정 및 관리',
      icon: ShieldCheckIcon,
      onClick: () => setActiveModal('policy')
    },
    {
      key: 'notification',
      label: '알림 센터',
      description: '알림 설정 및 로그 확인',
      icon: BellIcon,
      onClick: () => setActiveModal('notification')
    }
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    item.onClick();
    setIsOpen(false);
  };

  const closeModal = () => {
    setActiveModal('none');
  };

  return (
    <>
      {/* Menu Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <CogIcon className="h-5 w-5 mr-2" />
          관리 도구
          <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                출금 관리 도구
              </div>
              
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </button>
                );
              })}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="px-3 py-2 text-xs text-gray-400">
                  💡 새로운 결재 시스템 기능들을 확인해보세요
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modals */}
      {activeModal === 'policy' && (
        <PolicyManagement onPolicyChange={() => {}} />
      )}

      {activeModal === 'notification' && (
        <NotificationCenter onClose={closeModal} />
      )}

      {activeModal === 'policyDisplay' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-5/6 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">결재 정책 표시</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">예시: KRW 1억원 거래</h3>
                  <ApprovalPolicyDisplay 
                    amount={100000000} 
                    currency="KRW" 
                    transactionType="cross_border"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">예시: BTC 5 거래</h3>
                  <ApprovalPolicyDisplay 
                    amount={5} 
                    currency="BTC"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">USD 전체 정책 보기</h3>
                  <ApprovalPolicyDisplay 
                    amount={50000} 
                    currency="USD" 
                    showAllPolicies={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}