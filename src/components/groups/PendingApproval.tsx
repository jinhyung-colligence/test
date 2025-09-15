import { ClockIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
                {selectedExpense.status === 'pending' ? (
                  <>
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      승인 대기
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      반려됨
                    </span>
                  </>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedExpense.title} 승인 요청
                </h3>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 지출 요약 */}
              <div className="lg:col-span-1 space-y-6">
                {/* 금액 정보 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">지출 금액</h4>
                  <div className="flex items-center space-x-3">
                    {getCryptoIcon(selectedExpense.amount.currency)}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCryptoAmount(selectedExpense.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{selectedExpense.amount.currency}</p>
                    </div>
                  </div>
                </div>

                {/* 설명 카드 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">지출 설명</h4>
                  <p className="text-sm text-gray-700">{selectedExpense.description}</p>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">신청시간</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedExpense.requestedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">기안자</label>
                    <p className="text-sm text-gray-900">{selectedExpense.requestedBy}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">카테고리</label>
                    <p className="text-sm text-gray-900">{selectedExpense.category}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">그룹</label>
                    <p className="text-sm text-gray-900">
                      {mockGroups.find(g => g.id === selectedExpense.groupId)?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 승인 정보 */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">승인 정보</h4>

                  {/* 반려 사유 (반려된 경우) */}
                  {selectedExpense.status === 'rejected' && selectedExpense.rejectedReason && (
                    <div className="bg-red-50 rounded-lg p-4 mb-6">
                      <h5 className="text-sm font-medium text-red-900 mb-2">반려 사유</h5>
                      <p className="text-sm text-red-700">{selectedExpense.rejectedReason}</p>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex space-x-3">
                    {selectedExpense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleApproveExpense(selectedExpense.id);
                            setSelectedExpense(null);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => {
                            handleRejectExpense(selectedExpense.id, "검토 필요");
                            setSelectedExpense(null);
                          }}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
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
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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