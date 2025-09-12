import { DepositStatus } from "@/types/deposit";
import { getStatusInfo } from "@/utils/depositHelpers";

interface DepositStatusBadgeProps {
  status: DepositStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function DepositStatusBadge({
  status,
  showIcon = true,
  size = "md",
  animated = true
}: DepositStatusBadgeProps) {
  const statusInfo = getStatusInfo(status);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const isAnimated = animated && (status === "confirming" || status === "detected");

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${statusInfo.color}
        ${sizeClasses[size]}
        ${isAnimated ? "animate-pulse" : ""}
      `}
    >
      {showIcon && (
        <span className={`mr-1 ${iconSizes[size]}`}>
          {statusInfo.icon}
        </span>
      )}
      {statusInfo.name}
      
      {isAnimated && (
        <span className="ml-1">
          <svg
            className={`animate-spin h-3 w-3 ${statusInfo.textColor}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
    </span>
  );
}