import { ClockIcon } from "@heroicons/react/24/outline";
import { WalletGroup, ExpenseRequest } from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  formatDate,
} from "@/utils/groupsUtils";

interface PendingApprovalProps {
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string, reason: string) => void;
  onReapproveExpense?: (expenseId: string) => void;
}

// 가상자산 아이콘 컴포넌트
const getCryptoIcon = (currency: string) => {
  return (
    <img 
      src={getCryptoIconUrl(currency as any)} 
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        // 이미지 로드 실패시 폴백
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

export default function PendingApproval({ 
  onApproveExpense, 
  onRejectExpense, 
  onReapproveExpense 
}: PendingApprovalProps) {
  
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
    // 실제로는 rejected 상태를 pending으로 변경하는 API 호출
    alert("재승인 처리되어 승인 대기 상태로 변경되었습니다.");
  };

  const pendingAndRejectedExpenses = mockExpenses.filter(
    expense => expense.status === 'pending' || expense.status === 'rejected'
  );

  return (
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
                const group = mockGroups.find(
                  (g) => g.id === expense.groupId
                );
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
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          승인 대기
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            반려됨
                          </span>
                          {expense.rejectedReason && (
                            <p className="text-xs text-red-600 mt-1">
                              {expense.rejectedReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {expense.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveExpense(expense.id)}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                            >
                              승인
                            </button>
                            <button
                              onClick={() =>
                                handleRejectExpense(expense.id, "검토 필요")
                              }
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                            >
                              반려
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReapproveExpense(expense.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
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
          
          {/* 빈 상태 */}
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
  );
}