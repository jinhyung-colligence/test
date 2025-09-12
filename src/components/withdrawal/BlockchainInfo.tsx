import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";

interface BlockchainInfoProps {
  request: WithdrawalRequest;
}

export function BlockchainInfo({ request }: BlockchainInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const getNetworkInfo = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return { name: 'Bitcoin', color: 'text-orange-600' };
      case 'ETH':
        return { name: 'Ethereum', color: 'text-blue-600' };
      case 'USDC':
      case 'USDT':
        return { name: 'Ethereum (ERC-20)', color: 'text-blue-600' };
      default:
        return { name: 'Unknown Network', color: 'text-gray-600' };
    }
  };

  const networkInfo = getNetworkInfo(request.currency);

  return (
    <div className="mt-6">
      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        블록체인 정보
      </h5>
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className={`grid grid-cols-1 gap-4 ${request.txHash ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {/* 네트워크 */}
          <div className="space-y-2">
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
                  d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 2v20M2 7l10 5 10-5"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">네트워크</span>
            </div>
            <div className={`text-sm font-medium ${networkInfo.color} bg-white px-3 py-2 rounded border`}>
              {networkInfo.name}
            </div>
          </div>

          {/* 트랜잭션 해시 */}
          {request.txHash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">트랜잭션 해시</span>
                </div>
                <button
                  onClick={() => copyToClipboard(request.txHash!, 'txHash')}
                  className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                >
                  {copiedField === 'txHash' ? '복사됨' : '복사'}
                </button>
              </div>
              <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                {request.txHash}
              </div>
            </div>
          )}

          {/* 보낸 주소 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
                <span className="text-sm font-medium text-gray-700">보낸 주소</span>
              </div>
              <button
                onClick={() => copyToClipboard(request.fromAddress, 'fromAddress')}
                className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
              >
                {copiedField === 'fromAddress' ? '복사됨' : '복사'}
              </button>
            </div>
            <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
              {request.fromAddress}
            </div>
          </div>

          {/* 받은 주소 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
                <span className="text-sm font-medium text-gray-700">받은 주소</span>
              </div>
              <button
                onClick={() => copyToClipboard(request.toAddress, 'toAddress')}
                className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
              >
                {copiedField === 'toAddress' ? '복사됨' : '복사'}
              </button>
            </div>
            <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
              {request.toAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}