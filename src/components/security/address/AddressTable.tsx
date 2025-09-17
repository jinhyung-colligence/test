"use client";

import { useState, useRef, useEffect } from "react";
import { TrashIcon, WalletIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressDirection } from "@/types/address";

interface AddressTableProps {
  addresses: WhitelistedAddress[];
  direction: AddressDirection;
  onDelete: (id: string, direction: AddressDirection) => void;
  getCoinColor: (coin: string) => string;
}

export default function AddressTable({ addresses, direction, onDelete, getCoinColor }: AddressTableProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [maxChars, setMaxChars] = useState(45);

  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45;

    const containerWidth = element.offsetWidth;
    const fontSize = 0.65;
    const basePixelSize = 16;
    const charWidth = fontSize * basePixelSize * 0.6;
    const padding = 16;
    const buttonWidth = 40;

    const availableWidth = containerWidth - padding - buttonWidth;
    const maxChars = Math.floor(availableWidth / charWidth);

    return Math.max(20, Math.min(100, maxChars));
  };

  const truncateDynamic = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) {
      return text;
    }

    const dotsLength = 3;
    const availableChars = maxChars - dotsLength;
    const frontChars = Math.ceil(availableChars * 0.65);
    const backChars = availableChars - frontChars;

    return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
  };

  useEffect(() => {
    const updateMaxChars = () => {
      setMaxChars(calculateMaxChars(fieldRef.current));
    };

    updateMaxChars();

    const observer = new ResizeObserver(() => {
      updateMaxChars();
    });

    if (fieldRef.current) {
      observer.observe(fieldRef.current);
    }

    window.addEventListener("resize", updateMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMaxChars);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          등록된 {direction === "withdrawal" ? "출금" : "입금"} 주소가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={fieldRef}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              라벨/주소
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              코인
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              타입
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              등록일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              거래수
            </th>
            {direction === "deposit" && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설정
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {addresses.map((addr) => (
            <tr key={addr.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {addr.label}
                  </div>
                  <div
                    className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all cursor-pointer hover:bg-gray-50"
                    title={addr.address}
                    onClick={() => copyToClipboard(addr.address)}
                  >
                    {truncateDynamic(addr.address, maxChars)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCoinColor(
                    addr.coin
                  )}`}
                >
                  {addr.coin}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    addr.type === "personal"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {addr.type === "personal" ? "개인" : "거래소"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(addr.addedAt).toLocaleDateString("ko-KR")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {addr.txCount}회
              </td>
              {direction === "deposit" && (
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {addr.depositSettings?.autoProcess && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        자동처리
                      </span>
                    )}
                    {addr.depositSettings?.trusted && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        신뢰주소
                      </span>
                    )}
                  </div>
                </td>
              )}
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(addr.id, direction)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}