"use client";

import { useState, useEffect } from "react";
import { PlusIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressModal from "./address/AddressModal";
import AddressTable from "./address/AddressTable";
import PaginationNav from "./address/PaginationNav";
import TransactionHistory from "./address/TransactionHistory";
import SearchInput from "./address/SearchInput";
import { mockAddresses } from "@/data/mockAddresses";
import { mockTransactions } from "@/data/mockTransactions";
import { TransactionFilters } from "@/types/transaction";
import {
  validateBlockchainAddress,
  checkDuplicateAddress,
  createPersonalWalletDefaults,
  resetDailyUsageIfNeeded,
  getVASPById,
  getDailyLimitStatus
} from "@/utils/addressHelpers";

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<"all" | "deposit" | "withdrawal" | "both">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "danger">("all");
  const [activeTab, setActiveTab] = useState<"personal" | "vasp" | "history">("personal");

  // 내역 탭 필터 상태
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyFilters, setHistoryFilters] = useState<TransactionFilters>({
    direction: "all",
    assetType: "all",
    status: "all"
  });

  // 페이징 상태 (각 탭별로 독립적)
  const [currentPage, setCurrentPage] = useState({
    personal: 1,
    vasp: 1,
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


  // URL 쿼리 파라미터에서 탭 설정 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['personal', 'vasp', 'history'].includes(tabParam)) {
      setActiveTab(tabParam as "personal" | "vasp" | "history");
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

  // CSV 다운로드 함수
  const downloadCSV = () => {
    try {
      // 필터링된 거래 데이터 준비
      const filteredTransactions = mockTransactions.filter(tx => {
        const matchesSearch = historySearchTerm === "" ||
          tx.hash.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          tx.assetType.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          tx.addressLabel.toLowerCase().includes(historySearchTerm.toLowerCase());

        const matchesDirection = historyFilters.direction === "all" || tx.direction === historyFilters.direction;
        const matchesAsset = historyFilters.assetType === "all" || tx.assetType === historyFilters.assetType;
        const matchesStatus = historyFilters.status === "all" || tx.status === historyFilters.status;

        return matchesSearch && matchesDirection && matchesAsset && matchesStatus;
      });

      // CSV 헤더
      const headers = [
        "거래일시",
        "방향",
        "자산",
        "금액",
        "주소 라벨",
        "거래 해시",
        "상태",
        "승인자",
        "메모"
      ];

      // CSV 데이터 생성
      const csvData = filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleString("ko-KR"),
        tx.direction === "deposit" ? "입금" : "출금",
        tx.assetType,
        tx.amount.toLocaleString(),
        tx.addressLabel,
        tx.hash,
        tx.status === "completed" ? "완료" : tx.status === "pending" ? "대기" : "실패",
        tx.approver || "-",
        tx.memo || "-"
      ]);

      // CSV 문자열 생성
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n");

      // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

      // 다운로드 실행
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `거래내역_${new Date().toLocaleDateString("ko-KR").replace(/\./g, "")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV 다운로드 실패:", error);
      alert("CSV 다운로드 중 오류가 발생했습니다.");
    }
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


  // 페이징된 데이터 가져오기
  const getPaginatedData = (data: WhitelistedAddress[], tabKey: "personal" | "vasp") => {
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
  const handlePageChange = (tabKey: "personal" | "vasp" | "history", page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [tabKey]: page
    }));
  };

  // 각 탭별 데이터
  const filteredPersonalAddresses = getFilteredAddresses("personal");
  const filteredVaspAddresses = getFilteredAddresses("vasp");
  const paginatedPersonalData = getPaginatedData(filteredPersonalAddresses, "personal");
  const paginatedVaspData = getPaginatedData(filteredVaspAddresses, "vasp");

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
          <p className="text-gray-600 mt-1">지갑 주소를 등록하고 입출금 내역을 관리합니다</p>
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

        {/* 개인 지갑 탭 컨텐츠 */}
        {activeTab === "personal" && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SearchInput
                    placeholder="주소, 라벨, 자산 검색..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
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
                <button
                  onClick={openModal}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  개인 지갑 주소 추가
                </button>
              </div>
            </div>

            {/* 주소 테이블 */}
            <div className="p-6">
              <AddressTable
                addresses={paginatedPersonalData.items}
                onDelete={handleDeleteAddress}
                getAssetColor={getAssetColor}
              />
            </div>

            {/* 페이징 네비게이션 */}
            <PaginationNav
              paginatedData={paginatedPersonalData}
              tabKey="personal"
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* VASP 지갑 탭 컨텐츠 */}
        {activeTab === "vasp" && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SearchInput
                    placeholder="주소, 라벨, 자산 검색..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
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
                <button
                  onClick={openModal}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  거래소/VASP 주소 추가
                </button>
              </div>
            </div>

            {/* 주소 테이블 */}
            <div className="p-6">
              <AddressTable
                addresses={paginatedVaspData.items}
                onDelete={handleDeleteAddress}
                getAssetColor={getAssetColor}
              />
            </div>

            {/* 페이징 네비게이션 */}
            <PaginationNav
              paginatedData={paginatedVaspData}
              tabKey="vasp"
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* 내역 탭 컨텐츠 */}
        {activeTab === "history" && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="해시, 자산, 라벨 검색..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <select
                    value={historyFilters.direction}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, direction: e.target.value as any })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 방향</option>
                    <option value="deposit">입금</option>
                    <option value="withdrawal">출금</option>
                  </select>
                  <select
                    value={historyFilters.assetType}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, assetType: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 자산</option>
                    {Array.from(new Set(mockTransactions.map(tx => tx.assetType))).sort().map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                  <select
                    value={historyFilters.status}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value as any })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 상태</option>
                    <option value="completed">완료</option>
                    <option value="pending">대기</option>
                    <option value="failed">실패</option>
                  </select>
                </div>
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  내역 다운로드 (CSV)
                </button>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-gray-500">
                  총 <span className="font-medium text-gray-900">{mockTransactions.length}</span>건
                </div>
                <div className="text-blue-600">
                  입금 <span className="font-medium">{mockTransactions.filter(tx => tx.direction === "deposit").length}</span>건
                </div>
                <div className="text-amber-600">
                  출금 <span className="font-medium">{mockTransactions.filter(tx => tx.direction === "withdrawal").length}</span>건
                </div>
              </div>
            </div>

            <div className="p-6">
              <TransactionHistory
                transactions={mockTransactions}
                getAssetColor={getAssetColor}
                currentPage={currentPage.history}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                showHeader={false}
                filters={historyFilters}
                onFiltersChange={setHistoryFilters}
                searchTerm={historySearchTerm}
                onSearchTermChange={setHistorySearchTerm}
              />
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