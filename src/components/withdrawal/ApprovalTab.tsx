import { useState } from "react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { WithdrawalRequest } from "@/types/withdrawal";
import { getStatusInfo, getPriorityInfo, formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import { WithdrawalTableRow } from "./WithdrawalTableRow";

interface ApprovalTabProps {
  withdrawalRequests: WithdrawalRequest[];
  onApproval: (requestId: string, action: "approve" | "reject") => void;
}

export default function ApprovalTab({ withdrawalRequests, onApproval }: ApprovalTabProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const submittedRequests = withdrawalRequests.filter((r) => r.status === "submitted");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        결재 승인 대기 목록
      </h3>

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
                  승인진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submittedRequests.map((request) => (
                <WithdrawalTableRow
                  key={request.id}
                  request={request}
                  onToggleDetails={(requestId) =>
                    setSelectedRequest(
                      selectedRequest === requestId ? null : requestId
                    )
                  }
                  showApprovalActions={true}
                  onApproval={onApproval}
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
                          {request.title} 결재 승인
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

                    {/* 결재 정보 */}
                    <div className="lg:col-span-2">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        결재 정보
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              출금 주소
                            </span>
                            <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                              복사
                            </button>
                          </div>
                          <div className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border break-all">
                            {request.toAddress}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h6 className="text-sm font-medium text-gray-700 mb-3">
                            필수 결재자 승인 현황
                          </h6>
                          <div className="space-y-2">
                            {request.requiredApprovals.map((approver) => {
                              const approval = request.approvals.find(
                                (a) => a.userName === approver
                              );
                              return (
                                <div
                                  key={approver}
                                  className="flex items-center justify-between p-3 bg-white rounded border"
                                >
                                  <div className="flex items-center">
                                    {approval ? (
                                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                    ) : (
                                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                                    )}
                                    <span className="font-medium text-gray-900">
                                      {approver}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    {approval ? (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">
                                          승인 완료
                                        </span>
                                        <div className="text-xs text-gray-500">
                                          {formatDateTime(
                                            approval.approvedAt
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-sm font-medium text-yellow-700">
                                        승인 대기
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">
                            상세 설명
                          </h6>
                          <p className="text-sm text-gray-600">
                            {request.description}
                          </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() =>
                              onApproval(request.id, "approve")
                            }
                            className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() =>
                              onApproval(request.id, "reject")
                            }
                            className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            반려
                          </button>
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