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

  const generateDepositAddress = (symbol: string): string => {
    // Use the same address generation logic as transactions
    return generateFromAddress(symbol);
  };

  const generateQRCode = (address: string): string => {
    // Mock QR code generation - simple text display for all assets
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

  const handleAddAsset = async () => {
    if (!selectedAsset) return;

    // Handle custom ERC-20 token
    if (selectedAsset === "CUSTOM_ERC20") {
      if (
        !customERC20.symbol ||
        !customERC20.name ||
        !customERC20.contractAddress
      ) {
        return;
      }

      // Check if contract address is valid Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(customERC20.contractAddress)) {
        alert("유효하지 않은 컨트랙트 주소입니다.");
        return;
      }

      // Validate API URL if provided
      if (customERC20.priceApiUrl && !isValidUrl(customERC20.priceApiUrl)) {
        alert("유효하지 않은 API URL입니다.");
        return;
      }

      const depositAddress = generateDepositAddress("ETH"); // ERC-20 uses ETH address

      // Try to fetch price from API if URL is provided
      let priceKRW = null;
      if (customERC20.priceApiUrl) {
        priceKRW = await fetchPriceFromApi(customERC20.priceApiUrl);
      }

      // Fallback to mock price if API fails or no URL provided
      if (!priceKRW) {
        const prices = generateMockPrice(customERC20.symbol.toUpperCase());
        priceKRW = prices.krw;
      }

      const newAsset: Asset = {
        id: Date.now().toString(),
        symbol: customERC20.symbol.toUpperCase(),
        name: customERC20.name,
        network: "Ethereum (ERC-20)",
        icon: generateTokenIcon(customERC20.symbol, customERC20.image),
        depositAddress,
        qrCode: generateQRCode(depositAddress),
        isActive: true,
        contractAddress: customERC20.contractAddress,
        priceKRW: priceKRW,
        priceUSD: priceKRW
          ? Math.floor(priceKRW / 1300)
          : generateMockPrice(customERC20.symbol).usd, // Rough conversion
        priceApiUrl: customERC20.priceApiUrl,
      };

      setAssets([...assets, newAsset]);
      setCustomERC20({
        symbol: "",
        name: "",
        contractAddress: "",
        image: "",
        priceApiUrl: "",
      });
      setImagePreview("");
      setShowCustomERC20(false);
    } else {
      // Handle standard assets
      const assetInfo = availableAssets.find((a) => a.symbol === selectedAsset);
      if (!assetInfo) return;

      const depositAddress = generateDepositAddress(selectedAsset);
      const prices = generateMockPrice(selectedAsset);
      const newAsset: Asset = {
        id: Date.now().toString(),
        symbol: selectedAsset,
        name: assetInfo.name,
        network: assetInfo.network,
        icon: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${selectedAsset.toLowerCase()}.png`,
        depositAddress,
        qrCode: generateQRCode(depositAddress),
        isActive: true,
        priceKRW: prices.krw,
        priceUSD: prices.usd,
      };

      setAssets([...assets, newAsset]);
    }

    setShowAddAsset(false);
    setSelectedAsset("");
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("이미지 파일 크기는 2MB 이하여야 합니다.");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setCustomERC20((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setCustomERC20((prev) => ({ ...prev, image: "" }));
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const generateTokenIcon = (symbol: string, imageUrl?: string) => {
    if (imageUrl) {
      return imageUrl;
    }

    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#627eea"/>
        <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white">
          ${symbol.substring(0, 4).toUpperCase()}
        </text>
      </svg>
    `)}`;
  };

  const fetchPriceFromApi = async (apiUrl: string): Promise<number | null> => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error("API 요청 실패:", response.status);
        return null;
      }

      const data = await response.json();
      // API 응답에서 KRW 가격을 추출 (일반적인 구조 가정)
      if (data.price || data.krw || data.KRW) {
        return data.price || data.krw || data.KRW;
      }

      // 중첩된 구조일 경우 (예: CoinGecko 스타일)
      if (data.market_data?.current_price?.krw) {
        return data.market_data.current_price.krw;
      }

      console.error("API 응답에서 가격 정보를 찾을 수 없습니다:", data);
      return null;
    } catch (error) {
      console.error("API 요청 오류:", error);
      return null;
    }
  };

  const generateMockPrice = (symbol: string): { krw: number; usd: number } => {
    // Mock price data based on realistic ranges for each asset
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

    // For custom ERC-20 tokens or unknown assets
    if (mockPrices[symbol]) {
      return mockPrices[symbol];
    } else {
      // Generate random prices for custom tokens
      return {
        krw: Math.floor(Math.random() * 10000 + 1000),
        usd: Math.floor(Math.random() * 1000 + 100) / 100,
      };
    }
  };

  const filteredAvailableAssets = availableAssets.filter(
    (available) => !assets.some((asset) => asset.symbol === available.symbol)
  );

  // Initialize QR codes and prices after component mount
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
  }, []);

  // Helper functions for generating realistic transaction data
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

  const generateTransactionHash = (assetSymbol: string): string => {
    switch (assetSymbol) {
      case "BTC":
        return generateRandomHex(64); // Bitcoin transaction hash
      case "ETH":
      case "USDT":
      case "USDC":
        return "0x" + generateRandomHex(64); // Ethereum transaction hash
      case "SOL":
        return generateRandomBase58(88); // Solana transaction signature
      case "MATIC":
        return "0x" + generateRandomHex(64); // Polygon transaction hash
      case "ADA":
        return generateRandomHex(64); // Cardano transaction hash
      case "DOT":
        return "0x" + generateRandomHex(64); // Polkadot transaction hash
      case "XRP":
        return generateRandomHex(64).toUpperCase(); // Ripple transaction hash
      default:
        return "0x" + generateRandomHex(64);
    }
  };

  const generateAmount = (assetSymbol: string): string => {
    switch (assetSymbol) {
      case "BTC":
        return (Math.random() * 0.5 + 0.01).toFixed(8);
      case "ETH":
        return (Math.random() * 5 + 0.1).toFixed(6);
      case "USDT":
      case "USDC":
        return (Math.random() * 10000 + 100).toFixed(2);
      case "SOL":
        return (Math.random() * 50 + 1).toFixed(4);
      case "MATIC":
        return (Math.random() * 1000 + 10).toFixed(2);
      case "ADA":
        return (Math.random() * 500 + 10).toFixed(2);
      case "DOT":
        return (Math.random() * 20 + 1).toFixed(4);
      case "XRP":
        return (Math.random() * 1000 + 10).toFixed(2);
      default:
        // For ERC-20 tokens or unknown assets, use a reasonable decimal range
        const decimals = Math.random() > 0.5 ? 2 : 6;
        return (Math.random() * 1000 + 1).toFixed(decimals);
    }
  };

  const generateFromAddress = (assetSymbol: string): string => {
    switch (assetSymbol) {
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
        return "r" + generateRandomBase58(33); // Ripple address format
      default:
        return "0x" + generateRandomHex(40);
    }
  };

  // Mock transaction data generator
  const generateMockTransactions = (assetSymbol: string): Transaction[] => {
    const transactions: Transaction[] = [];
    const statuses: ("confirmed" | "pending" | "failed")[] = [
      "confirmed",
      "confirmed",
      "confirmed",
      "pending",
      "confirmed",
    ];

    for (let i = 0; i < 5; i++) {
      const status = statuses[i];
      const timestamp = new Date(
        Date.now() -
          (i * 24 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000)
      );

      transactions.push({
        id: `tx_${assetSymbol}_${i + 1}`,
        txHash: generateTransactionHash(assetSymbol),
        amount: generateAmount(assetSymbol),
        timestamp: timestamp.toISOString(),
        status,
        confirmations:
          status === "confirmed"
            ? Math.floor(Math.random() * 100) + 6
            : Math.floor(Math.random() * 3),
        fromAddress: generateFromAddress(assetSymbol),
      });
    }

    return transactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString("ko-KR") +
      " " +
      date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "완료";
      case "pending":
        return "대기";
      case "failed":
        return "실패";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">입금 관리</h1>
          <p className="text-gray-600 mt-1">
            암호화폐 자산 입금을 위한 주소를 관리합니다
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

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">자산 추가</h3>
              <button
                onClick={() => setShowAddAsset(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가할 자산 선택
                </label>
                <select
                  value={selectedAsset}
                  onChange={(e) => {
                    setSelectedAsset(e.target.value);
                    if (e.target.value === "CUSTOM_ERC20") {
                      setShowCustomERC20(true);
                    } else {
                      setShowCustomERC20(false);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">자산을 선택하세요</option>
                  {filteredAvailableAssets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol === "CUSTOM_ERC20"
                        ? "커스텀 ERC-20 토큰"
                        : `${asset.symbol} - ${asset.name} (${asset.network})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom ERC-20 Token Form */}
              {showCustomERC20 && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900">
                    ERC-20 토큰 정보 입력
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      컨트랙트 주소 *
                    </label>
                    <input
                      type="text"
                      value={customERC20.contractAddress}
                      onChange={(e) =>
                        setCustomERC20((prev) => ({
                          ...prev,
                          contractAddress: e.target.value,
                        }))
                      }
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      이더리움 메인넷의 ERC-20 토큰 컨트랙트 주소를 입력하세요.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      토큰 이름 *
                    </label>
                    <input
                      type="text"
                      value={customERC20.name}
                      onChange={(e) =>
                        setCustomERC20((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="예: Dai Stablecoin, ChainLink Token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      토큰 심볼 *
                    </label>
                    <input
                      type="text"
                      value={customERC20.symbol}
                      onChange={(e) =>
                        setCustomERC20((prev) => ({
                          ...prev,
                          symbol: e.target.value,
                        }))
                      }
                      placeholder="예: DAI, LINK"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      토큰 아이콘 (선택사항)
                    </label>
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF 파일 (최대 2MB)
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Token preview"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <button
                                onClick={removeImage}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                title="이미지 제거"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              {customERC20.symbol ? (
                                <img
                                  src={generateTokenIcon(customERC20.symbol)}
                                  alt="Default icon"
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <div className="text-xs text-gray-400">
                                  미리보기
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      환율 API URL (선택사항)
                    </label>
                    <input
                      type="url"
                      value={customERC20.priceApiUrl}
                      onChange={(e) =>
                        setCustomERC20((prev) => ({
                          ...prev,
                          priceApiUrl: e.target.value,
                        }))
                      }
                      placeholder="https://api.example.com/price/token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      토큰의 원화(KRW) 가격을 가져올 API URL을 입력하세요.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddAsset(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddAsset}
                  disabled={
                    !selectedAsset ||
                    (selectedAsset === "CUSTOM_ERC20" &&
                      (!customERC20.symbol ||
                        !customERC20.name ||
                        !customERC20.contractAddress))
                  }
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Transaction History Modal */}
      {selectedAssetHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAssetHistory.symbol} 입금 내역
                </h3>
                <button
                  onClick={() => setShowStatusHelp(!showStatusHelp)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="상태 설명 보기"
                >
                  <QuestionMarkCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => setSelectedAssetHistory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Status Help Section */}
            {showStatusHelp && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  상태 및 확인수 설명
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-900">상태:</span>
                    <ul className="mt-1 space-y-1 ml-4">
                      <li className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full border text-green-600 bg-green-50 border-green-200">
                          완료
                        </span>
                        <span className="text-gray-700">
                          트랜잭션이 성공적으로 처리됨
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full border text-yellow-600 bg-yellow-50 border-yellow-200">
                          대기
                        </span>
                        <span className="text-gray-700">
                          블록체인에서 처리 중
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full border text-red-600 bg-red-50 border-red-200">
                          실패
                        </span>
                        <span className="text-gray-700">
                          트랜잭션 처리 실패
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">확인수:</span>
                    <ul className="mt-1 space-y-1 ml-4 text-gray-700">
                      <li>
                        <strong>예시 101/6+</strong> = 현재 101번 확인됨 / 최소
                        6번 필요
                      </li>
                      <li>확인수가 많을수록 트랜잭션이 더 안전하게 확정됨</li>
                      <li>
                        <strong>BTC:</strong> 6 확인,{" "}
                        <strong>ETH/USDT/USDC:</strong> 12 확인,{" "}
                        <strong>SOL:</strong> 32 확인 권장
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-y-auto max-h-[60vh]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        트랜잭션 해시
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        발신 주소
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        확인수
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        시간
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateMockTransactions(selectedAssetHistory.symbol).map(
                      (tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div
                              className="text-xs font-mono text-gray-900 truncate max-w-32"
                              title={tx.txHash}
                            >
                              {tx.txHash.length > 16
                                ? `${tx.txHash.substring(
                                    0,
                                    8
                                  )}...${tx.txHash.substring(
                                    tx.txHash.length - 8
                                  )}`
                                : tx.txHash}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.amount} {selectedAssetHistory.symbol}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="text-xs font-mono text-gray-600 truncate max-w-24"
                              title={tx.fromAddress}
                            >
                              {tx.fromAddress.length > 12
                                ? `${tx.fromAddress.substring(
                                    0,
                                    6
                                  )}...${tx.fromAddress.substring(
                                    tx.fromAddress.length - 6
                                  )}`
                                : tx.fromAddress}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                tx.status
                              )}`}
                            >
                              {getStatusText(tx.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {tx.confirmations}
                              {tx.status === "confirmed" ? "/6+" : "/6"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {formatTimestamp(tx.timestamp)}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
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
                        onClick={() => setSelectedAssetHistory(asset)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                        title="입금 내역 보기"
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        내역
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
  );
}
