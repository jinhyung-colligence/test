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

  const truncateMiddle = (text: string, frontLength: number = 8, backLength: number = 8) => {
    if (!text || text.length <= frontLength + backLength) {
      return text;
    }
    return `${text.slice(0, frontLength)}...${text.slice(-backLength)}`;
  };

  // 4단 그리드 너비에 최적화된 받은 주소 truncate 함수
  const truncateToAddress = (address: string) => {
    if (!address) return '';

    // 작은 글자크기와 4단 그리드 너비를 고려한 최적화
    if (address.length <= 30) {
      return address; // 30자 이하는 전체 표시
    }

    // 4단 그리드 내에서 최대한 표시: 앞 18자, 뒤 10자 (총 28자 + "..." = 31자)
    // 이더리움 주소 (42자): 0x742d35Cc6634C0532925...9e7595f0bEb0
    // 비트코인 주소 (62자): bc1qxy2kgdygjrsqtzq2n0y...kjhx0wlh
    return `${address.slice(0, 18)}...${address.slice(-10)}`;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {request.txHash && (
                <button
                  onClick={() => copyToClipboard(request.txHash!, 'txHash')}
                  className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                >
                  {copiedField === 'txHash' ? '복사됨' : '복사'}
                </button>
              )}
            </div>
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all" title={request.txHash || '트랜잭션 실행 전'}>
              {request.txHash ? truncateMiddle(request.txHash, 18, 10) : '트랜잭션 실행 전'}
            </div>
          </div>

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
              {request.txHash && (
                <button
                  onClick={() => copyToClipboard(request.fromAddress, 'fromAddress')}
                  className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                >
                  {copiedField === 'fromAddress' ? '복사됨' : '복사'}
                </button>
              )}
            </div>
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all" title={request.txHash ? request.fromAddress : '트랜잭션 실행 전'}>
              {request.txHash ? truncateMiddle(request.fromAddress, 18, 10) : '트랜잭션 실행 전'}
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
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all" title={request.toAddress}>
              {truncateToAddress(request.toAddress)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}