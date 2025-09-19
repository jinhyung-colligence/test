"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressModal from "./address/AddressModal";
import AddressTable from "./address/AddressTable";
import DailyLimitStatus from "./address/DailyLimitStatus";
import PaginationNav from "./address/PaginationNav";
import RemainingTime from "./address/RemainingTime";
import TransactionHistory from "./address/TransactionHistory";
import { mockAddresses } from "@/data/mockAddresses";
import { mockTransactions } from "@/data/mockTransactions";
import {
  validateBlockchainAddress,
  checkDuplicateAddress,
  createPersonalWalletDefaults,
  resetDailyUsageIfNeeded,
  getVASPById,
  getDailyLimitStatus,
  formatKRW,
  getProgressPercentage
} from "@/utils/addressHelpers";

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<"all" | "deposit" | "withdrawal" | "both">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "danger">("all");
  const [activeTab, setActiveTab] = useState<"personal" | "vasp" | "limits" | "history">("personal");

  // 페이징 상태 (각 탭별로 독립적)
  const [currentPage, setCurrentPage] = useState({
    personal: 1,
    vasp: 1,
    limits: 1,
    history: 1
  });
  const [itemsPerPage] = useState(10);

  // 검색어나 필터 변경시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(prev => ({
      ...prev,
      [activeTab]: 1
    }));
  }, [searchTerm, permissionFilter, statusFilter, activeTab]);

  // 탭 변경 시 상태 필터 초기화 (limits 탭이 아닐 때)
  useEffect(() => {
    if (activeTab !== "limits") {
      setStatusFilter("all");
    }
  }, [activeTab]);

  // URL 쿼리 파라미터에서 탭 설정 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['personal', 'vasp', 'limits', 'history'].includes(tabParam)) {
      setActiveTab(tabParam as "personal" | "vasp" | "limits" | "history");
    }
  }, []);

  // 주소 목록 로드
  useEffect(() => {
    const savedAddresses = localStorage.getItem("whitelistedAddresses");
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);

        // mock 데이터의 최신 정보로 기존 주소들을 업데이트하되, 사용자가 추가한 주소는 유지
        const updatedAddresses: WhitelistedAddress[] = [];
        const existingAddressMap = new Map<string, WhitelistedAddress>(parsedAddresses.map((addr: WhitelistedAddress) => [addr.address, addr]));

        // mock 데이터를 우선적으로 사용하여 최신 정보 적용
        mockAddresses.forEach(mockAddr => {
          const existingAddr: WhitelistedAddress | undefined = existingAddressMap.get(mockAddr.address);
          if (existingAddr) {
            // 기존 주소가 있으면 mock 데이터의 최신 정보로 업데이트 (사용자 추가 필드는 유지)
            updatedAddresses.push({
              ...mockAddr,
              id: existingAddr.id, // 기존 ID 유지
              addedAt: existingAddr.addedAt, // 추가 날짜 유지
              lastUsed: existingAddr.lastUsed, // 마지막 사용 시간 유지
            });
            existingAddressMap.delete(mockAddr.address);
          } else {
            // 새로운 mock 주소
            updatedAddresses.push(mockAddr);
          }
        });

        // 사용자가 추가한 주소들 (mock에 없는 주소들)
        existingAddressMap.forEach((userAddr: WhitelistedAddress) => {
          updatedAddresses.push(userAddr);
        });

        const finalAddresses = updatedAddresses.map(resetDailyUsageIfNeeded);
        setAddresses(finalAddresses);
        localStorage.setItem("whitelistedAddresses", JSON.stringify(finalAddresses));
      } catch (error) {
        console.error("주소 목록 로드 실패:", error);
        // 로컬 스토리지 오류 시 mock data 사용
        setAddresses(mockAddresses.map(resetDailyUsageIfNeeded));
      }
    } else {
      // 저장된 데이터가 없으면 mock data 사용
      const updatedAddresses = mockAddresses.map(resetDailyUsageIfNeeded);
      setAddresses(updatedAddresses);
      localStorage.setItem("whitelistedAddresses", JSON.stringify(updatedAddresses));
    }
  }, []);

  // 주소 목록 저장
  const saveAddresses = (newAddresses: WhitelistedAddress[]) => {
    setAddresses(newAddresses);
    localStorage.setItem("whitelistedAddresses", JSON.stringify(newAddresses));
  };

  const handleAddAddress = (formData: AddressFormData) => {
    try {
      // 주소 유효성 검증
      if (!validateBlockchainAddress(formData.address, formData.coin)) {
        alert(`유효하지 않은 ${formData.coin} 주소입니다.`);
        return;
      }

      // 중복 주소 체크
      if (checkDuplicateAddress(formData.address, addresses)) {
        alert("이미 등록된 주소입니다.");
        return;
      }

      const newAddress: WhitelistedAddress = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: formData.label,
        address: formData.address,
        coin: formData.coin,
        type: formData.type as "personal" | "vasp",
        permissions: formData.permissions,
        addedAt: new Date().toISOString(),
        txCount: 0,
        ...(formData.type === "personal" && createPersonalWalletDefaults()),
        ...(formData.type === "vasp" && formData.selectedVaspId ? (() => {
          const selectedVasp = getVASPById(formData.selectedVaspId);
          return selectedVasp ? {
            vaspInfo: {
              businessName: selectedVasp.businessName,
              travelRuleConnected: selectedVasp.travelRuleConnected,
              registrationNumber: selectedVasp.registrationNumber,
              countryCode: selectedVasp.countryCode,
              complianceScore: 5 // 등록된 VASP는 최고 점수
            }
          } : {};
        })() : {})
      };

      const updatedAddresses = [...addresses, newAddress];
      saveAddresses(updatedAddresses);
      setIsModalOpen(false);
    } catch (error) {
      console.error("주소 추가 실패:", error);
      alert("주소 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("정말로 이 주소를 삭제하시겠습니까?")) {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      saveAddresses(updatedAddresses);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };


  // 필터링된 주소 목록
  const getFilteredAddresses = (type?: "personal" | "vasp") => {
    return addresses.filter(addr => {
      const matchesType = type ? addr.type === type : true;
      const matchesSearch = searchTerm === "" ||
        addr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.coin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPermission = (() => {
        switch (permissionFilter) {
          case "deposit":
            return addr.permissions.canDeposit;
          case "withdrawal":
            return addr.permissions.canWithdraw;
          case "both":
            return addr.permissions.canDeposit && addr.permissions.canWithdraw;
          default:
            return true;
        }
      })();

      return matchesType && matchesSearch && matchesPermission;
    });
  };

  // 개인 지갑 주소 필터링 및 검색 (일일 한도 표시용)
  const getFilteredPersonalAddresses = () => {
    return addresses.filter(addr => {
      // 개인 지갑만 표시
      if (addr.type !== "personal") return false;

      // 검색어 필터링
      const matchesSearch = searchTerm === "" ||
        addr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.coin.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 상태 필터링 (limits 탭에서만 적용)
      if (activeTab === "limits" && statusFilter !== "all") {
        const limitStatus = getDailyLimitStatus(addr);
        if (!limitStatus) return false;

        const depositProgress = getProgressPercentage(limitStatus.depositUsed, limitStatus.depositLimit);
        const withdrawalProgress = getProgressPercentage(limitStatus.withdrawalUsed, limitStatus.withdrawalLimit);
        const maxProgress = Math.max(depositProgress, withdrawalProgress);

        if (statusFilter === "normal" && maxProgress >= 70) return false;
        if (statusFilter === "warning" && (maxProgress < 70 || maxProgress >= 90)) return false;
        if (statusFilter === "danger" && maxProgress < 90) return false;
      }

      return true;
    });
  };

  // 페이징된 데이터 가져오기
  const getPaginatedData = (data: WhitelistedAddress[], tabKey: "personal" | "vasp" | "limits") => {
    const startIndex = (currentPage[tabKey] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: data.slice(startIndex, endIndex),
      totalItems: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
      currentPage: currentPage[tabKey],
      itemsPerPage: itemsPerPage,
    };
  };

  // 페이지 변경 함수
  const handlePageChange = (tabKey: "personal" | "vasp" | "limits" | "history", page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [tabKey]: page
    }));
  };

  const personalAddresses = getFilteredPersonalAddresses();

  // 각 탭별 데이터
  const filteredPersonalAddresses = getFilteredAddresses("personal");
  const filteredVaspAddresses = getFilteredAddresses("vasp");
  const paginatedPersonalData = getPaginatedData(filteredPersonalAddresses, "personal");
  const paginatedVaspData = getPaginatedData(filteredVaspAddresses, "vasp");
  const paginatedLimitsData = getPaginatedData(personalAddresses, "limits");

  const getAssetColor = (asset: string) => {
    const colors: Record<string, string> = {
      BTC: "bg-orange-100 text-orange-800",
      ETH: "bg-blue-100 text-blue-800",
      SOL: "bg-purple-100 text-purple-800",
      KRW: "bg-indigo-100 text-indigo-800",
      USDC: "bg-sky-100 text-sky-800"
    };
    return colors[asset] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">주소 관리</h2>
          <p className="text-gray-600 mt-1">
            입금 및 출금 주소를 관리하고 일일 한도를 확인하세요
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "personal"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              개인 지갑 ({filteredPersonalAddresses.length})
            </button>
            <button
              onClick={() => setActiveTab("vasp")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "vasp"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              거래소/VASP ({filteredVaspAddresses.length})
            </button>
            <button
              onClick={() => setActiveTab("limits")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "limits"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              일일한도 ({personalAddresses.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              내역 ({mockTransactions.length})
            </button>
          </nav>
        </div>

        {/* 개인/VASP 지갑 탭 컨텐츠 */}
        {(activeTab === "personal" || activeTab === "vasp") && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* 주소 추가 버튼 (왼쪽) */}
                <button
                  onClick={openModal}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {activeTab === "personal" ? "개인 지갑" : "거래소/VASP"} 주소 추가
                </button>

                {/* 검색 및 필터 (오른쪽) */}
                <div className="flex items-center space-x-3">
                  {/* 검색 입력 */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="주소, 라벨, 자산 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 권한 필터 */}
                  <select
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value as "all" | "deposit" | "withdrawal" | "both")}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 권한</option>
                    <option value="deposit">입금만</option>
                    <option value="withdrawal">출금만</option>
                    <option value="both">입출금 모두</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 주소 테이블 */}
            <div className="p-6">
              <AddressTable
                addresses={activeTab === "personal" ? paginatedPersonalData.items : paginatedVaspData.items}
                onDelete={handleDeleteAddress}
                getAssetColor={getAssetColor}
              />
            </div>

            {/* 페이징 네비게이션 */}
            <PaginationNav
              paginatedData={activeTab === "personal" ? paginatedPersonalData : paginatedVaspData}
              tabKey={activeTab as "personal" | "vasp"}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* 내역 탭 컨텐츠 */}
        {activeTab === "history" && (
          <div className="p-6">
            <TransactionHistory
              transactions={mockTransactions}
              getAssetColor={getAssetColor}
              currentPage={currentPage.history}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* 개인지갑 일일한도 탭 컨텐츠 */}
        {activeTab === "limits" && (
          <>
            {/* 검색 및 필터 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                {/* 검색 및 필터 */}
                <div className="flex items-center space-x-3">
                  {/* 검색 입력 */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="지갑 이름, 자산 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 상태 필터 */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "normal" | "warning" | "danger")}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 상태</option>
                    <option value="normal">정상</option>
                    <option value="warning">경고</option>
                    <option value="danger">주의</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {personalAddresses.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            지갑 정보
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            입금 한도
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            출금 한도
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상태
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            리셋 시간
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedLimitsData.items.map(addr => {
                          const limitStatus = getDailyLimitStatus(addr);
                          if (!limitStatus) return null;

                          const depositProgress = getProgressPercentage(limitStatus.depositUsed, limitStatus.depositLimit);
                          const withdrawalProgress = getProgressPercentage(limitStatus.withdrawalUsed, limitStatus.withdrawalLimit);
                          const maxProgress = Math.max(depositProgress, withdrawalProgress);

                          const getStatusInfo = (progress: number) => {
                            if (progress >= 90) return { text: "주의", color: "bg-red-100 text-red-800" };
                            if (progress >= 70) return { text: "경고", color: "bg-amber-100 text-amber-800" };
                            return { text: "정상", color: "bg-blue-100 text-blue-800" };
                          };

                          const statusInfo = getStatusInfo(maxProgress);

                          return (
                            <tr key={addr.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {addr.label}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {addr.coin} • {addr.permissions.canDeposit && addr.permissions.canWithdraw ? "입출금" : addr.permissions.canDeposit ? "입금" : "출금"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {formatKRW(limitStatus.depositUsed)}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-gray-900">
                                      {formatKRW(limitStatus.depositLimit)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        depositProgress >= 90 ? "bg-red-500" :
                                        depositProgress >= 70 ? "bg-amber-500" : "bg-blue-500"
                                      }`}
                                      style={{ width: `${Math.min(depositProgress, 100)}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    잔여: {formatKRW(limitStatus.depositLimit - limitStatus.depositUsed)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {formatKRW(limitStatus.withdrawalUsed)}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-gray-900">
                                      {formatKRW(limitStatus.withdrawalLimit)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        withdrawalProgress >= 90 ? "bg-red-500" :
                                        withdrawalProgress >= 70 ? "bg-amber-500" : "bg-blue-500"
                                      }`}
                                      style={{ width: `${Math.min(withdrawalProgress, 100)}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    잔여: {formatKRW(limitStatus.withdrawalLimit - limitStatus.withdrawalUsed)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  사용률: {Math.round(maxProgress)}%
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <RemainingTime nextResetAt={limitStatus.nextResetAt} />
                                <div className="text-xs text-gray-500">
                                  자동 리셋
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이징 네비게이션 */}
                  <PaginationNav
                    paginatedData={paginatedLimitsData}
                    tabKey="limits"
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      등록된 개인 지갑이 없습니다
                    </h3>
                    <p className="text-gray-500">
                      개인 지갑을 먼저 추가하여 일일 한도를 확인하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 주소 추가 모달 */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}