"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { DepositTransaction, DepositHistory } from "@/types/deposit";
import { generateMockDeposits, generateMockDepositHistory } from "@/utils/depositHelpers";
import DepositProgressCard from "./deposit/DepositProgressCard";
import DepositHistoryTable from "./deposit/DepositHistoryTable";
import DepositStatistics from "./deposit/DepositStatistics";

interface DepositManagementProps {
  plan: ServicePlan;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  depositAddress: string;
  qrCode: string;
  isActive: boolean;
  contractAddress?: string; // ERC-20 토큰용 컨트랙트 주소
  priceKRW?: number; // 원화 가격
  priceUSD?: number; // 달러 가격
  priceApiUrl?: string; // 환율 API URL
}

interface Transaction {
  id: string;
  txHash: string;
  amount: string;
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
  confirmations: number;
  fromAddress: string;
}

export default function DepositManagement({ plan }: DepositManagementProps) {
  // 진행 중인 입금 상태
  const [activeDeposits, setActiveDeposits] = useState<DepositTransaction[]>([]);
  // 입금 히스토리 상태
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([]);
  
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      symbol: "BTC",
      name: "Bitcoin",
      network: "Bitcoin",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png",
      depositAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      qrCode: "",
      isActive: true,
    },
    {
      id: "2",
      symbol: "ETH",
      name: "Ethereum",
      network: "Ethereum",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png",
      depositAddress: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
      qrCode: "",
      isActive: true,
    },
    {
      id: "3",
      symbol: "SOL",
      name: "Solana",
      network: "Solana",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png",
      depositAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      qrCode: "",
      isActive: true,
    },
    {
      id: "4",
      symbol: "USDT",
      name: "Tether",
      network: "Ethereum (ERC-20)",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdt.png",
      depositAddress: "0x8ba1f109551bd432803012645hac136c6ad4cfc7",
      qrCode: "",
      isActive: true,
    },
    {
      id: "5",
      symbol: "USDC",
      name: "USD Coin",
      network: "Ethereum (ERC-20)",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdc.png",
      depositAddress: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
      qrCode: "",
      isActive: true,
    },
  ]);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const [selectedQR, setSelectedQR] = useState<Asset | null>(null);
  const [selectedAssetHistory, setSelectedAssetHistory] =
    useState<Asset | null>(null);
  const [showStatusHelp, setShowStatusHelp] = useState<boolean>(false);
  const [showCustomERC20, setShowCustomERC20] = useState<boolean>(false);
  const [customERC20, setCustomERC20] = useState({
    symbol: "",
    name: "",
    contractAddress: "",
    image: "",
    priceApiUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const availableAssets = [
    { symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum", network: "Ethereum" },
    { symbol: "SOL", name: "Solana", network: "Solana" },
    { symbol: "USDC", name: "USD Coin", network: "Ethereum (ERC-20)" },
    { symbol: "USDT", name: "Tether", network: "Ethereum (ERC-20)" },
    { symbol: "MATIC", name: "Polygon", network: "Polygon" },
    { symbol: "ADA", name: "Cardano", network: "Cardano" },
    { symbol: "DOT", name: "Polkadot", network: "Polkadot" },
    { symbol: "XRP", name: "Ripple", network: "XRP Ledger" },
    {
      symbol: "CUSTOM_ERC20",
      name: "Custom ERC-20 Token",
      network: "Ethereum (ERC-20)",
    },
  ];

  // Helper functions from the original code
  const generateDepositAddress = (symbol: string): string => {
    return generateFromAddress(symbol);
  };

  const generateQRCode = (address: string): string => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fff"/>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">${address.substring(
          0,
          10
        )}...</text>
      </svg>
    `)}`;
  };

  const generateFromAddress = (symbol: string): string => {
    const generateRandomHex = (length: number) => {
      return Array.from({ length }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    };

    const generateRandomBase58 = (length: number) => {
      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    switch (symbol) {
      case "BTC":
        return "bc1q" + generateRandomHex(32);
      case "ETH":
      case "USDT":
      case "USDC":
      case "MATIC":
        return "0x" + generateRandomHex(40);
      case "SOL":
        return generateRandomBase58(44);
      case "ADA":
        return "addr1" + generateRandomBase58(50);
      case "DOT":
        return "1" + generateRandomBase58(47);
      case "XRP":
        return "r" + generateRandomBase58(33);
      default:
        return "0x" + generateRandomHex(40);
    }
  };

  const generateMockPrice = (symbol: string): { krw: number; usd: number } => {
    const mockPrices: { [key: string]: { krw: number; usd: number } } = {
      BTC: {
        krw: Math.floor(Math.random() * 10000000 + 60000000),
        usd: Math.floor(Math.random() * 5000 + 45000),
      },
      ETH: {
        krw: Math.floor(Math.random() * 1000000 + 3000000),
        usd: Math.floor(Math.random() * 500 + 2300),
      },
      SOL: {
        krw: Math.floor(Math.random() * 50000 + 100000),
        usd: Math.floor(Math.random() * 50 + 75),
      },
      USDT: { krw: Math.floor(Math.random() * 50 + 1300), usd: 1 },
      USDC: { krw: Math.floor(Math.random() * 50 + 1300), usd: 1 },
      MATIC: {
        krw: Math.floor(Math.random() * 200 + 800),
        usd: Math.floor(Math.random() * 20 + 60) / 100,
      },
      ADA: {
        krw: Math.floor(Math.random() * 200 + 500),
        usd: Math.floor(Math.random() * 30 + 35) / 100,
      },
      DOT: {
        krw: Math.floor(Math.random() * 2000 + 8000),
        usd: Math.floor(Math.random() * 200 + 600) / 100,
      },
      XRP: {
        krw: Math.floor(Math.random() * 200 + 700),
        usd: Math.floor(Math.random() * 40 + 50) / 100,
      },
    };

    if (mockPrices[symbol]) {
      return mockPrices[symbol];
    } else {
      return {
        krw: Math.floor(Math.random() * 10000 + 1000),
        usd: Math.floor(Math.random() * 1000 + 100) / 100,
      };
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setAssets(assets.filter((asset) => asset.id !== assetId));
  };

  // Initialize QR codes, prices, and mock deposit data after component mount
  useEffect(() => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const prices = generateMockPrice(asset.symbol);
        return {
          ...asset,
          qrCode: asset.qrCode || generateQRCode(asset.depositAddress),
          priceKRW: prices.krw,
          priceUSD: prices.usd,
        };
      })
    );
    
    // 초기 Mock 데이터 생성
    setActiveDeposits(generateMockDeposits(5));
    setDepositHistory(generateMockDepositHistory(20));
  }, []);
  
  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDeposits(prevDeposits => 
        prevDeposits.map(deposit => {
          // 진행 중인 상태만 업데이트
          if (deposit.status === "confirming" && deposit.currentConfirmations < deposit.requiredConfirmations) {
            const newConfirmations = Math.min(
              deposit.currentConfirmations + Math.floor(Math.random() * 2) + 1,
              deposit.requiredConfirmations + 2
            );
            
            let newStatus = deposit.status as any;
            if (newConfirmations >= deposit.requiredConfirmations) {
              newStatus = Math.random() > 0.1 ? "confirmed" : "credited";
            }
            
            return {
              ...deposit,
              currentConfirmations: newConfirmations,
              status: newStatus as any,
              confirmedAt: newStatus === "confirmed" || newStatus === "credited" 
                ? new Date().toISOString() 
                : deposit.confirmedAt,
              creditedAt: newStatus === "credited" 
                ? new Date().toISOString()
                : deposit.creditedAt
            };
          }
          
          // confirmed 상태를 credited로 전환
          if (deposit.status === "confirmed" && Math.random() < 0.3) {
            return {
              ...deposit,
              status: "credited" as any,
              creditedAt: new Date().toISOString()
            };
          }
          
          return deposit;
        })
      );
      
      // 새로운 입금 감지 시뮬레이션 (5% 확률)
      if (Math.random() < 0.05) {
        const newDeposit = generateMockDeposits(1)[0];
        setActiveDeposits(prev => [newDeposit, ...prev.slice(0, 9)]); // 최대 10개 유지
      }
    }, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  const filteredAvailableAssets = availableAssets.filter(
    (available) => !assets.some((asset) => asset.symbol === available.symbol)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">입금 관리</h1>
          <p className="text-gray-600 mt-1">
            암호화폐 자산 입금 주소 관리 및 진행 상황 추적
          </p>
        </div>
        <button
          onClick={() => setShowAddAsset(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          자산 추가
        </button>
      </div>
      
      
      {/* 진행 중인 입금 현황 */}
      {activeDeposits.filter(d => d.status !== "credited").length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">진행 중인 입금</h2>
            <span className="text-sm text-gray-500">
              실시간 업데이트 중 • {activeDeposits.filter(d => d.status !== "credited").length}건
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeposits
              .filter(deposit => deposit.status !== "credited")
              .slice(0, 6)
              .map((deposit) => (
                <DepositProgressCard
                  key={deposit.id}
                  deposit={deposit}
                  onViewDetails={(depositId) => {
                    // 상세 정보 모달 열기 로직
                    console.log("View details for:", depositId);
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* 입금 주소 관리 섹션 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">입금 주소 관리</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자산
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    네트워크
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    입금 주소
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    환율
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={asset.icon}
                          alt={asset.symbol}
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="20" fill="#f3f4f6"/>
                                <text x="20" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#6b7280">
                                  ${asset.symbol}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.name}
                          </div>
                          {asset.contractAddress && (
                            <div
                              className="text-xs font-mono text-gray-400 truncate max-w-32"
                              title={asset.contractAddress}
                            >
                              {asset.contractAddress.substring(0, 8)}...
                              {asset.contractAddress.substring(
                                asset.contractAddress.length - 6
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.network}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 max-w-xs">
                        <div className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 truncate">
                          {asset.depositAddress}
                        </div>
                        <button
                          onClick={() => handleCopyAddress(asset.depositAddress)}
                          className="p-2 text-gray-500 hover:text-primary-600 transition-colors flex-shrink-0"
                          title="주소 복사"
                        >
                          {copiedAddress === asset.depositAddress ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₩{asset.priceKRW?.toLocaleString() || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedQR(asset)}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          title="QR 코드 보기"
                        >
                          <QrCodeIcon className="h-4 w-4 mr-1" />
                          QR
                        </button>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="자산 제거"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {assets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <PlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              자산이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              첫 번째 자산을 추가하여 입금을 시작하세요
            </p>
            <button
              onClick={() => setShowAddAsset(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              자산 추가
            </button>
          </div>
        )}
      </div>
      
      {/* 입금 히스토리 섹션 */}
      <div>
        <DepositHistoryTable deposits={depositHistory} />
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedQR.symbol} 입금 QR 코드
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedQR.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">입금 주소</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {selectedQR.depositAddress}
                </p>
              </div>

              <button
                onClick={() => handleCopyAddress(selectedQR.depositAddress)}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {copiedAddress === selectedQR.depositAddress ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    복사됨
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                    주소 복사
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}