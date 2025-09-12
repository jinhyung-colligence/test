import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { formatAmount, formatDate, formatDateTime, getStatusInfo } from "@/utils/withdrawalHelpers";

interface AuditTabProps {
  withdrawalRequests: WithdrawalRequest[];
}

export default function AuditTab({ withdrawalRequests }: AuditTabProps) {
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>("all");
  const [auditDateFilter, setAuditDateFilter] = useState<string>("all");
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [auditItemsPerPage] = useState(10);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());


  const toggleItemExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedItems(newExpanded);
  };

  const getFilteredAuditRequests = () => {
    return withdrawalRequests.filter((request) => {
      // 검색어 필터
      const matchesSearch =
        auditSearchTerm === "" ||
        request.id.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        request.initiator.toLowerCase().includes(auditSearchTerm.toLowerCase());

      // 상태 필터 - 명시적으로 처리
      const matchesStatus = auditStatusFilter === "all" || request.status === auditStatusFilter;

      // 날짜 필터
      let matchesDate = true;
      if (auditDateFilter !== "all") {
        const requestDate = new Date(request.initiatedAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (auditDateFilter) {
          case "today":
            matchesDate = requestDate >= today;
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= monthAgo;
            break;
          case "quarter":
            const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= quarterAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const getPaginatedAuditRequests = () => {
    const filtered = getFilteredAuditRequests();
    const startIndex = (auditCurrentPage - 1) * auditItemsPerPage;
    const endIndex = startIndex + auditItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / auditItemsPerPage),
    };
  };

  const paginatedData = getPaginatedAuditRequests();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              출금 감사 추적
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="신청 ID, 제목, 기안자 검색..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* 상태 필터 */}
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="submitted">출금 신청</option>
                <option value="pending">출금 대기</option>
                <option value="processing">출금 진행</option>
                <option value="completed">출금 완료</option>
                <option value="rejected">반려</option>
                <option value="archived">처리 완료</option>
                <option value="stopped">출금 중지</option>
              </select>

              {/* 기간 필터 */}
              <select
                value={auditDateFilter}
                onChange={(e) => setAuditDateFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
                <option value="quarter">최근 3개월</option>
              </select>
            </div>
          </div>

        </div>

        {/* 데이터 표시 영역 */}
        <div className="p-6">
          {paginatedData.items.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색어나 필터 조건을 시도해보세요.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">{
              paginatedData.items.map((request) => {
                const isExpanded = expandedItems.has(request.id);

                return (
                  <div
                    key={request.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* 컴팩트한 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-medium text-gray-500">
                            #{request.id}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              getStatusInfo(request.status).color
                            }`}
                          >
                            {getStatusInfo(request.status).name}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {request.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>기안자: {request.initiator}</span>
                          <span>
                            {formatAmount(
                              request.amount,
                              request.currency
                            )}{" "}
                            {request.currency}
                          </span>
                          <span>
                            {formatDate(request.initiatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* 토글 버튼 */}
                      <button
                        onClick={() => toggleItemExpanded(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        {isExpanded ? "접기" : "상세보기"}
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* 상세보기 펼침/접힘 */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* 감사 추적 히스토리 */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">
                            감사 추적 히스토리
                          </h5>
                          <div className="space-y-2">
                            {request.auditTrail.map(
                              (entry, index) => {
                                const isApprovalAction =
                                  entry.action.endsWith("승인");

                                return (
                                  <div
                                    key={index}
                                    className="flex items-start bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div
                                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                                        isApprovalAction
                                          ? "bg-green-400"
                                          : "bg-blue-400"
                                      }`}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {entry.action}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDateTime(
                                            entry.timestamp
                                          )}
                                        </p>
                                      </div>
                                      {!isApprovalAction && (
                                        <>
                                          {entry.details && (
                                            <p className="text-sm text-gray-600 mb-1">
                                              {entry.details}
                                            </p>
                                          )}
                                          {entry.userName && (
                                            <p className="text-xs text-gray-600">
                                              담당자: {entry.userName}
                                            </p>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* 블록체인 상세 정보 */}
                        {(request.status === "completed" ||
                          request.status === "processing" ||
                          request.txHash) && (
                          <div className="">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">
                              블록체인 정보
                            </h5>

                            {/* 트랜잭션 해시 */}
                            {request.txHash && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    트랜잭션 해시
                                  </span>
                                  <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                    복사
                                  </button>
                                </div>
                                <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                                  {request.txHash}
                                </div>
                              </div>
                            )}

                            {/* 주소 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    보낸 주소
                                  </span>
                                  <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                    복사
                                  </button>
                                </div>
                                <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                                  {request.fromAddress}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    받은 주소
                                  </span>
                                  <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                    복사
                                  </button>
                                </div>
                                <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                                  {request.toAddress}
                                </div>
                              </div>
                            </div>

                            {/* 블록체인 확인 정보 */}
                            {request.status === "completed" &&
                              request.blockConfirmations && (
                                <div className="pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                      블록체인 확인
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {request.blockConfirmations}회
                                      확인 완료
                                    </span>
                                  </div>
                                </div>
                              )}

                            {request.status === "processing" && (
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center text-sm">
                                  <svg
                                    className="w-4 h-4 text-yellow-500 mr-2 animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  <span className="text-gray-600">
                                    블록체인 전송 진행 중
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
              }
              </div>

              {/* 페이지네이션 */}
              {paginatedData.totalPages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                      총 {paginatedData.totalItems}개 중{" "}
                      {Math.min(
                        (auditCurrentPage - 1) * auditItemsPerPage + 1,
                        paginatedData.totalItems
                      )}
                      -{Math.min(auditCurrentPage * auditItemsPerPage, paginatedData.totalItems)}개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setAuditCurrentPage(Math.max(1, auditCurrentPage - 1))}
                        disabled={auditCurrentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      
                      {[...Array(paginatedData.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === auditCurrentPage;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setAuditCurrentPage(pageNumber)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              isCurrentPage
                                ? "bg-primary-600 text-white border-primary-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setAuditCurrentPage(Math.min(paginatedData.totalPages, auditCurrentPage + 1))}
                        disabled={auditCurrentPage === paginatedData.totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}