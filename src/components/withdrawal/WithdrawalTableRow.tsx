import { WithdrawalRequest } from "@/types/withdrawal";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";

interface WithdrawalTableRowProps {
  request: WithdrawalRequest;
  onToggleDetails: (requestId: string) => void;
  showApprovalProgress?: boolean;
}

export function WithdrawalTableRow({ 
  request, 
  onToggleDetails,
  showApprovalProgress = true
}: WithdrawalTableRowProps) {
  const approvalProgress = request.requiredApprovals.length > 0 
    ? (request.approvals.length / request.requiredApprovals.length) * 100 
    : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          #{request.id}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {request.title}
          </p>
          <p className="text-sm text-gray-500">
            {request.description}
          </p>
          <p className="text-xs text-gray-400">
            {formatDateTime(request.initiatedAt)}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${request.currency.toLowerCase()}.png`}
            alt={request.currency}
            className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                    ${request.currency}
                  </text>
                </svg>
              `)}`;
            }}
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">
              {formatAmount(request.amount, request.currency)}
            </p>
            <p className="text-gray-500">
              {request.currency}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {request.initiator}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PriorityBadge priority={request.priority} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {showApprovalProgress && (request.status === "submitted" || request.status === "approved") && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {request.approvals.length}/{request.requiredApprovals.length}
              </span>
              {request.status === "approved" && (
                <span className="text-green-600 font-medium">완료</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  request.status === "approved" ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${approvalProgress}%` }}
              />
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleDetails(request.id)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            상세보기
          </button>
        </div>
      </td>
    </tr>
  );
}