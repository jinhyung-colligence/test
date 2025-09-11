import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { getStatusInfo, getPriorityInfo, formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import { RejectedTableRow } from "./RejectedTableRow";

interface RejectedTabComponentProps {
  withdrawalRequests: WithdrawalRequest[];
  onReapplication: (requestId: string) => void;
  onArchive: (requestId: string) => void;
}

export default function RejectedTabComponent({ 
  withdrawalRequests, 
  onReapplication, 
  onArchive 
}: RejectedTabComponentProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const rejectedRequests = withdrawalRequests.filter(
    (r) => r.status === "rejected" || r.status === "archived"
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          반려/보류 현황
        </h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  신청 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  출금 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  기안자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  승인진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rejectedRequests.map((request) => (
                <RejectedTableRow
                  key={request.id}
                  request={request}
                  onToggleDetails={(requestId) =>
                    setSelectedRequest(
                      selectedRequest === requestId ? null : requestId
                    )
                  }
                  onReapplication={onReapplication}
                  onArchive={onArchive}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 정보 패널 */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const request = withdrawalRequests.find(
              (r) => r.id === selectedRequest
            );
            if (!request) return null;

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getStatusInfo(request.status).color
                            }`}
                          >
                            {getStatusInfo(request.status).name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {request.title} 상세 정보
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 출금 요약 */}
                    <div className="lg:col-span-1">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        출금 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatAmount(
                                request.amount,
                                request.currency
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {request.currency}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              ₩
                              {(
                                request.amount *
                                (request.currency === "BTC"
                                  ? 95000000
                                  : request.currency === "ETH"
                                  ? 4200000
                                  : request.currency === "USDC"
                                  ? 1340
                                  : request.currency === "USDT"
                                  ? 1340
                                  : 70000000)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">신청 시간</span>
                            <span className="font-medium">
                              {formatDateTime(request.initiatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">기안자</span>
                            <span className="font-medium">
                              {request.initiator}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">우선순위</span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                getPriorityInfo(request.priority).color
                              }`}
                            >
                              {getPriorityInfo(request.priority).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 블록체인 정보 */}
                    <div className="lg:col-span-2">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        블록체인 정보
                      </h5>
                      <div className="space-y-4">
                        {request.txHash && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                트랜잭션 해시
                              </span>
                              <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                복사
                              </button>
                            </div>
                            <div className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border break-all">
                              {request.txHash}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-gray-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                  보낸 주소
                                </span>
                              </div>
                              <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                복사
                              </button>
                            </div>
                            <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                              {request.fromAddress}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-gray-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                  받은 주소
                                </span>
                              </div>
                              <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                복사
                              </button>
                            </div>
                            <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                              {request.toAddress}
                            </div>
                          </div>
                        </div>

                        {request.status === "rejected" &&
                          request.rejections.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center mb-3">
                                <svg
                                  className="w-5 h-5 text-gray-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                  출금 신청이 반려되었습니다
                                </span>
                              </div>
                              {request.rejections.map(
                                (rejection, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded border"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        반려 사유
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(
                                          rejection.rejectedAt
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-2">
                                      {rejection.reason}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                      반려자: {rejection.userName}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">
                            상세 설명
                          </h6>
                          <p className="text-sm text-gray-600">
                            {request.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}