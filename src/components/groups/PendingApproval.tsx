import { ClockIcon, XCircleIcon, XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { WalletGroup, ExpenseRequest } from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  formatDate,
} from "@/utils/groupsUtils";
import { useState } from "react";

interface PendingApprovalProps {
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string, reason: string) => void;
  onReapproveExpense?: (expenseId: string) => void;
}

const getCryptoIcon = (currency: string) => {
  return (
    <img
      src={getCryptoIconUrl(currency as any)}
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold';
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

export default function PendingApproval(props: PendingApprovalProps) {
  const { onApproveExpense, onRejectExpense, onReapproveExpense } = props;
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);

  const handleApproveExpense = (expenseId: string) => {
    console.log("Approving expense:", expenseId);
    if (onApproveExpense) {
      onApproveExpense(expenseId);
    }
  };

  const handleRejectExpense = (expenseId: string, reason: string) => {
    console.log("Rejecting expense:", expenseId, "Reason:", reason);
    if (onRejectExpense) {
      onRejectExpense(expenseId, reason);
    }
  };

  const handleReapproveExpense = (expenseId: string) => {
    console.log("Re-approving expense:", expenseId);
    if (onReapproveExpense) {
      onReapproveExpense(expenseId);
    }
    alert("재승인 처리되어 승인 대기 상태로 변경되었습니다.");
  };

  const pendingAndRejectedExpenses = mockExpenses.filter(
    expense => expense.status === 'pending' || expense.status === 'rejected'
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            승인 대기 중인 지출
          </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      그룹
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingAndRejectedExpenses.map((expense) => {
                    const group = mockGroups.find((g) => g.id === expense.groupId);
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {expense.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {expense.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {group?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getCryptoIcon(expense.amount.currency)}
                            <span className="font-semibold text-gray-900">
                              {formatCryptoAmount(expense.amount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(expense.requestedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.status === 'pending' ? (
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4" />
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                승인 대기
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center space-x-2">
                                <XCircleIcon className="h-4 w-4" />
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  반려됨
                                </span>
                              </div>
                              {expense.rejectedReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  {expense.rejectedReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedExpense(expense)}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              상세보기
                            </button>
                            <div className="h-4 w-px bg-gray-300"></div>
                            {expense.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveExpense(expense.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleRejectExpense(expense.id, "검토 필요")}
                                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                                >
                                  반려
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReapproveExpense(expense.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                재승인 처리
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {pendingAndRejectedExpenses.length === 0 && (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">승인 대기 중인 지출이 없습니다</p>
                  <p className="text-sm text-gray-500 mt-1">새로운 지출 요청이나 반려된 항목이 여기에 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

      {selectedExpense && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          {/* 헤더 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedExpense.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedExpense.status === 'pending' ? '승인 대기' : '반려됨'}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedExpense.title} 승인 요청
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 지출 요약 */}
              <div className="lg:col-span-1">
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  지출 요약
                </h5>
                <div className="space-y-4">
                  {/* 금액 정보 - 강화된 표시 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getCryptoIcon(selectedExpense.amount.currency)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCryptoAmount(selectedExpense.amount)}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {selectedExpense.amount.currency}
                      </div>
                      <div className="text-lg font-semibold text-primary-600">
                        ₩{(selectedExpense.amount.amount *
                          (selectedExpense.amount.currency === "BTC" ? 95000000 :
                           selectedExpense.amount.currency === "ETH" ? 4200000 :
                           selectedExpense.amount.currency === "USDC" ? 1340 :
                           selectedExpense.amount.currency === "USDT" ? 1340 : 70000000)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 상세 설명 카드 */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
                      지출 상세 설명
                    </h6>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedExpense.description}
                    </p>
                  </div>

                  {/* 기본 정보 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">신청시간</span>
                      <span className="font-medium">
                        {formatDate(selectedExpense.requestedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">기안자</span>
                      <span className="font-medium">
                        {selectedExpense.requestedBy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">카테고리</span>
                      <span className="font-medium">
                        {selectedExpense.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">그룹</span>
                      <span className="font-medium">
                        {mockGroups.find(g => g.id === selectedExpense.groupId)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 결재 정보 */}
              <div className="lg:col-span-2">
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  결재 정보
                </h5>
                <div className="space-y-4">
                  {/* 필수 결재자 승인 현황 */}
                  {selectedExpense.requiredApprovals && selectedExpense.requiredApprovals.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h6 className="text-sm font-medium text-gray-700 mb-3">
                        필수 결재자 승인 현황
                      </h6>
                      <div className="space-y-2">
                        {selectedExpense.requiredApprovals.map((approver, index) => {
                          const approval = selectedExpense.approvals?.find(a => a.userName === approver);
                          const rejection = selectedExpense.rejections?.find(r => r.userName === approver);

                          const getApprovalState = () => {
                            if (approval) {
                              return {
                                status: "approved" as const,
                                statusText: "승인 완료",
                                statusTime: formatDate(approval.approvedAt),
                                icon: (
                                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                ),
                                textColor: 'text-green-700'
                              };
                            } else if (rejection) {
                              return {
                                status: "rejected" as const,
                                statusText: "반려",
                                statusTime: formatDate(rejection.rejectedAt),
                                icon: (
                                  <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ),
                                textColor: 'text-red-700'
                              };
                            } else {
                              return {
                                status: "waiting" as const,
                                statusText: "승인 대기",
                                statusTime: null,
                                icon: (
                                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
                                  </svg>
                                ),
                                textColor: 'text-gray-500'
                              };
                            }
                          };

                          const state = getApprovalState();

                          return (
                            <div key={approver} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {state.icon}
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                                    <span className="text-sm text-gray-900 font-medium">{approver}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-medium ${state.textColor}`}>
                                  {state.statusText}
                                </span>
                                {state.statusTime && (
                                  <div className="text-xs text-gray-500">
                                    {state.statusTime}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 진행률 표시 */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            승인 진행률: {selectedExpense.approvals?.length || 0}/{selectedExpense.requiredApprovals.length}
                            {selectedExpense.rejections && selectedExpense.rejections.length > 0 && ` (반려 ${selectedExpense.rejections.length}건)`}
                          </span>
                          <span className={`font-medium ${
                            selectedExpense.status === 'rejected'
                              ? 'text-red-600'
                              : (selectedExpense.approvals?.length || 0) === selectedExpense.requiredApprovals.length
                                ? 'text-green-600'
                                : 'text-blue-600'
                          }`}>
                            {selectedExpense.status === 'rejected'
                              ? '반려됨'
                              : (selectedExpense.approvals?.length || 0) === selectedExpense.requiredApprovals.length
                                ? '결재완료'
                                : '결재진행중'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 반려 사유 상세 (반려된 경우) */}
                  {selectedExpense.status === 'rejected' && selectedExpense.rejectedReason && (
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
                          반려 사유 상세
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            반려 사유
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedExpense.rejectedAt ? formatDate(selectedExpense.rejectedAt) : formatDate(selectedExpense.requestedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">
                          {selectedExpense.rejectedReason}
                        </p>
                        <div className="text-xs text-gray-500">
                          반려자: {selectedExpense.rejectedBy || selectedExpense.approvedBy || '관리자'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex justify-end space-x-3">
                    {selectedExpense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleApproveExpense(selectedExpense.id);
                            setSelectedExpense(null);
                          }}
                          className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => {
                            handleRejectExpense(selectedExpense.id, "검토 필요");
                            setSelectedExpense(null);
                          }}
                          className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          반려
                        </button>
                      </>
                    )}
                    {selectedExpense.status === 'rejected' && (
                      <button
                        onClick={() => {
                          handleReapproveExpense(selectedExpense.id);
                          setSelectedExpense(null);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        재승인 처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}