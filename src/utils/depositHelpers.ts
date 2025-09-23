import { DepositStatus, DepositTransaction, DepositHistory } from "@/types/deposit";

export const getStatusInfo = (status: DepositStatus) => {
  switch (status) {
    case "detected":
      return {
        name: "감지됨",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        icon: "🔵"
      };
    case "confirming":
      return {
        name: "컨펌 진행중",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600",
        icon: "🟡"
      };
    case "confirmed":
      return {
        name: "컨펌 완료",
        color: "text-sky-600 bg-sky-50 border-sky-200",
        bgColor: "bg-sky-50",
        textColor: "text-sky-600",
        icon: "🟢"
      };
    case "credited":
      return {
        name: "입금 완료",
        color: "text-sky-700 bg-sky-100 border-sky-300",
        bgColor: "bg-sky-100",
        textColor: "text-sky-700",
        icon: "✅"
      };
    case "failed":
      return {
        name: "실패",
        color: "text-red-600 bg-red-50 border-red-200",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        icon: "🔴"
      };
    default:
      return {
        name: "알 수 없음",
        color: "text-gray-600 bg-gray-50 border-gray-200",
        bgColor: "bg-gray-50",
        textColor: "text-gray-600",
        icon: "⚪"
      };
  }
};

export const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("ko-KR", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) + " " + 
  date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatAmount = (amount: string, asset: string) => {
  const num = parseFloat(amount);
  
  switch (asset) {
    case "BTC":
      return num.toFixed(8);
    case "ETH":
      return num.toFixed(6);
    case "USDC":
      return num.toFixed(2);
    case "SOL":
      return num.toFixed(4);
    default:
      return num.toFixed(6);
  }
};

export const getProgressPercentage = (current: number, required: number) => {
  return Math.min((current / required) * 100, 100);
};

export const getEstimatedTimeRemaining = (
  currentConfirmations: number,
  requiredConfirmations: number,
  averageBlockTime: number = 10 // 기본값: 10분
) => {
  const remainingConfirmations = Math.max(0, requiredConfirmations - currentConfirmations);
  return remainingConfirmations * averageBlockTime;
};

export const getNetworkInfo = (network: string) => {
  switch (network.toLowerCase()) {
    case "bitcoin":
      return {
        name: "Bitcoin",
        blockTime: 10,
        requiredConfirmations: 6,
        explorerUrl: "https://blockstream.info/tx/"
      };
    case "ethereum":
      return {
        name: "Ethereum",
        blockTime: 1,
        requiredConfirmations: 12,
        explorerUrl: "https://etherscan.io/tx/"
      };
    case "solana":
      return {
        name: "Solana",
        blockTime: 0.5,
        requiredConfirmations: 32,
        explorerUrl: "https://explorer.solana.com/tx/"
      };
    default:
      return {
        name: network,
        blockTime: 5,
        requiredConfirmations: 6,
        explorerUrl: "#"
      };
  }
};

export const generateMockDeposits = (count: number = 5): DepositTransaction[] => {
  const assets = ["BTC", "ETH", "SOL", "USDC"];
  const networks = ["Bitcoin", "Ethereum", "Solana", "Ethereum", "Ethereum"];
  const statuses: DepositStatus[] = ["detected", "confirming", "confirmed", "credited"];
  
  return Array.from({ length: count }, (_, index) => {
    const asset = assets[index % assets.length];
    const network = networks[index % networks.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const networkInfo = getNetworkInfo(network);
    const currentConfirmations = status === "credited" 
      ? networkInfo.requiredConfirmations + Math.floor(Math.random() * 10)
      : Math.floor(Math.random() * networkInfo.requiredConfirmations);
    
    const baseTime = Date.now() - (index * 30 * 60 * 1000); // 30분 간격
    
    return {
      id: `dep_${Date.now()}_${index}`,
      txHash: generateTxHash(network),
      asset,
      network,
      amount: generateAmount(asset),
      fromAddress: generateAddress(network, "from"),
      toAddress: generateAddress(network, "to"),
      status,
      currentConfirmations,
      requiredConfirmations: networkInfo.requiredConfirmations,
      detectedAt: new Date(baseTime).toISOString(),
      confirmedAt: status === "confirmed" || status === "credited" 
        ? new Date(baseTime + 10 * 60 * 1000).toISOString() 
        : undefined,
      creditedAt: status === "credited" 
        ? new Date(baseTime + 20 * 60 * 1000).toISOString() 
        : undefined,
      estimatedTime: getEstimatedTimeRemaining(
        currentConfirmations, 
        networkInfo.requiredConfirmations, 
        networkInfo.blockTime
      ),
      blockHeight: Math.floor(Math.random() * 1000000) + 800000,
      fee: generateFee(asset)
    };
  });
};

export const generateMockDepositHistory = (count: number = 20): DepositHistory[] => {
  const deposits = generateMockDeposits(count);
  
  return deposits.map((deposit, index) => ({
    ...deposit,
    status: index < 5 ? deposit.status : "credited", // 최근 5개만 진행중, 나머지는 완료
    detectedAt: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString(), // 2시간 간격
    valueInKRW: calculateKRWValue(deposit.amount, deposit.asset),
    valueInUSD: calculateUSDValue(deposit.amount, deposit.asset)
  }));
};

const generateTxHash = (network: string): string => {
  switch (network.toLowerCase()) {
    case "bitcoin":
      return generateRandomHex(64);
    case "ethereum":
      return "0x" + generateRandomHex(64);
    case "solana":
      return generateRandomBase58(88);
    default:
      return "0x" + generateRandomHex(64);
  }
};

const generateAddress = (network: string, type: "from" | "to"): string => {
  switch (network.toLowerCase()) {
    case "bitcoin":
      return "bc1q" + generateRandomHex(32);
    case "ethereum":
      return "0x" + generateRandomHex(40);
    case "solana":
      return generateRandomBase58(44);
    default:
      return "0x" + generateRandomHex(40);
  }
};

const generateAmount = (asset: string): string => {
  switch (asset) {
    case "BTC":
      return (Math.random() * 0.5 + 0.01).toFixed(8);
    case "ETH":
      return (Math.random() * 5 + 0.1).toFixed(6);
    case "USDC":
      return (Math.random() * 10000 + 100).toFixed(2);
    case "SOL":
      return (Math.random() * 50 + 1).toFixed(4);
    default:
      return (Math.random() * 1000 + 1).toFixed(6);
  }
};

const generateFee = (asset: string): string => {
  switch (asset) {
    case "BTC":
      return (Math.random() * 0.001 + 0.0001).toFixed(8);
    case "ETH":
      return (Math.random() * 0.01 + 0.001).toFixed(6);
    case "SOL":
      return (Math.random() * 0.01 + 0.00025).toFixed(6);
    default:
      return "0";
  }
};

const generateRandomHex = (length: number): string => {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
};

const generateRandomBase58 = (length: number): string => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const calculateKRWValue = (amount: string, asset: string): number => {
  const mockPrices: { [key: string]: number } = {
    BTC: 95000000,
    ETH: 4200000,
    SOL: 150000,
    USDC: 1340
  };
  
  return parseFloat(amount) * (mockPrices[asset] || 1000);
};

const calculateUSDValue = (amount: string, asset: string): number => {
  const mockPrices: { [key: string]: number } = {
    BTC: 70000,
    ETH: 3100,
    SOL: 110,
    USDC: 1
  };
  
  return parseFloat(amount) * (mockPrices[asset] || 1);
};